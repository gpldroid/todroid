/* Web2App Studio Pro - Professional Android Project Export Engine */
(function () {
  'use strict';

  function value(id, fallback) {
    var el = document.getElementById(id);
    return el ? el.value : fallback;
  }
  function enabled(id, fallback) {
    var el = document.getElementById(id);
    return el ? !!el.checked : fallback;
  }
  function xml(v) {
    return String(v == null ? '' : v).replace(/[<>&'"]/g, function (c) {
      return ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'})[c];
    });
  }
  function java(v) {
    return JSON.stringify(String(v == null ? '' : v));
  }
  function pkg(raw) {
    var p = String(raw || 'com.web2app.app').toLowerCase().replace(/[^a-z0-9_.]/g, '');
    p = p.replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
    var parts = p.split('.').filter(Boolean).map(function (x) {
      return /^[a-z_]/.test(x) ? x : 'app' + x;
    });
    if (parts.length < 2) return 'com.web2app.' + (parts[0] || 'app');
    return parts.join('.');
  }
  function versionCode(v) {
    var m = String(v || '1.0.0').match(/\d+/g) || ['1','0','0'];
    return Math.max(1, Math.min(2100000000, Number(m[0]) * 10000 + Number(m[1] || 0) * 100 + Number(m[2] || 0)));
  }
  function orientation() {
    var v = value('app-orientation', 'portrait');
    return v === 'landscape' ? 'landscape' : v === 'sensor' ? 'fullSensor' : 'portrait';
  }
  function config() {
    return {
      name: value('app-name', 'My Web App').trim() || 'My Web App',
      url: value('app-url', 'https://example.com').trim() || 'https://example.com',
      pkg: pkg(value('app-package', 'com.web2app.app')),
      version: value('app-version', '1.0.0').trim() || '1.0.0',
      color: value('primary-color', '#4f46e5'),
      splash: value('splash-bg-color', '#080a11'),
      tagline: value('splash-tagline', 'Powered by Web2App Studio Pro').trim(),
      camera: enabled('feat-camera', true),
      location: enabled('feat-location', false),
      pullRefresh: enabled('feat-pull-refresh', true),
      bottomNav: enabled('feat-bottom-nav', true),
      icon: window.state && window.state.iconUrl ? window.state.iconUrl : ''
    };
  }
  function javaPath(p) { return p.replace(/\./g, '/'); }

  function manifest(c) {
    var p = [
      '    <uses-permission android:name="android.permission.INTERNET" />',
      '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />'
    ];
    if (c.camera) {
      p.push('    <uses-permission android:name="android.permission.CAMERA" />');
      p.push('    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
    }
    if (c.location) {
      p.push('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />');
      p.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
    }
    return [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="' + xml(c.pkg) + '">',
      p.join('\n'),
      '    <application android:allowBackup="true" android:hardwareAccelerated="true" android:icon="@drawable/ic_launcher" android:label="' + xml(c.name) + '" android:roundIcon="@drawable/ic_launcher" android:supportsRtl="true" android:usesCleartextTraffic="false" android:theme="@style/AppTheme">',
      '        <activity android:name=".MainActivity" android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode" android:exported="true" android:screenOrientation="' + orientation() + '">',
      '            <intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter>',
      '        </activity>',
      '    </application>',
      '</manifest>'
    ].join('\n');
  }

  function mainActivity(c) {
    var lines = [
      'package ' + c.pkg + ';',
      '',
      'import android.Manifest;',
      'import android.content.Intent;',
      'import android.content.pm.PackageManager;',
      'import android.graphics.Color;',
      'import android.net.Uri;',
      'import android.os.Build;',
      'import android.os.Bundle;',
      'import android.webkit.CookieManager;',
      'import android.webkit.GeolocationPermissions;',
      'import android.webkit.PermissionRequest;',
      'import android.webkit.ValueCallback;',
      'import android.webkit.WebChromeClient;',
      'import android.webkit.WebResourceError;',
      'import android.webkit.WebResourceRequest;',
      'import android.webkit.WebSettings;',
      'import android.webkit.WebView;',
      'import android.webkit.WebViewClient;',
      'import androidx.annotation.Nullable;',
      'import androidx.appcompat.app.AppCompatActivity;',
      '',
      'public class MainActivity extends AppCompatActivity {',
      '    private static final int REQUEST_MEDIA = 4101;',
      '    private static final int REQUEST_LOCATION = 4102;',
      '    private static final int FILE_CHOOSER = 4103;',
      '    private WebView webView;',
      '    private ValueCallback<Uri[]> fileCallback;',
      '    private PermissionRequest pendingWebPermission;',
      '    private GeolocationPermissions.Callback pendingGeoCallback;',
      '    private String pendingGeoOrigin;',
      '',
      '    @Override protected void onCreate(Bundle savedInstanceState) {',
      '        super.onCreate(savedInstanceState);',
      '        getWindow().setStatusBarColor(Color.parseColor(' + java(c.color) + '));',
      '        webView = new WebView(this);',
      '        setContentView(webView);',
      '        configureWebView();',
      '        if (savedInstanceState == null) webView.loadUrl(' + java(c.url) + ');',
      '        else webView.restoreState(savedInstanceState);',
      '    }',
      '',
      '    private void configureWebView() {',
      '        WebSettings s = webView.getSettings();',
      '        s.setJavaScriptEnabled(true);',
      '        s.setDomStorageEnabled(true);',
      '        s.setDatabaseEnabled(true);',
      '        s.setAllowFileAccess(false);',
      '        s.setAllowContentAccess(true);',
      '        s.setSupportZoom(false);',
      '        s.setMediaPlaybackRequiresUserGesture(false);',
      '        s.setGeolocationEnabled(' + String(c.location) + ');',
      '        CookieManager.getInstance().setAcceptCookie(true);',
      '        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);',
      '        webView.setBackgroundColor(Color.WHITE);',
      '        webView.setWebViewClient(new WebViewClient() {',
      '            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {',
      '                Uri u = request.getUrl(); String scheme = u.getScheme();',
      '                if ("http".equals(scheme) || "https".equals(scheme)) return false;',
      '                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}',
      '                return true;',
      '            }',
      '            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {',
      '                if (request.isForMainFrame()) view.loadDataWithBaseURL(null, "<html><body style=" + "'font-family:sans-serif;padding:32px;text-align:center'" + "><h2>Connection problem</h2><p>Please check your connection and try again.</p></body></html>", "text/html", "UTF-8", null);',
      '            }',
      '        });',
      '        webView.setWebChromeClient(new WebChromeClient() {',
      '            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {',
      '                fileCallback = callback;',
      '                try { startActivityForResult(params.createIntent(), FILE_CHOOSER); } catch (Exception e) { fileCallback = null; callback.onReceiveValue(null); }',
      '                return true;',
      '            }',
      '            @Override public void onPermissionRequest(final PermissionRequest request) {',
      '                runOnUiThread(new Runnable() { public void run() {',
      '                    pendingWebPermission = request;',
      '                    java.util.ArrayList<String> permissions = new java.util.ArrayList<>();',
      '                    for (String resource : request.getResources()) {',
      '                        if (' + String(c.camera) + ' && PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) permissions.add(Manifest.permission.CAMERA);',
      '                        if (' + String(c.camera) + ' && PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) permissions.add(Manifest.permission.RECORD_AUDIO);',
      '                    }',
      '                    if (permissions.isEmpty()) { request.deny(); pendingWebPermission = null; return; }',
      '                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) requestPermissions(permissions.toArray(new String[0]), REQUEST_MEDIA); else request.grant(request.getResources());',
      '                }});',
      '            }',
      '            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {',
      '                if (!' + String(c.location) + ') { callback.invoke(origin, false, false); return; }',
      '                pendingGeoOrigin = origin; pendingGeoCallback = callback;',
      '                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION}, REQUEST_LOCATION);',
      '                else callback.invoke(origin, true, false);',
      '            }',
      '        });',
      '    }',
      '',
      '    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {',
      '        super.onRequestPermissionsResult(requestCode, permissions, results);',
      '        if (requestCode == REQUEST_MEDIA && pendingWebPermission != null) {',
      '            boolean ok = results.length > 0;',
      '            for (int result : results) if (result != PackageManager.PERMISSION_GRANTED) ok = false;',
      '            if (ok) pendingWebPermission.grant(pendingWebPermission.getResources()); else pendingWebPermission.deny();',
      '            pendingWebPermission = null;',
      '        }',
      '        if (requestCode == REQUEST_LOCATION && pendingGeoCallback != null) {',
      '            boolean ok = false; for (int result : results) if (result == PackageManager.PERMISSION_GRANTED) ok = true;',
      '            pendingGeoCallback.invoke(pendingGeoOrigin, ok, false); pendingGeoCallback = null; pendingGeoOrigin = null;',
      '        }',
      '    }',
      '',
      '    @Override protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {',
      '        super.onActivityResult(requestCode, resultCode, data);',
      '        if (requestCode == FILE_CHOOSER && fileCallback != null) { fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data)); fileCallback = null; }',
      '    }',
      '    @Override protected void onSaveInstanceState(Bundle outState) { webView.saveState(outState); super.onSaveInstanceState(outState); }',
      '    @Override public void onBackPressed() { if (webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }',
      '    @Override protected void onDestroy() { if (webView != null) { webView.stopLoading(); webView.setWebChromeClient(null); webView.setWebViewClient(null); webView.destroy(); } super.onDestroy(); }',
      '}'
    ];
    return lines.join('\n');
  }

  function rootGradle() {
    return "plugins { id 'com.android.application' version '8.7.3' apply false }\n";
  }
  function settingsGradle(c) {
    var name = c.name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40) || 'Web2AppProject';
    return "import org.gradle.api.initialization.resolve.RepositoriesMode\n\npluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\ndependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }\nrootProject.name = '" + name.replace(/'/g, '') + "'\ninclude ':app'\n";
  }
  function appGradle(c) {
    return "plugins { id 'com.android.application' }\n\nandroid {\n    namespace '" + c.pkg + "'\n    compileSdk 35\n    defaultConfig {\n        applicationId '" + c.pkg + "'\n        minSdk 24\n        targetSdk 35\n        versionCode " + versionCode(c.version) + "\n        versionName '" + c.version.replace(/'/g, '') + "'\n    }\n    buildTypes { release { minifyEnabled false; shrinkResources false; proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro' } }\n}\n\ndependencies {\n    implementation 'androidx.appcompat:appcompat:1.7.0'\n    implementation 'androidx.webkit:webkit:1.12.1'\n}\n";
  }
  function readme(c) {
    return "# " + c.name + " - Web2App Studio Pro\n\nGenerated Android Studio project.\n\nTarget URL: " + c.url + "\nPackage: " + c.pkg + "\nVersion: " + c.version + "\nTarget SDK: 35\nMin SDK: 24\nOrientation: " + orientation() + "\nCamera & files: " + (c.camera ? 'enabled' : 'disabled') + "\nLocation: " + (c.location ? 'enabled' : 'disabled') + "\n\n## Build\nOpen the project in Android Studio, use JDK 17, sync Gradle, then build a debug APK. For distribution, configure a release keystore and build an APK/AAB.\n\nThe browser Studio exports source code; it does not fabricate or compile an APK binary.\n";
  }
  function iconXml(c) {
    return '<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><path android:fillColor="' + xml(c.color) + '" android:pathData="M54,4A50,50 0,1 0,54 104A50,50 0,1 0,54 4"/><path android:fillColor="#FFFFFFFF" android:pathData="M32,35h44v10H32zM32,49h44v10H32zM32,63h28v10H32z"/></vector>';
  }
  function writeProject() {
    if (typeof JSZip === 'undefined') { showToast('ZIP engine is not available yet.', 'error'); return Promise.resolve(false); }
    var c = config();
    if (!/^https:\/\//i.test(c.url)) { showToast('For a secure Android build, use an HTTPS target URL.', 'error'); return Promise.resolve(false); }
    var zip = new JSZip();
    zip.file('settings.gradle', settingsGradle(c));
    zip.file('build.gradle', rootGradle());
    zip.file('gradle.properties', 'org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.nonTransitiveRClass=true\n');
    zip.file('README.md', readme(c));
    zip.file('app/build.gradle', appGradle(c));
    zip.file('app/proguard-rules.pro', '# Web2App Studio Pro\n');
    zip.file('app/src/main/AndroidManifest.xml', manifest(c));
    zip.file('app/src/main/java/' + javaPath(c.pkg) + '/MainActivity.java', mainActivity(c));
    zip.file('app/src/main/res/values/colors.xml', '<resources><color name="primary">' + xml(c.color) + '</color><color name="splash_background">' + xml(c.splash) + '</color></resources>');
    zip.file('app/src/main/res/values/strings.xml', '<resources><string name="app_name">' + xml(c.name) + '</string><string name="target_url">' + xml(c.url) + '</string><string name="splash_tagline">' + xml(c.tagline) + '</string></resources>');
    zip.file('app/src/main/res/values/styles.xml', '<resources><style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar"><item name="android:colorAccent">@color/primary</item><item name="android:statusBarColor">@color/primary</item><item name="android:navigationBarColor">#000000</item><item name="android:windowLightStatusBar">false</item></style></resources>');
    zip.file('app/src/main/res/drawable/ic_launcher.xml', iconXml(c));
    zip.file('app/src/main/res/drawable/ic_launcher_round.xml', iconXml(c));
    return zip.generateAsync({type:'blob', compression:'DEFLATE', compressionOptions:{level:6}}).then(function(blob){
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = (c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'web2app') + '-android-studio.zip';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url);}, 1500);
      showToast('Professional Android Studio project exported.', 'success');
      return true;
    });
  }
  function build() {
    var modal = document.getElementById('build-modal');
    var bar = document.getElementById('build-progress-bar');
    var pct = document.getElementById('build-percent');
    var step = document.getElementById('build-step-text');
    var terminal = document.getElementById('build-terminal');
    var complete = document.getElementById('build-complete-box');
    var icon = document.getElementById('build-icon');
    var title = document.getElementById('build-title');
    var close = document.getElementById('modal-close-btn');
    if (!modal) return;
    if (!/^https:\/\//i.test(value('app-url', ''))) { showToast('Enter an HTTPS target URL first.', 'error'); return; }
    modal.classList.remove('hidden'); if (complete) complete.classList.add('hidden'); if (close) close.classList.add('hidden');
    if (icon) icon.className = 'fa-solid fa-gear fa-spin text-brand-400';
    if (title) title.innerText = 'Generating Android Studio Project...';
    if (terminal) terminal.innerHTML = '';
    var steps = ['Validating HTTPS target and metadata','Generating manifest and runtime permissions','Generating hardened WebView and file chooser','Generating Gradle project for SDK 35 / JDK 17','Generating branding and Android resources','Project source generated successfully'];
    var i = 0;
    function tick() {
      var p = Math.round((i + 1) * 100 / steps.length);
      if (bar) bar.style.width = p + '%'; if (pct) pct.innerText = p + '%'; if (step) step.innerText = steps[i];
      if (terminal) { var line = document.createElement('div'); line.innerText = '[EXPORT] ' + steps[i]; terminal.appendChild(line); terminal.scrollTop = terminal.scrollHeight; }
      i++;
      if (i < steps.length) setTimeout(tick, 220);
      else {
        if (icon) icon.className = 'fa-solid fa-circle-check text-emerald-400';
        if (title) title.innerText = 'Android Studio Project Ready';
        if (complete) complete.classList.remove('hidden'); if (close) close.classList.remove('hidden');
        if (typeof generateQRCodeForDownload === 'function') generateQRCodeForDownload();
        if (typeof saveCurrentAppToDashboard === 'function') saveCurrentAppToDashboard();
      }
    }
    tick();
  }
  window.startBuildProcess = build;
  window.web2AppProjectExport = writeProject;
  window.triggerSourceZipDownload = writeProject;

  function githubApiHeaders(token) {
    return {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + token.trim(),
      'X-GitHub-Api-Version': '2026-03-10',
      'Content-Type': 'application/json'
    };
  }

  function githubBuildConfig() {
    var c = config();
    return {
      app_name: c.name,
      app_url: c.url,
      package_name: c.pkg,
      version_name: c.version,
      primary_color: c.color,
      camera: String(c.camera),
      location: String(c.location),
      publish_release: 'true'
    };
  }

  function createApkBuildIndicator() {
    var existing = document.getElementById('apk-build-indicator');
    if (existing) existing.remove();

    var box = document.createElement('section');
    box.id = 'apk-build-indicator';
    box.className = 'apk-build-indicator';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML =
      '<div class="apk-build-indicator__header">' +
        '<div class="apk-build-indicator__icon" aria-hidden="true"><i class="fa-solid fa-gear fa-spin"></i></div>' +
        '<div class="apk-build-indicator__copy">' +
          '<strong id="apk-build-indicator-title">Starting APK build</strong>' +
          '<span id="apk-build-indicator-step">Preparing GitHub Actions...</span>' +
        '</div>' +
        '<div class="apk-build-indicator__timer">' +
          '<strong id="apk-build-indicator-timer">00:00</strong>' +
          '<span>Elapsed</span>' +
        '</div>' +
      '</div>' +
      '<div class="apk-build-indicator__meta">' +
        '<span id="apk-build-indicator-stage">Stage 1 / 4</span>' +
        '<strong id="apk-build-indicator-percent">0%</strong>' +
      '</div>' +
      '<div class="apk-build-indicator__track"><span id="apk-build-indicator-bar"></span></div>' +
      '<p id="apk-build-indicator-hint" class="apk-build-indicator__hint">The timer shows that the build request is active.</p>';

    document.body.appendChild(box);

    var started = Date.now();
    var timer = window.setInterval(function () {
      var seconds = Math.floor((Date.now() - started) / 1000);
      var min = String(Math.floor(seconds / 60)).padStart(2, '0');
      var sec = String(seconds % 60).padStart(2, '0');
      var el = document.getElementById('apk-build-indicator-timer');
      if (el) el.textContent = min + ':' + sec;
    }, 1000);

    return {
      set: function(titleText, stepText, progress, stageText) {
        var titleEl = document.getElementById('apk-build-indicator-title');
        var stepEl = document.getElementById('apk-build-indicator-step');
        var barEl = document.getElementById('apk-build-indicator-bar');
        var percentEl = document.getElementById('apk-build-indicator-percent');
        var stageEl = document.getElementById('apk-build-indicator-stage');
        if (titleEl) titleEl.textContent = titleText;
        if (stepEl) stepEl.textContent = stepText;
        if (barEl) barEl.style.width = Math.max(3, Math.min(100, progress)) + '%';
        if (percentEl) percentEl.textContent = Math.round(Math.max(0, Math.min(100, progress))) + '%';
        if (stageEl && stageText) stageEl.textContent = stageText;
      },
      pulse: function() {
        var icon = document.querySelector('#apk-build-indicator .apk-build-indicator__icon');
        if (!icon) return;
        icon.classList.remove('is-pulsing');
        void icon.offsetWidth;
        icon.classList.add('is-pulsing');
      },
      finish: function(success, message) {
        window.clearInterval(timer);
        var icon = document.querySelector('#apk-build-indicator .apk-build-indicator__icon');
        var stepEl = document.getElementById('apk-build-indicator-step');
        var titleEl = document.getElementById('apk-build-indicator-title');
        var hintEl = document.getElementById('apk-build-indicator-hint');
        var barEl = document.getElementById('apk-build-indicator-bar');
        var percentEl = document.getElementById('apk-build-indicator-percent');
        var stageEl = document.getElementById('apk-build-indicator-stage');
        if (icon) {
          icon.classList.remove('is-pulsing');
          icon.innerHTML = success ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
          icon.classList.toggle('is-success', success);
          icon.classList.toggle('is-error', !success);
        }
        if (titleEl) titleEl.textContent = success ? 'APK Ready' : 'Build interrupted';
        if (stepEl) stepEl.textContent = message;
        if (hintEl) hintEl.textContent = success ? 'Signed APK is ready.' : 'Review the build error and GitHub Actions log.';
        if (barEl) barEl.style.width = success ? '100%' : '100%';
        if (percentEl) percentEl.textContent = success ? '100%' : '—';
        if (stageEl) stageEl.textContent = success ? 'Completed' : 'Stopped';
        window.setTimeout(function () {
          var el = document.getElementById('apk-build-indicator');
          if (el) el.remove();
        }, success ? 2500 : 7000);
      }
    };
  }

  function setApkBuildButtonsBusy(busy) {
    document.querySelectorAll('[onclick*="triggerDirectApkDownload"], [onclick*="triggerGitHubBuild"]').forEach(function (button) {
      button.disabled = busy;
      button.setAttribute('aria-busy', busy ? 'true' : 'false');
      button.style.opacity = busy ? '.65' : '';
      button.style.pointerEvents = busy ? 'none' : '';
    });
  }

  async function triggerGitHubBuildInternal() {
    if (window.__web2appApkBuildRunning) return false;
    var token = window.prompt('GitHub Fine-grained PAT (Actions: Read and write). It is used only for this request and is never saved.');
    if (!token) return false;

    var c = config();
    if (!/^https:\/\//i.test(c.url)) {
      showToast('Use an HTTPS target URL before starting the GitHub build.', 'error');
      return false;
    }

    var headers = githubApiHeaders(token);
    var dispatchUrl = 'https://api.github.com/repos/gpldroid/todroid/actions/workflows/android-build.yml/dispatches';
    var startedAt = Date.now();
    var indicator = createApkBuildIndicator();
    window.__web2appApkBuildRunning = true;
    setApkBuildButtonsBusy(true);

    indicator.set('Starting APK build', 'Sending a secure request to GitHub Actions...', 4, 'Stage 1 / 4');
    indicator.pulse();

    try {
      var dispatchResponse = await fetch(dispatchUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ ref: 'main', inputs: githubBuildConfig() })
      });

      if (!dispatchResponse.ok) {
        var dispatchText = await dispatchResponse.text();
        throw new Error('GitHub dispatch failed (' + dispatchResponse.status + '): ' + dispatchText.slice(0, 180));
      }

      indicator.set('Build started', 'GitHub Actions accepted the build request.', 10, 'Stage 1 / 4');
      indicator.pulse();
      showToast('Build started on GitHub Actions. Waiting for the signed APK...', 'info');

      var run = null;
      for (var attempt = 0; attempt < 60; attempt++) {
        await new Promise(function (resolve) { setTimeout(resolve, attempt === 0 ? 2500 : 5000); });

        var runsResponse = await fetch(
          'https://api.github.com/repos/gpldroid/todroid/actions/workflows/android-build.yml/runs?branch=main&event=workflow_dispatch&per_page=10',
          { headers: headers, cache: 'no-store' }
        );
        if (!runsResponse.ok) throw new Error('Cannot read GitHub Actions status (' + runsResponse.status + ').');

        var runsData = await runsResponse.json();
        var candidates = (runsData.workflow_runs || []).filter(function (item) {
          return new Date(item.created_at).getTime() >= startedAt - 15000;
        });
        if (candidates.length) {
          run = candidates[0];
          break;
        }

        var discoveryProgress = 10 + Math.min(10, Math.floor((attempt + 1) * 10 / 60));
        indicator.set('Starting APK build', 'Waiting for GitHub to create the workflow run...', discoveryProgress, 'Stage 2 / 4');
      }

      if (!run) throw new Error('GitHub Actions run was not found. Please open Actions and check the workflow manually.');

      indicator.set('Building APK', 'GitHub Actions run #' + run.run_number + ' is compiling the Android project.', 20, 'Stage 2 / 4');
      indicator.pulse();
      showToast('GitHub build is running: #' + run.run_number, 'info');

      for (var poll = 0; poll < 120; poll++) {
        await new Promise(function (resolve) { setTimeout(resolve, 5000); });

        var statusResponse = await fetch(run.url, { headers: headers, cache: 'no-store' });
        if (!statusResponse.ok) throw new Error('Cannot read build status (' + statusResponse.status + ').');

        var status = await statusResponse.json();
        var elapsedProgress = 20 + Math.min(65, Math.floor((Date.now() - startedAt) / 10000));
        var stageText = status.status === 'queued' ? 'Stage 2 / 4' : 'Stage 3 / 4';
        indicator.set(
          'Building APK',
          status.status === 'queued' ? 'Waiting for a GitHub runner...' : 'Gradle is compiling and signing the release build.',
          elapsedProgress,
          stageText
        );
        if (poll % 2 === 0) indicator.pulse();

        if (status.status === 'completed') {
          if (status.conclusion !== 'success') {
            throw new Error('GitHub build finished with status: ' + status.conclusion + '. Open Actions for the detailed log.');
          }
          run = status;
          break;
        }
      }

      if (!run || run.status !== 'completed' || run.conclusion !== 'success') {
        throw new Error('Build timed out while waiting for GitHub Actions.');
      }

      indicator.set('APK signed', 'Build completed successfully. Preparing the download...', 92, 'Stage 4 / 4');
      indicator.pulse();
      

      var tag = 'v' + c.version;
      var releaseResponse = await fetch(
        'https://api.github.com/repos/gpldroid/todroid/releases/tags/' + encodeURIComponent(tag),
        { headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' }, cache: 'no-store' }
      );
      if (!releaseResponse.ok) {
        throw new Error('Build succeeded, but GitHub Release ' + tag + ' was not found yet. Wait a few seconds and try again.');
      }

      var release = await releaseResponse.json();
      var apk = (release.assets || []).find(function (asset) {
        return /\.apk$/i.test(asset.name);
      });
      if (!apk || !apk.browser_download_url) {
        throw new Error('The signed APK was built, but no APK release asset was found.');
      }

      var link = document.createElement('a');
      link.href = apk.browser_download_url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.download = apk.name;
      document.body.appendChild(link);
      link.click();
      link.remove();

      indicator.finish(true, 'APK download started: ' + apk.name);
      
      return true;
    } catch (error) {
      console.error('GitHub APK build error:', error);
      if (indicator) indicator.finish(false, error && error.message ? error.message : 'Unable to build/download the APK.');
      showToast(error && error.message ? error.message : 'Unable to build/download the APK.', 'error');
      return false;
    } finally {
      window.__web2appApkBuildRunning = false;
      setApkBuildButtonsBusy(false);
    }
  }

  window.triggerGitHubBuild = triggerGitHubBuildInternal;

  window.triggerDirectApkDownload = function () {
    return triggerGitHubBuildInternal();
  };
})();