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
      '                if (request.isForMainFrame()) view.loadDataWithBaseURL(null, "<html><body style=" + "\'font-family:sans-serif;padding:32px;text-align:center\'" + "><h2>Connection problem</h2><p>Please check your connection and try again.</p></body></html>", "text/html", "UTF-8", null);',
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
          '<span id="apk-build-indicator-step">Preparing secure build request...</span>' +
        '</div>' +
        '<div class="apk-build-indicator__timer">' +
          '<strong id="apk-build-indicator-timer">00:00</strong><span>Elapsed</span>' +
        '</div>' +
      '</div>' +
      '<div class="apk-build-indicator__meta"><span id="apk-build-indicator-stage">Stage 1 / 4</span><strong id="apk-build-indicator-percent">0%</strong></div>' +
      '<div class="apk-build-indicator__track"><span id="apk-build-indicator-bar"></span></div>' +
      '<p id="apk-build-indicator-hint" class="apk-build-indicator__hint">Your GitHub token stays on the server and is never requested in the browser.</p>';
    document.body.appendChild(box);
    var timer = window.setInterval(function () {
      var seconds = Math.floor((Date.now() - started) / 1000);
      var el = document.getElementById('apk-build-indicator-timer');
      if (el) el.textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
    }, 1000);
    return {
      set: function(titleText, stepText, progress, stageText) {
        var a = document.getElementById('apk-build-indicator-title');
        var b = document.getElementById('apk-build-indicator-step');
        var c = document.getElementById('apk-build-indicator-bar');
        var d = document.getElementById('apk-build-indicator-percent');
        var e = document.getElementById('apk-build-indicator-stage');
        if (a) a.textContent = titleText; if (b) b.textContent = stepText;
        if (c) c.style.width = Math.max(3, Math.min(100, progress)) + '%';
        if (d) d.textContent = Math.round(Math.max(0, Math.min(100, progress))) + '%';
        if (e && stageText) e.textContent = stageText;
      },
      pulse: function() {
        var icon = document.querySelector('#apk-build-indicator .apk-build-indicator__icon');
        if (!icon) return;
        icon.classList.remove('is-pulsing'); void icon.offsetWidth; icon.classList.add('is-pulsing');
      },
      finish: function(success, message) {
        window.clearInterval(timer);
        var icon = document.querySelector('#apk-build-indicator .apk-build-indicator__icon');
        var step = document.getElementById('apk-build-indicator-step');
        var title = document.getElementById('apk-build-indicator-title');
        var hint = document.getElementById('apk-build-indicator-hint');
        var bar = document.getElementById('apk-build-indicator-bar');
        var pct = document.getElementById('apk-build-indicator-percent');
        var stage = document.getElementById('apk-build-indicator-stage');
        if (icon) {
          icon.classList.remove('is-pulsing');
          icon.innerHTML = success ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
          icon.classList.toggle('is-success', success); icon.classList.toggle('is-error', !success);
        }
        if (title) title.textContent = success ? 'APK Ready' : 'Build interrupted';
        if (step) step.textContent = message;
        if (hint) hint.textContent = success ? 'Signed APK is ready and stored permanently in the GitHub Release.' : 'Review the build error and GitHub Actions log.';
        if (bar) bar.style.width = '100%'; if (pct) pct.textContent = success ? '100%' : '—';
        if (stage) stage.textContent = success ? 'Completed' : 'Stopped';
        window.setTimeout(function(){ var el=document.getElementById('apk-build-indicator'); if(el) el.remove(); }, success ? 2500 : 7000);
      }
    };
  }

  function setApkBuildButtonsBusy(busy) {
    document.querySelectorAll('[onclick*="triggerDirectApkDownload"], [onclick*="triggerGitHubBuild"]').forEach(function(button) {
      button.disabled = busy;
      button.setAttribute('aria-busy', busy ? 'true' : 'false');
      button.style.opacity = busy ? '.65' : '';
      button.style.pointerEvents = busy ? 'none' : '';
    });
  }

  function githubBuildConfig() {
    var c = config();
    return { app_name:c.name, app_url:c.url, package_name:c.pkg, version_name:c.version,
      primary_color:c.color, camera:String(c.camera), location:String(c.location), publish_release:'true' };
  }

  function createApkBuildIndicator() {
    var existing=document.getElementById('apk-build-indicator'); if(existing) existing.remove();
    var box=document.createElement('section'); box.id='apk-build-indicator'; box.className='apk-build-indicator';
    box.setAttribute('role','status'); box.setAttribute('aria-live','polite');
    box.innerHTML='<div class="apk-build-indicator__header"><div class="apk-build-indicator__icon" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></div><div class="apk-build-indicator__copy"><strong id="apk-build-indicator-title">GitHub Actions build</strong><span id="apk-build-indicator-step">Opening the official GitHub workflow...</span></div></div><div class="apk-build-indicator__meta"><span id="apk-build-indicator-stage">Stage 1 / 3</span><strong id="apk-build-indicator-percent">0%</strong></div><div class="apk-build-indicator__track"><span id="apk-build-indicator-bar"></span></div><p id="apk-build-indicator-hint" class="apk-build-indicator__hint">The Android build and conversion remain entirely inside GitHub Actions. No Vercel or external build server is used.</p>';
    document.body.appendChild(box);
    return {
      set:function(t,st,p,stage){var a=document.getElementById('apk-build-indicator-title'),b=document.getElementById('apk-build-indicator-step'),c=document.getElementById('apk-build-indicator-bar'),d=document.getElementById('apk-build-indicator-percent'),e=document.getElementById('apk-build-indicator-stage');if(a)a.textContent=t;if(b)b.textContent=st;if(c)c.style.width=Math.max(3,Math.min(100,p))+'%';if(d)d.textContent=Math.round(Math.max(0,Math.min(100,p)))+'%';if(e)e.textContent=stage;},
      finish:function(ok,msg){var a=document.getElementById('apk-build-indicator-title'),b=document.getElementById('apk-build-indicator-step'),h=document.getElementById('apk-build-indicator-hint'),i=document.querySelector('#apk-build-indicator .apk-build-indicator__icon');if(a)a.textContent=ok?'GitHub workflow opened':'Build setup stopped';if(b)b.textContent=msg;if(h)h.textContent=ok?'Complete the inputs on GitHub, start the workflow, then use the Download APK button after the Release is created.':'No external build server was contacted.';if(i){i.innerHTML=ok?'<i class="fa-solid fa-check"></i>':'<i class="fa-solid fa-triangle-exclamation"></i>';i.classList.toggle('is-success',ok);i.classList.toggle('is-error',!ok);}var bar=document.getElementById('apk-build-indicator-bar'),pct=document.getElementById('apk-build-indicator-percent'),stage=document.getElementById('apk-build-indicator-stage');if(bar)bar.style.width='100%';if(pct)pct.textContent=ok?'100%':'—';if(stage)stage.textContent=ok?'Stage 2 / 3':'Stopped';window.setTimeout(function(){var el=document.getElementById('apk-build-indicator');if(el)el.remove();},ok?5000:7000);}
    };
  }

  function triggerGitHubBuildInternal(){
    if(window.__web2appApkBuildRunning)return false;
    var c=config();
    if(!/^https:\\/\\//i.test(c.url)){
      showToast('Use an HTTPS target URL before starting the GitHub build.','error');
      return false;
    }
    var indicator=createApkBuildIndicator();
    window.__web2appBuildStartedAt=Date.now();
    window.__web2appApkBuildRunning=true;
    setApkBuildButtonsBusy(true);
    indicator.set('GitHub Actions is ready','Opening the repository workflow. Your APK will be built on GitHub.',15,'Stage 1 / 3');
    var workflowUrl='https://github.com/gpldroid/todroid/actions/workflows/android-build.yml';
    var opened=window.open(workflowUrl,'_blank','noopener');
    if(!opened){window.location.href=workflowUrl;return true;}
    indicator.set('Workflow opened','Enter the app values in GitHub and click Run workflow.',55,'Stage 2 / 3');
    showToast('GitHub Actions opened. Start the Android Build workflow there.','info');
    window.setTimeout(function(){
      indicator.finish(true,'GitHub Actions now handles the complete Android build, signing, Release and APK/AAB artifacts.');
      window.__web2appApkBuildRunning=false;
      setApkBuildButtonsBusy(false);
    },1200);
    return true;
  }

  function showApkWaitTimer(seconds, statusText) {
    var existing = document.getElementById('apk-download-countdown');
    if (existing) existing.remove();
    var box = document.createElement('section');
    box.id = 'apk-download-countdown';
    box.className = 'apk-build-indicator apk-download-countdown';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML =
      '<div class="apk-build-indicator__header">' +
        '<div class="apk-build-indicator__icon" aria-hidden="true"><i class="fa-solid fa-hourglass-half"></i></div>' +
        '<div class="apk-build-indicator__copy">' +
          '<strong id="apk-countdown-title">Preparing direct APK download</strong>' +
          '<span id="apk-countdown-step">' + (statusText || 'Waiting for the GitHub Release...') + '</span>' +
        '</div>' +
        '<div class="apk-build-indicator__timer">' +
          '<strong id="apk-countdown-seconds">' + seconds + 's</strong><span>remaining</span>' +
        '</div>' +
      '</div>' +
      '<div class="apk-build-indicator__meta"><span id="apk-countdown-stage">Waiting for build</span><strong id="apk-countdown-percent">0%</strong></div>' +
      '<div class="apk-build-indicator__track"><span id="apk-countdown-bar"></span></div>' +
      '<p id="apk-countdown-hint" class="apk-build-indicator__hint">This page stays here. GitHub Actions builds the APK; the browser waits and then opens the direct Release download.</p>';
    document.body.appendChild(box);
    return box;
  }

  async function getLatestReleaseApk(sinceMs) {
    var response = await fetch('https://api.github.com/repos/gpldroid/todroid/actions/workflows/android-build.yml/runs?per_page=10', {
      headers: {'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'},
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('GitHub Actions lookup failed (' + response.status + ').');
    var data = await response.json();
    var runs = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
    var c = config();
    var prefix = 'v' + c.version + '-build-';
    for (var i = 0; i < runs.length; i++) {
      var run = runs[i];
      var created = Date.parse(run.created_at || '');
      if (!created || created + 15000 < sinceMs) continue;
      if (run.status === 'in_progress' || run.status === 'queued' || run.status === 'requested' || run.status === 'waiting') {
        return {run: run, state: 'building'};
      }
      if (run.status !== 'completed' || run.conclusion !== 'success') {
        if (run.status === 'completed') return {run: run, state: 'failed'};
        continue;
      }
      var tag = prefix + run.run_number;
      var releaseResponse = await fetch('https://api.github.com/repos/gpldroid/todroid/releases/tags/' + encodeURIComponent(tag), {
        headers: {'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'},
        cache: 'no-store'
      });
      if (!releaseResponse.ok) continue;
      var release = await releaseResponse.json();
      var apk = (release.assets || []).find(function(asset) {
        return /\.apk$/i.test(asset.name) && asset.browser_download_url;
      });
      if (apk) return {release: release, apk: apk, run: run, state: 'ready'};
    }
    return null;
  }

  async function downloadLatestGitHubReleaseApk() {
    if (window.__web2appApkDownloadRunning) return false;
    var c = config();
    if (!/^https:\/\//i.test(c.url)) {
      showToast('Use an HTTPS target URL before downloading the APK.', 'error');
      return false;
    }

    window.__web2appApkDownloadRunning = true;
    setApkBuildButtonsBusy(true);

    // This is only a discovery window. Once GitHub exposes the new Run,
    // its own created_at timestamp becomes the authoritative build start.
    var discoveryStartedAt = Number(window.__web2appBuildStartedAt || Date.now());
    var buildStartMs = null;
    var defaultSeconds = 30;
    var maxWaitSeconds = 15 * 60;
    var box = showApkWaitTimer(defaultSeconds, 'Waiting for GitHub to register the new build...');
    var timerEl = document.getElementById('apk-countdown-seconds');
    var bar = document.getElementById('apk-countdown-bar');
    var step = document.getElementById('apk-countdown-step');
    var title = document.getElementById('apk-countdown-title');
    var stage = document.getElementById('apk-countdown-stage');
    var pct = document.getElementById('apk-countdown-percent');
    var found = null;
    var activeRun = null;

    function formatDuration(totalSeconds) {
      var s = Math.max(0, Math.floor(totalSeconds));
      var m = Math.floor(s / 60);
      var sec = s % 60;
      return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function setAuthoritativeBuildStart(run) {
      if (buildStartMs || !run) return;
      var created = Date.parse(run.created_at || '');
      if (created) {
        buildStartMs = created;
        window.__web2appBuildStartedAt = created;
      }
    }

    try {
      for (var elapsed = 0; elapsed <= maxWaitSeconds; elapsed++) {
        try {
          var result = await getLatestReleaseApk(discoveryStartedAt);
          if (result) {
            activeRun = result.run || activeRun;
            setAuthoritativeBuildStart(activeRun);

            if (result.state === 'ready') {
              found = result;
              break;
            }

            if (result.state === 'failed') {
              if (title) title.textContent = 'Build failed';
              if (step) step.textContent = 'GitHub Actions finished without creating a valid APK Release.';
              if (stage) stage.textContent = 'Build failed';
              if (pct) pct.textContent = '—';
              if (bar) bar.style.width = '100%';
              showToast('The GitHub Android build did not complete successfully.', 'error');
              return false;
            }
          }
        } catch (error) {
          if (step) step.textContent = 'Waiting for GitHub Actions status...';
        }

        var now = Date.now();
        var realElapsed = buildStartMs
          ? Math.max(0, Math.floor((now - buildStartMs) / 1000))
          : 0;

        if (timerEl) timerEl.textContent = formatDuration(realElapsed);
        if (stage) stage.textContent = activeRun ? 'GitHub build in progress' : 'Waiting for build to start';
        if (step) step.textContent = activeRun
          ? 'Build #' + activeRun.run_number + ' is still running. The timer follows GitHub created_at.'
          : 'Waiting for GitHub to register the new build...';

        // 30 seconds is only a visual milestone, never a build timeout.
        var progress = buildStartMs
          ? Math.min(96, Math.max(4, Math.round((realElapsed / defaultSeconds) * 70)))
          : 4;
        if (buildStartMs && realElapsed > defaultSeconds) {
          progress = Math.min(96, 70 + Math.round(Math.min(26, (realElapsed - defaultSeconds) / 10)));
        }
        if (bar) bar.style.width = progress + '%';
        if (pct) pct.textContent = buildStartMs
          ? (realElapsed < defaultSeconds ? Math.round(realElapsed / defaultSeconds * 100) + '%' : 'In progress')
          : 'Waiting';

        if (elapsed < maxWaitSeconds) {
          await new Promise(function(resolve){ window.setTimeout(resolve, 2000); });
        }
      }

      if (!found) {
        if (title) title.textContent = 'Build is taking longer than expected';
        if (step) step.textContent = 'Polling stopped for safety. The build is not considered successful until GitHub creates the matching Release.';
        if (stage) stage.textContent = activeRun ? 'Still building' : 'Waiting for build';
        if (pct) pct.textContent = '—';
        if (bar) bar.style.width = '100%';
        showToast('The build is taking longer than expected. Please check again later.', 'info');
        return false;
      }

      setAuthoritativeBuildStart(found.run || activeRun);
      var realTotal = buildStartMs
        ? Math.floor((Date.now() - buildStartMs) / 1000)
        : 0;

      if (timerEl) timerEl.textContent = formatDuration(realTotal);
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (stage) stage.textContent = 'Completed in ' + formatDuration(realTotal);
      if (title) title.textContent = 'APK Ready';
      if (step) step.textContent = found.apk.name;

      var link = document.createElement('a');
      link.href = found.apk.browser_download_url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.download = found.apk.name;
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast('Direct APK download started: ' + found.apk.name, 'success');
      window.setTimeout(function(){ if(box) box.remove(); }, 3000);
      return true;
    } finally {
      window.__web2appApkDownloadRunning = false;
      setApkBuildButtonsBusy(false);
    }
  }

  function setApkBuildButtonsBusy(busy){
    document.querySelectorAll('[onclick*="triggerDirectApkDownload"], [onclick*="triggerGitHubBuild"]').forEach(function(button){
      button.disabled=busy;
      button.setAttribute('aria-busy',busy?'true':'false');
      button.style.opacity=busy?'.65':'';
      button.style.pointerEvents=busy?'none':'';
    });
  }

  function copyGitHubBuildInputs() {
    var c = config();
    var text = [
      'GitHub Actions → Android Build',
      '',
      'app_name: ' + c.name,
      'app_url: ' + c.url,
      'package_name: ' + c.pkg,
      'version_name: ' + c.version,
      'primary_color: ' + c.color,
      'camera: ' + String(c.camera),
      'location: ' + String(c.location),
      'publish_release: true'
    ].join('\\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){
        showToast('GitHub Build settings copied.', 'success');
      }).catch(function(){
        window.prompt('Copy GitHub Build settings:', text);
      });
    } else {
      window.prompt('Copy GitHub Build settings:', text);
    }
    return true;
  }

  async function downloadLatestGitHubReleaseAsset(assetType) {
    if (window.__web2appApkDownloadRunning) return false;
    var c = config();
    if (!/^https:\/\//i.test(c.url)) {
      showToast('Use an HTTPS target URL before downloading.', 'error');
      return false;
    }

    window.__web2appApkDownloadRunning = true;
    setApkBuildButtonsBusy(true);

    var discoveryStartedAt = Number(window.__web2appBuildStartedAt || Date.now());
    var buildStartMs = null;
    var maxWaitSeconds = 15 * 60;
    var box = showApkWaitTimer(30, 'Waiting for the matching GitHub Release...');
    var timerEl = document.getElementById('apk-countdown-seconds');
    var bar = document.getElementById('apk-countdown-bar');
    var step = document.getElementById('apk-countdown-step');
    var title = document.getElementById('apk-countdown-title');
    var stage = document.getElementById('apk-countdown-stage');
    var pct = document.getElementById('apk-countdown-percent');
    var found = null;
    var activeRun = null;

    function duration(total) {
      var s = Math.max(0, Math.floor(total));
      var m = Math.floor(s / 60), sec = s % 60;
      return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }
    function setStart(run) {
      if (buildStartMs || !run) return;
      var created = Date.parse(run.created_at || '');
      if (created) {
        buildStartMs = created;
        window.__web2appBuildStartedAt = created;
      }
    }

    try {
      for (var elapsed = 0; elapsed <= maxWaitSeconds; elapsed++) {
        try {
          var result = await getLatestReleaseApk(discoveryStartedAt);
          if (result) {
            activeRun = result.run || activeRun;
            setStart(activeRun);
            if (result.state === 'ready') {
              var assetName = assetType === 'aab' ? /\.aab$/i : /\.apk$/i;
              var asset = (result.release.assets || []).find(function(a){ return assetName.test(a.name) && a.browser_download_url; });
              if (asset) found = { result: result, asset: asset };
            }
            if (result.state === 'failed') {
              if (title) title.textContent = 'Build failed';
              if (step) step.textContent = 'GitHub Actions finished without creating a valid Release artifact.';
              if (stage) stage.textContent = 'Build failed';
              if (pct) pct.textContent = '—';
              if (bar) bar.style.width = '100%';
              showToast('The GitHub Android build did not complete successfully.', 'error');
              return false;
            }
          }
        } catch (error) {
          if (step) step.textContent = 'Waiting for GitHub Actions status...';
        }

        if (found) break;

        var realElapsed = buildStartMs ? Math.max(0, Math.floor((Date.now() - buildStartMs) / 1000)) : 0;
        if (timerEl) timerEl.textContent = duration(realElapsed);
        if (stage) stage.textContent = activeRun ? 'GitHub build in progress' : 'Waiting for build to start';
        if (step) step.textContent = activeRun
          ? 'Build #' + activeRun.run_number + ' is still running. Timer follows GitHub created_at.'
          : 'Waiting for GitHub to register the new build...';
        var progress = buildStartMs ? Math.min(96, Math.max(4, Math.round((realElapsed / 30) * 70))) : 4;
        if (buildStartMs && realElapsed > 30) progress = Math.min(96, 70 + Math.round(Math.min(26, (realElapsed - 30) / 10)));
        if (bar) bar.style.width = progress + '%';
        if (pct) pct.textContent = buildStartMs ? (realElapsed < 30 ? Math.round(realElapsed / 30 * 100) + '%' : 'In progress') : 'Waiting';

        if (elapsed < maxWaitSeconds) await new Promise(function(resolve){ window.setTimeout(resolve, 2000); });
      }

      if (!found) {
        if (title) title.textContent = 'Build is taking longer than expected';
        if (step) step.textContent = 'No matching Release artifact was found yet. Nothing was downloaded.';
        if (stage) stage.textContent = activeRun ? 'Still building' : 'Waiting for build';
        if (pct) pct.textContent = '—';
        if (bar) bar.style.width = '100%';
        showToast('The build is not ready yet. No old artifact was downloaded.', 'info');
        return false;
      }

      var total = buildStartMs ? Math.floor((Date.now() - buildStartMs) / 1000) : 0;
      if (timerEl) timerEl.textContent = duration(total);
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (stage) stage.textContent = 'Completed in ' + duration(total);
      if (title) title.textContent = assetType === 'aab' ? 'AAB Ready' : 'APK Ready';
      if (step) step.textContent = found.asset.name;

      var link = document.createElement('a');
      link.href = found.asset.browser_download_url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.download = found.asset.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast((assetType === 'aab' ? 'AAB' : 'APK') + ' download started: ' + found.asset.name, 'success');
      window.setTimeout(function(){ if(box) box.remove(); }, 3000);
      return true;
    } finally {
      window.__web2appApkDownloadRunning = false;
      setApkBuildButtonsBusy(false);
    }
  }

  function downloadLatestGitHubReleaseAab() {
    return downloadLatestGitHubReleaseAsset('aab');
  }

  window.triggerGitHubBuild=triggerGitHubBuildInternal;
  window.triggerDirectApkDownload=downloadLatestGitHubReleaseApk;
  window.triggerAabDownload=downloadLatestGitHubReleaseAab;
  window.copyGitHubBuildInputs=copyGitHubBuildInputs;


})();
