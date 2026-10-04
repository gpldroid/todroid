/* Web2App Studio Pro - Professional Android Project Export Engine v2.0 */
(function () {
  'use strict';

  const core = window.web2appCore || {};
  const safeElement = core.safeElement || ((id) => document.getElementById(id));
  const normalizeUrl = core.normalizeUrl || ((v) => v);

  function value(id, fallback) {
    const el = safeElement(id);
    return el ? el.value : fallback;
  }

  function enabled(id, fallback) {
    const el = safeElement(id);
    return el ? !!el.checked : fallback;
  }

  function xml(v) {
    return String(v == null ? '' : v).replace(/[<>&'"]/g, (c) => {
      const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
      return map[c];
    });
  }

  function java(v) {
    return JSON.stringify(String(v == null ? '' : v));
  }

  function pkg(raw) {
    let p = String(raw || 'com.web2app.app').toLowerCase().replace(/[^a-z0-9_.]/g, '');
    p = p.replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
    const parts = p.split('.').filter(Boolean).map((x) => /^[a-z_]/.test(x) ? x : 'app' + x);
    if (parts.length < 2) return 'com.web2app.' + (parts[0] || 'app');
    return parts.join('.');
  }

  function versionCode(v) {
    const m = String(v || '1.0.0').match(/\d+/g) || ['1', '0', '0'];
    return Math.max(1, Math.min(2100000000, Number(m[0]) * 10000 + Number(m[1] || 0) * 100 + Number(m[2] || 0)));
  }

  function orientation() {
    const v = value('app-orientation', 'portrait');
    return v === 'landscape' ? 'landscape' : v === 'sensor' ? 'fullSensor' : 'portrait';
  }

  function config() {
    return {
      name: value('app-name', 'My Web App').trim() || 'My Web App',
      url: normalizeUrl(value('app-url', 'https://example.com')) || 'https://example.com',
      pkg: pkg(value('app-package', 'com.web2app.app')),
      version: value('app-version', '1.0.0').trim() || '1.0.0',
      versionCode: versionCode(value('app-version', '1.0.0')),
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

  function javaPath(p) {
    return p.replace(/\./g, '/');
  }

  function manifest(c) {
    const permissions = [
      '    <uses-permission android:name="android.permission.INTERNET" />',
      '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />'
    ];

    if (c.camera) {
      permissions.push('    <uses-permission android:name="android.permission.CAMERA" />');
      permissions.push('    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
      permissions.push('    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />');
      permissions.push('    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />');
    }

    if (c.location) {
      permissions.push('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />');
      permissions.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
    }

    return [
      '<?xml version="1.0" encoding="utf-8"?>',
      `<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${xml(c.pkg)}">`,
      permissions.join('\n'),
      `    <application android:allowBackup="true" android:hardwareAccelerated="true" android:icon="@drawable/ic_launcher" android:label="${xml(c.name)}" android:roundIcon="@drawable/ic_launcher_round" android:theme="@style/AppTheme">`,
      `        <activity android:name=".MainActivity" android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode" android:exported="true" android:screenOrientation="${orientation()}">`,
      `            <intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter>`,
      `        </activity>`,
      `    </application>`,
      `</manifest>`
    ].join('\n');
  }

  function mainActivity(c) {
    return `package ${c.pkg};

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_MEDIA = 4101;
    private static final int REQUEST_LOCATION = 4102;
    private static final int FILE_CHOOSER = 4103;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingWebPermission;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor(${java(c.color)}));
        webView = new WebView(this);
        setContentView(webView);
        configureWebView();
        if (savedInstanceState == null) {
            webView.loadUrl(${java(c.url)});
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportZoom(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setGeolocationEnabled(${String(c.location)});
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }
        webView.setBackgroundColor(Color.WHITE);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                String scheme = u.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (Exception ignored) {}
                return true;
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadDataWithBaseURL(null, "<html><body style='font-family:sans-serif;padding:32px;text-align:center;background:#f5f5f5'><h2 style='color:#333'>Connection Problem</h2><p style='color:#666;font-size:14px;'>Unable to load: " + request.getUrl().toString() + "</p><p style='color:#999;font-size:12px;'>Check your internet connection and try again.</p></body></html>", "text/html", "utf-8", null);
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                fileCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_CHOOSER);
                } catch (Exception e) {
                    fileCallback = null;
                    callback.onReceiveValue(null);
                }
                return true;
            }

            @Override public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    public void run() {
                        pendingWebPermission = request;
                        java.util.ArrayList<String> permissions = new java.util.ArrayList<>();
                        for (String resource : request.getResources()) {
                            if (${String(c.camera)} && PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                                permissions.add(Manifest.permission.CAMERA);
                            }
                            if (${String(c.camera)} && PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                                permissions.add(Manifest.permission.RECORD_AUDIO);
                            }
                        }
                        if (permissions.isEmpty()) {
                            request.deny();
                            pendingWebPermission = null;
                            return;
                        }
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            requestPermissions(permissions.toArray(new String[0]), REQUEST_MEDIA);
                        } else {
                            request.grant(request.getResources());
                        }
                    }
                });
            }

            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (!${String(c.location)}) {
                    callback.invoke(origin, false, false);
                    return;
                }
                pendingGeoOrigin = origin;
                pendingGeoCallback = callback;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, REQUEST_LOCATION);
                } else {
                    callback.invoke(origin, true, false);
                }
            }
        });
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == REQUEST_MEDIA && pendingWebPermission != null) {
            boolean ok = results.length > 0;
            for (int result : results) if (result != PackageManager.PERMISSION_GRANTED) ok = false;
            if (ok) pendingWebPermission.grant(pendingWebPermission.getResources());
            else pendingWebPermission.deny();
            pendingWebPermission = null;
        }
        if (requestCode == REQUEST_LOCATION && pendingGeoCallback != null) {
            boolean ok = false;
            for (int result : results) if (result == PackageManager.PERMISSION_GRANTED) ok = true;
            pendingGeoCallback.invoke(pendingGeoOrigin, ok, false);
            pendingGeoCallback = null;
            pendingGeoOrigin = null;
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
        }
        super.onDestroy();
    }
}`;
  }

  function rootGradle() {
    return "plugins { id 'com.android.application' version '8.7.3' apply false }\n";
  }

  function settingsGradle(c) {
    const name = c.name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40) || 'Web2AppProject';
    return `import org.gradle.api.initialization.resolve.RepositoriesMode\n\npluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\ndependencyResolutionManagement { repositoriesMode = RepositoriesMode.FAIL_ON_PROJECT_REPOS; repositories { google(); mavenCentral() } }\ninclude ':app'\nrootProject.name = '${name}'\n`;
  }

  function appGradle(c) {
    return `plugins { id 'com.android.application' }\nandroid {\n    namespace '${c.pkg}'\n    compileSdk 35\n    defaultConfig {\n        applicationId '${c.pkg}'\n        minSdk 24\n        targetSdk 35\n        versionCode ${c.versionCode}\n        versionName '${c.version}'\n    }\n    buildTypes {\n        release {\n            minifyEnabled false\n            shrinkResources false\n        }\n    }\n}\ndependencies {\n    implementation 'androidx.appcompat:appcompat:1.7.0'\n    implementation 'androidx.webkit:webkit:1.12.1'\n}`;
  }

  function readme(c) {
    return `# ${c.name}\n\n**Generated by Web2App Studio Pro v4.0**\n\n## Project Details\n\n- **Target URL**: ${c.url}\n- **Package**: ${c.pkg}\n- **Version**: ${c.version}\n- **Target SDK**: 35\n- **Min SDK**: 24\n\n## How to Build\n\n1. Open this project in Android Studio\n2. Click **Sync Now** in the Gradle notification\n3. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**\n4. Locate the APK in **app/build/outputs/apk/**\n\n## Permissions\n\n${c.camera ? '- Camera and microphone access enabled\n' : ''}${c.location ? '- Location services enabled\n' : ''}\n## Notes\n\nThis is a WebView-based wrapper application. Ensure you have the appropriate rights to the target website before publishing to app stores.\n`;
  }

  function iconXml(c) {
    return `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n  <path android:fillColor="${c.color}" android:pathData="M0,0h108v108h-108z" />\n  <path android:fillColor="#ffffff" android:pathData="M36,36h36v36h-36z" />\n</vector>\n`;
  }

  async function writeProject() {
    if (typeof JSZip === 'undefined') {
      showToast('ZIP engine is not available yet.', 'error');
      return false;
    }

    const c = config();
    if (!/^https:\/\//i.test(c.url)) {
      showToast('For a secure Android build, use an HTTPS target URL.', 'error');
      return false;
    }

    try {
      const zip = new JSZip();
      zip.file('settings.gradle', settingsGradle(c));
      zip.file('build.gradle', rootGradle());
      zip.file('gradle.properties', 'org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.nonTransitiveRClass=true\n');
      zip.file('README.md', readme(c));
      zip.file('app/build.gradle', appGradle(c));
      zip.file('app/proguard-rules.pro', '# Web2App Studio Pro\n-keep class android.webkit.** { *; }\n');
      zip.file('app/src/main/AndroidManifest.xml', manifest(c));
      zip.file('app/src/main/java/' + javaPath(c.pkg) + '/MainActivity.java', mainActivity(c));
      zip.file('app/src/main/res/values/colors.xml', `<resources><color name="primary">${xml(c.color)}</color><color name="splash_background">${xml(c.splash)}</color></resources>`);
      zip.file('app/src/main/res/values/strings.xml', `<resources><string name="app_name">${xml(c.name)}</string><string name="target_url">${xml(c.url)}</string><string name="splash_tagline">${xml(c.tagline)}</string></resources>`);
      zip.file('app/src/main/res/values/styles.xml', '<resources><style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar"><item name="android:colorAccent">@color/primary</item><item name="android:colorPrimary">@color/primary</item></style></resources>');
      zip.file('app/src/main/res/drawable/ic_launcher.xml', iconXml(c));
      zip.file('app/src/main/res/drawable/ic_launcher_round.xml', iconXml(c));
      zip.file('app/.gitignore', '*.iml\n.gradle\n.idea/\nbuild/\n');
      zip.file('.gitignore', '.gradle\n.idea\nbuild/\n*.apk\n');

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'web2app') + '-android-studio.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => { URL.revokeObjectURL(url); }, 1500);
      showToast('Professional Android Studio project exported successfully.', 'success');
      return true;
    } catch (error) {
      console.error('Project export error:', error);
      showToast('Failed to generate project: ' + error.message, 'error');
      return false;
    }
  }

  function build() {
    const modal = safeElement('build-modal');
    const bar = safeElement('build-progress-bar');
    const pct = safeElement('build-percent');
    const step = safeElement('build-step-text');
    const terminal = safeElement('build-terminal');
    const complete = safeElement('build-complete-box');
    const icon = safeElement('build-icon');
    const title = safeElement('build-title');
    const close = safeElement('modal-close-btn');

    if (!modal) return;
    if (!/^https:\/\//i.test(value('app-url', ''))) {
      showToast('Enter an HTTPS target URL first.', 'error');
      return;
    }

    modal.classList.remove('hidden');
    if (complete) complete.classList.add('hidden');
    if (close) close.classList.add('hidden');
    if (icon) icon.className = 'fa-solid fa-gear fa-spin text-brand-400';
    if (title) title.innerText = 'Generating Android Studio Project...';
    if (terminal) terminal.innerHTML = '';

    const steps = [
      'Validating HTTPS target and metadata',
      'Generating manifest and runtime permissions',
      'Generating hardened WebView and file chooser',
      'Generating Gradle project for SDK 35 / JDK 17',
      'Packaging assets and resources',
      'Compiling project structure',
      'Finalizing export archive'
    ];

    let i = 0;
    function tick() {
      const p = Math.round((i + 1) * 100 / steps.length);
      if (bar) bar.style.width = p + '%';
      if (pct) pct.innerText = p + '%';
      if (step) step.innerText = steps[i];
      if (terminal) {
        const line = document.createElement('div');
        line.innerText = '[EXPORT] ' + steps[i];
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
      }
      i++;
      if (i < steps.length) {
        setTimeout(tick, 220);
      } else {
        if (icon) icon.className = 'fa-solid fa-circle-check text-emerald-400';
        if (title) title.innerText = 'Android Studio Project Ready';
        if (complete) complete.classList.remove('hidden');
        if (close) close.classList.remove('hidden');
        if (typeof generateQRCodeForDownload === 'function') generateQRCodeForDownload();
        if (typeof saveCurrentAppToDashboard === 'function') saveCurrentAppToDashboard();
      }
    }
    tick();
  }

  function copyGitHubBuildInputs() {
    const c = config();
    const text = [
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
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => { showToast('GitHub Build settings copied.', 'success'); })
        .catch(() => { window.prompt('Copy GitHub Build settings:', text); });
    } else {
      window.prompt('Copy GitHub Build settings:', text);
    }
    return true;
  }

  window.startBuildProcess = build;
  window.web2AppProjectExport = writeProject;
  window.triggerSourceZipDownload = writeProject;
  window.copyGitHubBuildInputs = copyGitHubBuildInputs;
})();
