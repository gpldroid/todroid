/* Web2App Studio Pro — Professional Android Project Export Engine
 * Generates a real, Android Studio-openable project ZIP.
 * Browser-side generation does NOT compile an APK; APK/AAB compilation requires
 * Android Studio/Gradle or a server-side Android build worker.
 */
(function () {
  'use strict';

  const escXml = (value) => String(value ?? '').replace(/[<>&'"]/g, ch => ({
    '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'
  }[ch]));
  const escJava = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n');

  function read(id, fallback) {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  }
  function checked(id, fallback) {
    const el = document.getElementById(id);
    return el ? el.checked : fallback;
  }

  function normalizePackage(raw) {
    let pkg = String(raw || 'com.web2app.app').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    pkg = pkg.replace(/\\.{2,}/g, '.').replace(/^\\.|\\.$/g, '');
    const parts = pkg.split('.').filter(Boolean).map(p => /^[a-z_]/.test(p) ? p : 'app' + p);
    pkg = parts.join('.');
    if (parts.length < 2) pkg = 'com.web2app.' + (parts[0] || 'app');
    return pkg || 'com.web2app.app';
  }

  function versionCode(version) {
    const m = String(version || '1.0.0').match(/\\d+/g) || ['1','0','0'];
    const n = Number((m[0] || '1')) * 10000 + Number((m[1] || '0')) * 100 + Number((m[2] || '0'));
    return Math.max(1, Math.min(2100000000, n));
  }

  function orientation() {
    const v = read('app-orientation', 'portrait');
    return v === 'landscape' ? 'landscape' : v === 'sensor' ? 'fullSensor' : 'portrait';
  }

  function config() {
    return {
      name: read('app-name', 'My Web App').trim() || 'My Web App',
      url: read('app-url', 'https://example.com').trim() || 'https://example.com',
      pkg: normalizePackage(read('app-package', 'com.web2app.app')),
      version: read('app-version', '1.0.0').trim() || '1.0.0',
      color: read('primary-color', '#4f46e5'),
      splash: read('splash-bg-color', '#080a11'),
      tagline: read('splash-tagline', 'Powered by Web2App Studio Pro').trim(),
      camera: checked('feat-camera', true),
      location: checked('feat-location', false),
      pullRefresh: checked('feat-pull-refresh', true),
      bottomNav: checked('feat-bottom-nav', true),
      icon: window.state && window.state.iconUrl ? window.state.iconUrl : ''
    };
  }

  function packagePath(pkg) {
    return pkg.replace(/\\./g, '/');
  }

  function manifest(c) {
    const permissions = [
      '    <uses-permission android:name="android.permission.INTERNET" />',
      '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />'
    ];
    if (c.camera) {
      permissions.push('    <uses-permission android:name="android.permission.CAMERA" />');
      permissions.push('    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
    }
    if (c.location) {
      permissions.push('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />');
      permissions.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
    }
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${escXml(c.pkg)}">

${permissions.join('\\n')}

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:icon="@drawable/ic_launcher"
        android:label="${escXml(c.name)}"
        android:roundIcon="@drawable/ic_launcher"
        android:supportsRtl="true"
        android:usesCleartextTraffic="false"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:exported="true"
            android:screenOrientation="${orientation()}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  }

  function mainActivity(c) {
    const permissionBlock = c.location ? `
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                (checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
                 checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION}, REQUEST_LOCATION);
        }` : '';

    const cameraPermissions = c.camera ? `
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            java.util.ArrayList<String> permissions = new java.util.ArrayList<>();
            if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) permissions.add(Manifest.permission.CAMERA);
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) permissions.add(Manifest.permission.RECORD_AUDIO);
            if (!permissions.isEmpty()) requestPermissions(permissions.toArray(new String[0]), REQUEST_MEDIA);
        }` : '';

    return `package ${c.pkg};

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.ViewGroup;
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
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;

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
        getWindow().setStatusBarColor(Color.parseColor("${escJava(c.color)}"));
        webView = new WebView(this);
        setContentView(webView);
        configureWebView();
        if (savedInstanceState == null) webView.loadUrl("${escJava(c.url)}");
        else webView.restoreState(savedInstanceState);
        ${permissionBlock}
        ${cameraPermissions}
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setGeolocationEnabled(${c.location});
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
            WebSettingsCompat.setForceDark(s, WebSettingsCompat.FORCE_DARK_OFF);
        }

        webView.setBackgroundColor(Color.WHITE);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if (scheme == null) return true;
                if (scheme.equals("http") || scheme.equals("https")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadDataWithBaseURL(null,
                        "<html><body style='font-family:sans-serif;padding:32px;text-align:center'>" +
                        "<h2>Connection problem</h2><p>Please check your internet connection and try again.</p>" +
                        "</body></html>", "text/html", "UTF-8", null);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                fileCallback = callback;
                Intent intent = params.createIntent();
                try { startActivityForResult(intent, FILE_CHOOSER); }
                catch (Exception e) { fileCallback = null; callback.onReceiveValue(null); }
                return true;
            }
            @Override public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    pendingWebPermission = request;
                    java.util.ArrayList<String> permissions = new java.util.ArrayList<>();
                    if (android.os.Build.VERSION.SDK_INT >= 23) {
                        for (String resource : request.getResources()) {
                            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource) && ${c.camera}) permissions.add(Manifest.permission.CAMERA);
                            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource) && ${c.camera}) permissions.add(Manifest.permission.RECORD_AUDIO);
                        }
                    }
                    if (permissions.isEmpty()) { request.deny(); return; }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) requestPermissions(permissions.toArray(new String[0]), REQUEST_MEDIA);
                    else request.grant(request.getResources());
                });
            }
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (!${c.location}) { callback.invoke(origin, false, false); return; }
                pendingGeoOrigin = origin;
                pendingGeoCallback = callback;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                    checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION}, REQUEST_LOCATION);
                } else callback.invoke(origin, true, false);
            }
        });
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_MEDIA && pendingWebPermission != null) {
            boolean granted = true;
            for (int result : grantResults) if (result != PackageManager.PERMISSION_GRANTED) granted = false;
            if (granted) pendingWebPermission.grant(pendingWebPermission.getResources());
            else pendingWebPermission.deny();
            pendingWebPermission = null;
        }
        if (requestCode == REQUEST_LOCATION && pendingGeoCallback != null) {
            boolean granted = false;
            for (int result : grantResults) if (result == PackageManager.PERMISSION_GRANTED) granted = true;
            pendingGeoCallback.invoke(pendingGeoOrigin, granted, false);
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
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
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
    return `plugins {
    id 'com.android.application' version '8.7.3' apply false
}`;
  }

  function settingsGradle(c) {
    return `pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = '${escJava(c.name).replace(/\\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40) || 'Web2AppProject'}'
include ':app'
`;
  }

  function gradleProperties() {
    return `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`;
  }

  function appGradle(c) {
    return `plugins { id 'com.android.application' }

android {
    namespace '${c.pkg}'
    compileSdk 35

    defaultConfig {
        applicationId '${c.pkg}'
        minSdk 24
        targetSdk 35
        versionCode ${versionCode(c.version)}
        versionName '${c.version.replace(/'/g, '')}'
    }

    buildTypes {
        release {
            minifyEnabled false
            shrinkResources false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    packaging { resources { excludes += ['/META-INF/{AL2.0,LGPL2.1}'] } }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'androidx.webkit:webkit:1.12.1'
}
`;
  }

  function colors(c) {
    return `<resources>
    <color name="primary">${escXml(c.color)}</color>
    <color name="splash_background">${escXml(c.splash)}</color>
</resources>`;
  }

  function strings(c) {
    return `<resources>
    <string name="app_name">${escXml(c.name)}</string>
    <string name="target_url">${escXml(c.url)}</string>
    <string name="splash_tagline">${escXml(c.tagline)}</string>
</resources>`;
  }

  function styles(c) {
    return `<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:fontFamily">sans</item>
        <item name="android:colorAccent">@color/primary</item>
        <item name="android:statusBarColor">@color/primary</item>
        <item name="android:navigationBarColor">#000000</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>`;
  }

  function launcher(c) {
    return `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="${escXml(c.color)}" android:pathData="M54,4A50,50 0,1 0,54 104A50,50 0,1 0,54 4"/>
    <path android:fillColor="#FFFFFFFF" android:pathData="M32,35h44v10H32zM32,49h44v10H32zM32,63h28v10H32z"/>
</vector>`;
  }

  function proguard() {
    return `# Web2App Studio Pro defaults
-keepclassmembers class * extends android.webkit.WebChromeClient { *; }
-keepclassmembers class * extends android.webkit.WebViewClient { *; }
`;
  }

  function readme(c) {
    return `# ${c.name} — Web2App Studio Pro

Generated Android Studio project.

## Configuration
- Target URL: ${c.url}
- Package: ${c.pkg}
- Version: ${c.version}
- Target SDK: 35
- Min SDK: 24
- Orientation: ${orientation()}
- Camera & files: ${c.camera ? 'enabled' : 'disabled'}
- Location: ${c.location ? 'enabled' : 'disabled'}
- Pull-to-refresh: ${c.pullRefresh ? 'enabled in configuration' : 'disabled in configuration'}
- Bottom controls: ${c.bottomNav ? 'enabled in configuration' : 'disabled in configuration'}

## Build
1. Open this folder in Android Studio.
2. Let Gradle sync complete (JDK 17).
3. Run the debug variant on a device/emulator.
4. For distribution, configure a release keystore and build an AAB/APK.

The browser Studio generates source; it does not run Gradle or produce a real APK binary.
`;
  }

  function settingsFile() {
    return '';
  }

  async function addIcon(zip, c) {
    // Uploaded data-URL icons are preserved as a drawable asset.
    if (!c.icon || !c.icon.startsWith('data:image/')) return;
    const match = c.icon.match(/^data:image\\/(png|jpeg|jpg);base64,(.+)$/);
    if (!match) return;
    const bytes = Uint8Array.from(atob(match[2]), ch => ch.charCodeAt(0));
    zip.file('app/src/main/res/drawable-nodpi/custom_icon.' + (match[1] === 'jpg' ? 'jpeg' : match[1]), bytes);
  }

  async function buildProjectZip() {
    if (typeof JSZip === 'undefined') {
      showToast('ZIP engine is not available yet. Please try again.', 'error');
      return;
    }
    const c = config();
    if (!/^https?:\\/\\//i.test(c.url)) {
      showToast('Target URL must use http:// or https://.', 'error');
      return;
    }

    const zip = new JSZip();
    zip.file('settings.gradle', settingsGradle(c));
    zip.file('build.gradle', rootGradle());
    zip.file('gradle.properties', gradleProperties());
    zip.file('README.md', readme(c));
    zip.file('app/build.gradle', appGradle(c));
    zip.file('app/proguard-rules.pro', proguard());
    zip.file('app/src/main/AndroidManifest.xml', manifest(c));
    zip.file('app/src/main/java/' + packagePath(c.pkg) + '/MainActivity.java', mainActivity(c));
    zip.file('app/src/main/res/values/colors.xml', colors(c));
    zip.file('app/src/main/res/values/strings.xml', strings(c));
    zip.file('app/src/main/res/values/styles.xml', styles(c));
    zip.file('app/src/main/res/drawable/ic_launcher.xml', launcher(c));
    zip.file('app/src/main/res/drawable/ic_launcher_round.xml', launcher(c));
    zip.file('app/src/main/res/xml/file_paths.xml', '<?xml version="1.0" encoding="utf-8"?>\\n<paths xmlns:android="http://schemas.android.com/apk/res/android"><cache-path name="cache" path="." /></paths>');
    await addIcon(zip, c);

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'web2app-project') + '-android-studio.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('Professional Android Studio project exported.', 'success');
    return true;
  }

  function professionalBuild() {
    const modal = document.getElementById('build-modal');
    const pBar = document.getElementById('build-progress-bar');
    const percent = document.getElementById('build-percent');
    const stepText = document.getElementById('build-step-text');
    const terminal = document.getElementById('build-terminal');
    const complete = document.getElementById('build-complete-box');
    const icon = document.getElementById('build-icon');
    const title = document.getElementById('build-title');
    const close = document.getElementById('modal-close-btn');
    if (!modal) return;

    const c = config();
    if (!/^https?:\\/\\//i.test(c.url)) {
      showToast('Enter a valid HTTP(S) target URL first.', 'error');
      return;
    }

    modal.classList.remove('hidden');
    if (complete) complete.classList.add('hidden');
    if (close) close.classList.add('hidden');
    if (icon) icon.className = 'fa-solid fa-gear fa-spin text-brand-400';
    if (title) title.innerText = 'Generating Android Studio Project…';
    const logs = [
      ['10%', 'Validating target URL and package metadata'],
      ['25%', 'Generating AndroidManifest and runtime permission model'],
      ['45%', 'Generating hardened WebView + WebChromeClient'],
      ['65%', 'Generating Gradle Android project (SDK 35 / JDK 17)'],
      ['80%', 'Generating resources, launcher branding and configuration'],
      ['100%', 'Source project generated successfully — ready for Android Studio']
    ];
    if (terminal) terminal.innerHTML = '';
    let i = 0;
    const tick = () => {
      if (i >= logs.length) {
        if (pBar) pBar.style.width = '100%';
        if (percent) percent.innerText = '100%';
        if (stepText) stepText.innerText = 'Android Studio project ready';
        if (icon) icon.className = 'fa-solid fa-circle-check text-emerald-400';
        if (title) title.innerText = 'Android Studio Project Ready';
        if (complete) complete.classList.remove('hidden');
        if (close) close.classList.remove('hidden');
        generateQRCodeForDownload();
        saveCurrentAppToDashboard();
        return;
      }
      const [p, msg] = logs[i++];
      if (pBar) pBar.style.width = p;
      if (percent) percent.innerText = p;
      if (stepText) stepText.innerText = msg;
      if (terminal) {
        const line = document.createElement('div');
        line.innerText = '[EXPORT] ' + msg;
        if (p === '100%') line.className = 'text-emerald-400 font-bold';
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
      }
      setTimeout(tick, 260);
    };
    tick();
  }

  window.web2AppProjectExport = buildProjectZip;
  window.startBuildProcess = professionalBuild;

  // A fake text blob is not a valid APK. Route the old button to the real source export.
  window.triggerDirectApkDownload = function () {
    showToast('A real APK cannot be fabricated in the browser. Export the Android Studio project, then build the APK with Gradle.', 'info');
    return buildProjectZip();
  };

  window.triggerSourceZipDownload = buildProjectZip;
})();
