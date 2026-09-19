// Application Global State
        const state = {
            appName: "Wiki Pocket",
            appUrl: "https://wikipedia.org",
            appPackage: "com.web2app.wikipocket",
            appVersion: "1.0.0",
            primaryColor: "#4f46e5",
            splashBgColor: "#080a11",
            splashTagline: "Powered by Web2App Pro Engine",
            iconUrl: "https://placehold.co/128x128/6366f1/ffffff?text=APP",
            savedApps: []
        };

        // Helper getters for safe DOM element queries
        function getElVal(id, defaultVal = '') {
            const el = document.getElementById(id);
            return el ? el.value : defaultVal;
        }

        function getElChecked(id, defaultVal = false) {
            const el = document.getElementById(id);
            return el ? el.checked : defaultVal;
        }

        function setElVal(id, val) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        // 10 Pre-built Android App Templates
        const appTemplates = [
            {
                id: 'ecom',
                name: 'StoreExpress Pro',
                category: 'E-Commerce / Store',
                url: 'https://wikipedia.org',
                package: 'com.web2app.storeexpress',
                version: '1.0.0',
                primaryColor: '#e11d48',
                splashBg: '#0f172a',
                tagline: 'Your Premier Mobile Shopping Experience',
                icon: 'https://placehold.co/128x128/e11d48/ffffff?text=SHOP',
                badge: 'Popular',
                badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                desc: 'Tailored for online stores & Shopify/WooCommerce apps with pull-to-refresh & storage permissions.'
            },
            {
                id: 'news',
                name: 'TechPulse News',
                category: 'News & Magazine',
                url: 'https://news.ycombinator.com',
                package: 'com.web2app.techpulse',
                version: '1.2.0',
                primaryColor: '#ea580c',
                splashBg: '#09090b',
                tagline: 'Breaking Technology & Global Headlines',
                icon: 'https://placehold.co/128x128/ea580c/ffffff?text=NEWS',
                badge: 'Featured',
                badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                desc: 'Optimized news portal layout with fast loading and custom theme accent color.'
            },
            {
                id: 'food',
                name: 'TastyBites Bistro',
                category: 'Restaurant & Delivery',
                url: 'https://bento.me',
                package: 'com.web2app.tastybites',
                version: '1.0.0',
                primaryColor: '#dc2626',
                splashBg: '#18181b',
                tagline: 'Delicious Food Delivered to Your Doorstep',
                icon: 'https://placehold.co/128x128/dc2626/ffffff?text=FOOD',
                badge: 'Hot',
                badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
                desc: 'Includes location permissions and smooth WebView navigation for online ordering.'
            },
            {
                id: 'saas',
                name: 'DevHub Cloud Studio',
                category: 'SaaS Dashboard',
                url: 'https://github.com',
                package: 'com.web2app.devhub',
                version: '2.0.0',
                primaryColor: '#3b82f6',
                splashBg: '#020617',
                tagline: 'Cloud Developer Platform & Workspaces',
                icon: 'https://placehold.co/128x128/3b82f6/ffffff?text=SAAS',
                badge: 'Productivity',
                badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                desc: 'Designed for SaaS platforms and enterprise tools with bottom controls enabled.'
            },
            {
                id: 'edu',
                name: 'EduAcademy Online',
                category: 'E-Learning Portal',
                url: 'https://khanacademy.org',
                package: 'com.web2app.eduacademy',
                version: '1.1.0',
                primaryColor: '#059669',
                splashBg: '#064e3b',
                tagline: 'Learn Courses & Master Skills Anywhere',
                icon: 'https://placehold.co/128x128/059669/ffffff?text=EDU',
                badge: 'Education',
                badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                desc: 'Full-screen educational portal template with media & camera permissions.'
            },
            {
                id: 'fitness',
                name: 'FitTrack Health App',
                category: 'Fitness & Health',
                url: 'https://fitnotes.net',
                package: 'com.web2app.fittrack',
                version: '1.0.5',
                primaryColor: '#7c3aed',
                splashBg: '#2e1065',
                tagline: 'Track Workouts & Daily Health Goals',
                icon: 'https://placehold.co/128x128/7c3aed/ffffff?text=FIT',
                badge: 'Health',
                badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                desc: 'Pre-configured theme with vibrant violet accents for fitness trackers.'
            },
            {
                id: 'community',
                name: 'CommUnity Forum',
                category: 'Social Network',
                url: 'https://reddit.com',
                package: 'com.web2app.communityhub',
                version: '1.3.0',
                primaryColor: '#2563eb',
                splashBg: '#0f172a',
                tagline: 'Connect & Discuss in Global Communities',
                icon: 'https://placehold.co/128x128/2563eb/ffffff?text=SOC',
                badge: 'Social',
                badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                desc: 'Ideal for community forums, discussion boards, and social platforms.'
            },
            {
                id: 'realestate',
                name: 'UrbanHomes Finder',
                category: 'Real Estate',
                url: 'https://zillow.com',
                package: 'com.web2app.urbanhomes',
                version: '1.0.0',
                primaryColor: '#0284c7',
                splashBg: '#082f49',
                tagline: 'Find Dream Apartments & Luxury Homes',
                icon: 'https://placehold.co/128x128/0284c7/ffffff?text=HOME',
                badge: 'Property',
                badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                desc: 'Includes location map integration and custom launcher branding.'
            },
            {
                id: 'streaming',
                name: 'SoundWave Music',
                category: 'Media Streaming',
                url: 'https://soundcloud.com',
                package: 'com.web2app.soundwave',
                version: '2.1.0',
                primaryColor: '#d97706',
                splashBg: '#451a03',
                tagline: 'Stream Underground Tracks & Podcasts',
                icon: 'https://placehold.co/128x128/d97706/ffffff?text=PLAY',
                badge: 'Media',
                badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                desc: 'Streaming app layout configured with pull refresh and storage support.'
            },
            {
                id: 'portfolio',
                name: 'Creative Portfolio',
                category: 'Freelancer Portfolio',
                url: 'https://dribbble.com',
                package: 'com.web2app.creativeshowcase',
                version: '1.0.0',
                primaryColor: '#db2777',
                splashBg: '#18181b',
                tagline: 'Showcase Designs, Works & Projects',
                icon: 'https://placehold.co/128x128/db2777/ffffff?text=PORT',
                badge: 'Creative',
                badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                desc: 'Sleek portfolio showcase template for designers and agency websites.'
            }
        ];

        let currentCodeTab = 'manifest';

        // Initialize App
        window.addEventListener('DOMContentLoaded', () => {
            loadSavedAppsFromStorage();
            renderTemplatesGallery();
            updateSimulator();
            setInterval(updateSimClock, 1000);
            updateSimClock();

            // Load a template selected from the dedicated Templates page.
            try {
                const params = new URLSearchParams(window.location.search);
                const templateId = params.get('template');
                const pending = localStorage.getItem('web2app-pending-template');
                const tpl = templateId
                    ? appTemplates.find(t => t.id === templateId)
                    : (pending ? appTemplates.find(t => t.id === JSON.parse(pending).id) : null);

                if (tpl) {
                    applyTemplate(tpl.id);
                    localStorage.removeItem('web2app-pending-template');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (e) {
                // Ignore malformed URL/localStorage data and keep the builder usable.
            }
        });

        // Navigation Tab Switcher
        function switchTab(tabId) {
            ['builder', 'dashboard', 'templates', 'features', 'docs'].forEach(id => {
                const sec = document.getElementById(`section-${id}`);
                const navBtn = document.getElementById(`nav-${id}`);
                if (sec) sec.classList.add('hidden');
                if (navBtn) {
                    navBtn.classList.remove('bg-brand-600', 'text-white');
                    navBtn.classList.add('text-gray-400');
                }
            });

            const activeSec = document.getElementById(`section-${tabId}`);
            const activeNav = document.getElementById(`nav-${tabId}`);
            if (activeSec) activeSec.classList.remove('hidden');
            if (activeNav) {
                activeNav.classList.add('bg-brand-600', 'text-white');
                activeNav.classList.remove('text-gray-400');
            }
        }

        // Render Templates Gallery Cards
        function renderTemplatesGallery() {
            const grid = document.getElementById('templates-grid');
            if (!grid) return;

            grid.innerHTML = appTemplates.map(tpl => `
                <div class="glass-panel p-5 rounded-3xl border border-gray-800 hover:border-brand-500/40 transition-all space-y-4 flex flex-col justify-between group">
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-center gap-3">
                                <img src="${tpl.icon}" alt="${tpl.name}" class="w-12 h-12 rounded-2xl object-cover border border-gray-700 shadow-md group-hover:scale-105 transition-transform">
                                <div>
                                    <h4 class="text-white font-bold text-sm leading-tight">${tpl.name}</h4>
                                    <span class="text-[10px] text-gray-400 font-mono">${tpl.package}</span>
                                </div>
                            </div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tpl.badgeBg}">${tpl.badge}</span>
                        </div>

                        <div class="text-[11px] text-amber-400/90 font-semibold flex items-center gap-1.5">
                            <i class="fa-solid fa-tag text-xs"></i> ${tpl.category}
                        </div>

                        <p class="text-xs text-gray-400 leading-relaxed">${tpl.desc}</p>
                        
                        <div class="bg-gray-950/80 p-3 rounded-2xl border border-gray-900 text-xs space-y-1 font-mono text-gray-300">
                            <div class="flex justify-between items-center text-[11px]">
                                <span class="text-gray-500">Color Accent:</span>
                                <span class="flex items-center gap-1 font-bold">
                                    <span class="w-3 h-3 rounded-full inline-block border border-gray-700" style="background-color: ${tpl.primaryColor}"></span>
                                    ${tpl.primaryColor}
                                </span>
                            </div>
                            <div class="flex justify-between items-center text-[11px]">
                                <span class="text-gray-500">Target Web URL:</span>
                                <span class="text-brand-400 truncate max-w-[140px]">${tpl.url}</span>
                            </div>
                        </div>
                    </div>

                    <button onclick="applyTemplate('${tpl.id}')" class="w-full py-2.5 bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Use & Edit Template
                    </button>
                </div>
            `).join('');
        }

        // Apply Template settings into Studio Builder
        function applyTemplate(templateId) {
            const tpl = appTemplates.find(t => t.id === templateId);
            if (!tpl) return;

            setElVal('app-name', tpl.name);
            setElVal('app-url', tpl.url);
            setElVal('app-package', tpl.package);
            setElVal('app-version', tpl.version);
            setElVal('primary-color', tpl.primaryColor);
            setElVal('splash-bg-color', tpl.splashBg);
            setElVal('splash-tagline', tpl.tagline);

            state.iconUrl = tpl.icon;

            switchTab('builder');
            updateSimulator();
            showSplashAgain();
            showToast(`Loaded "${tpl.name}" Template into Studio!`, "success");
        }

        // Configuration Form Tabs
        function switchConfigTab(tabName) {
            ['basic', 'design', 'features', 'ai'].forEach(name => {
                const content = document.getElementById(`config-tab-${name}`);
                const btn = document.getElementById(`tab-btn-${name}`);
                if (content) content.classList.add('hidden');
                if (btn) {
                    btn.classList.remove('active', 'border-brand-500', 'text-brand-300', 'bg-gray-900/60');
                    btn.classList.add('border-transparent', 'text-gray-400');
                }
            });

            const activeContent = document.getElementById(`config-tab-${tabName}`);
            const activeBtn = document.getElementById(`tab-btn-${tabName}`);
            if (activeContent) activeContent.classList.remove('hidden');
            if (activeBtn) {
                activeBtn.classList.add('active', 'border-brand-500', 'text-brand-300', 'bg-gray-900/60');
                activeBtn.classList.remove('border-transparent', 'text-gray-400');
            }
        }

        // Color Picker Sync
        function syncColorInput(pickerId, hexValue) {
            const picker = document.getElementById(pickerId);
            if (picker) picker.value = hexValue;
            updateSimulator();
        }

        // Update Live Phone Simulator with Defensive Guards
        function updateSimulator() {
            state.appName = getElVal('app-name', "My Web App");
            state.appUrl = getElVal('app-url', "https://wikipedia.org");
            state.primaryColor = getElVal('primary-color', "#4f46e5");
            state.splashBgColor = getElVal('splash-bg-color', "#080a11");
            state.splashTagline = getElVal('splash-tagline', "");

            // Sync Hex Inputs
            setElVal('primary-color-text', state.primaryColor);
            setElVal('splash-bg-color-text', state.splashBgColor);

            // Sync Header & Status Bar Colors
            const statusBar = document.getElementById('sim-status-bar');
            if (statusBar) statusBar.style.backgroundColor = state.primaryColor;

            const header = document.getElementById('sim-header');
            if (header) header.style.backgroundColor = state.primaryColor;

            const splashScreen = document.getElementById('sim-splash-screen');
            if (splashScreen) splashScreen.style.backgroundColor = state.splashBgColor;

            // Sync Text Elements
            const simHeaderTitle = document.getElementById('sim-header-title');
            if (simHeaderTitle) simHeaderTitle.innerText = state.appName;

            const simSplashTitle = document.getElementById('sim-splash-title');
            if (simSplashTitle) simSplashTitle.innerText = state.appName;

            const simSplashTag = document.getElementById('sim-splash-tag');
            if (simSplashTag) simSplashTag.innerText = state.splashTagline;

            // Sync Images
            const simHeaderIcon = document.getElementById('sim-header-icon');
            if (simHeaderIcon) simHeaderIcon.src = state.iconUrl;

            const simSplashIcon = document.getElementById('sim-splash-icon');
            if (simSplashIcon) simSplashIcon.src = state.iconUrl;

            const iconPreviewImg = document.getElementById('icon-preview-img');
            if (iconPreviewImg) iconPreviewImg.src = state.iconUrl;

            // Sync Bottom Nav Bar
            const showBottomNav = getElChecked('feat-bottom-nav', true);
            const simBottomNav = document.getElementById('sim-bottom-nav');
            if (simBottomNav) simBottomNav.style.display = showBottomNav ? 'flex' : 'none';

            // Sync Frame URL
            const iframe = document.getElementById('sim-iframe');
            if (iframe && iframe.src !== state.appUrl) {
                iframe.src = state.appUrl;
            }
        }

        function showSplashAgain() {
            const splash = document.getElementById('sim-splash-screen');
            if (!splash) return;
            splash.style.opacity = '1';
            splash.style.pointerEvents = 'auto';
            setTimeout(() => {
                splash.style.opacity = '0';
                splash.style.pointerEvents = 'none';
            }, 1800);
        }

        function reloadSimulator() {
            const iframe = document.getElementById('sim-iframe');
            if (iframe) iframe.src = iframe.src;
        }

        function onIframeLoaded() {
            const splash = document.getElementById('sim-splash-screen');
            if (splash) {
                splash.style.opacity = '0';
                splash.style.pointerEvents = 'none';
            }
        }

        function simNav(action) {
            showToast("Simulator Navigation: " + action);
        }

        function updateSimClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const clock = document.getElementById('sim-clock');
            if (clock) clock.innerText = `${hours}:${minutes}`;
        }

        function togglePhoneTheme() {
            const nav = document.getElementById('sim-bottom-nav');
            if (!nav) return;
            if (nav.classList.contains('bg-gray-950')) {
                nav.classList.remove('bg-gray-950', 'text-gray-400');
                nav.classList.add('bg-gray-100', 'text-gray-700');
            } else {
                nav.classList.remove('bg-gray-100', 'text-gray-700');
                nav.classList.add('bg-gray-950', 'text-gray-400');
            }
        }

        function testTargetUrl() {
            let url = getElVal('app-url', 'https://example.com');
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
                setElVal('app-url', url);
            }
            window.open(url, '_blank');
        }

        function autoGeneratePackageId() {
            const name = getElVal('app-name', 'myapp');
            const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            setElVal('app-package', `com.web2app.${sanitized || 'app'}`);
            showToast("Auto-generated Android Package ID!");
        }

        function handleIconUpload(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    state.iconUrl = evt.target.result;
                    updateSimulator();
                    showToast("Custom launcher icon applied!");
                };
                reader.readAsDataURL(file);
            }
        }

        function quickDemo() {
            setElVal('app-name', "Wikipedia Mobile");
            setElVal('app-url', "https://wikipedia.org");
            setElVal('primary-color', "#0066cc");
            setElVal('splash-bg-color', "#080a11");
            setElVal('splash-tagline', "The Free Encyclopedia Mobile App");
            autoGeneratePackageId();
            updateSimulator();
            showSplashAgain();
            showToast("Loaded preset demo configurations!");
        }

        // ================= GEMINI AI INTEGRATIONS =================
        async function generateAIIcon() {
            const appName = getElVal('app-name', "App");
            showToast("Generating custom app icon preview...", "info");
            state.iconUrl = `https://placehold.co/128x128/6366f1/ffffff?text=${encodeURIComponent(appName.substring(0,4).toUpperCase())}`;
            updateSimulator();
            showToast("Icon preview generated!", "success");
        }

        async function generateAIMetadata() {
            const appName = getElVal('app-name', "App");
            const appUrl = getElVal('app-url', "https://example.com");
            
            const outputBox = document.getElementById('ai-output-box');
            if (outputBox) outputBox.classList.remove('hidden');

            setElVal('ai-output-text', `Welcome to the official ${appName} Android application!\n\nAccess all features and web content directly from ${appUrl} with hardware-accelerated WebView performance, offline capabilities, fast pull-to-refresh, and native device interactions.\n\nKey Features:\n• Full native Android navigation bar\n• Optimized screen layout and responsive views\n• Fast loading and secure SSL connections\n• Custom splash screen & launcher icon integration`);
            showToast("Generated Play Store listing text!");
        }

        async function generateAIPrivacyPolicy() {
            const appName = getElVal('app-name', "App");
            const pkg = getElVal('app-package', "com.app");
            
            const outputBox = document.getElementById('ai-output-box');
            if (outputBox) outputBox.classList.remove('hidden');

            setElVal('ai-output-text', `PRIVACY POLICY FOR ${appName.toUpperCase()} (${pkg})\n\nThis Android application wraps web content loaded from ${state.appUrl}. We do not collect, harvest, or store personal telemetry or user data outside of necessary standard network logs required by web servers.`);
            showToast("Drafted Privacy Policy!");
        }

        function copyAiOutput() {
            const txt = getElVal('ai-output-text');
            if (txt) {
                navigator.clipboard.writeText(txt);
                showToast("Copied to clipboard!");
            }
        }

        // ================= BUILD & COMPILER ENGINE =================
        // The browser generates a valid Android Studio source project.
        // APK/AAB binaries require a real Gradle build environment.
        function startBuildProcess() {
            if (typeof window.startBuildProcess === 'function' && window.startBuildProcess !== startBuildProcess) {
                return window.startBuildProcess();
            }
            showToast("Android project exporter is not available.", "error");
        }

        function closeBuildModal() {
            const modal = document.getElementById('build-modal');
            if (modal) modal.classList.add('hidden');
        }

        function generateQRCodeForDownload() {
            const container = document.getElementById('qrcode-canvas');
            if (!container) return;
            container.innerHTML = "";
            if (window.QRCode) {
                new QRCode(container, {
                    text: state.appUrl,
                    width: 95,
                    height: 95,
                    colorDark: "#080a11",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        }

        // ================= CODE GENERATION TEMPLATES =================
        function getManifestCode() {
            const pkg = getElVal('app-package', state.appPackage);
            return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkg}">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${state.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;
        }

        function getJavaCode() {
            const safePkg = getElVal('app-package', state.appPackage);
            return `package ${safePkg};

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("${state.appUrl}");
        
        setContentView(webView);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;
        }

        function getGradleCode() {
            const pkg = getElVal('app-package', state.appPackage);
            const ver = getElVal('app-version', '1.0.0');
            return `plugins {
    id 'com.android.application'
}

android {
    compileSdk 34

    defaultConfig {
        applicationId "${pkg}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "${ver}"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
}`;
        }

        // ================= CODE VIEWER MODAL LOGIC =================
        function openCodeViewerModal() {
            const modal = document.getElementById('code-viewer-modal');
            if (modal) modal.classList.remove('hidden');
            switchCodeTab('manifest');
        }

        function closeCodeViewerModal() {
            const modal = document.getElementById('code-viewer-modal');
            if (modal) modal.classList.add('hidden');
        }

        function switchCodeTab(tab) {
            currentCodeTab = tab;
            const display = document.getElementById('code-display-textarea');
            if (!display) return;

            ['manifest', 'java', 'gradle'].forEach(t => {
                const btn = document.getElementById(`code-tab-btn-${t}`);
                if (btn) btn.className = "px-3 py-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900";
            });

            const activeBtn = document.getElementById(`code-tab-btn-${tab}`);
            if (activeBtn) activeBtn.className = "px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold";

            if (tab === 'manifest') display.value = getManifestCode();
            else if (tab === 'java') display.value = getJavaCode();
            else if (tab === 'gradle') display.value = getGradleCode();
        }

        function copyActiveCodeToClipboard() {
            const textarea = document.getElementById('code-display-textarea');
            if (textarea && textarea.value) {
                navigator.clipboard.writeText(textarea.value);
                showToast("Source code copied to clipboard!", "success");
            }
        }

        // ================= LEGAL PAGES MODAL LOGIC =================
        const legalDocs = {
            privacy: {
                title: "Privacy Policy",
                icon: "fa-solid fa-shield-halved",
                content: `<h4 class="font-bold text-white text-sm">1. Information Collection</h4>
                <p>Web2App Studio Pro operates as a client-side Android APK builder. We do not store, harvest, or commercialize target URLs or application credentials configured inside the editor.</p>
                <h4 class="font-bold text-white text-sm mt-3">2. Data Usage</h4>
                <p>All app generation processes occur in-memory or within your local browser storage. Compiled APK packages are signed locally for developer testing.</p>`
            },
            terms: {
                title: "Terms of Service",
                icon: "fa-solid fa-file-contract",
                content: `<h4 class="font-bold text-white text-sm">1. Usage License</h4>
                <p>By using Web2App Studio Pro, you agree not to compile websites containing phishing, malware, copyright infringement, or illegal material.</p>
                <h4 class="font-bold text-white text-sm mt-3">2. Disclaimer of Warranty</h4>
                <p>The compiler software is provided 'as is' without warranties regarding Google Play Console acceptance or third-party store approvals.</p>`
            },
            cookies: {
                title: "Cookie Policy",
                icon: "fa-solid fa-cookie-bite",
                content: `<h4 class="font-bold text-white text-sm">Local Storage & Session Cookies</h4>
                <p>We use browser LocalStorage strictly to persist your saved app configurations and builder presets. No tracking cookies are transmitted to external marketing platforms.</p>`
            },
            disclaimer: {
                title: "Disclaimer Notice",
                icon: "fa-solid fa-triangle-exclamation",
                content: `<h4 class="font-bold text-white text-sm">Trademark Notice</h4>
                <p>Android, Google Play, and Android Studio are registered trademarks of Google LLC. Web2App Studio Pro is an independent web tool and is not affiliated with or endorsed by Google LLC.</p>`
            },
            gdpr: {
                title: "GDPR Compliance",
                icon: "fa-solid fa-user-lock",
                content: `<h4 class="font-bold text-white text-sm">General Data Protection Regulation</h4>
                <p>Users have full control over their saved project data. You can clear your stored projects at any time using the dashboard management tools or by clearing browser cache.</p>`
            }
        };

        function openLegalModal(docKey) {
            const doc = legalDocs[docKey] || legalDocs.privacy;
            const modal = document.getElementById('legal-modal');
            const title = document.getElementById('legal-modal-title');
            const icon = document.getElementById('legal-modal-icon');
            const body = document.getElementById('legal-modal-body');

            if (modal && title && icon && body) {
                title.innerText = doc.title;
                icon.className = doc.icon;
                body.innerHTML = doc.content;
                modal.classList.remove('hidden');
            }
        }

        function closeLegalModal() {
            const modal = document.getElementById('legal-modal');
            if (modal) modal.classList.add('hidden');
        }

        // Local Storage Saved Apps
        function loadSavedAppsFromStorage() {
            try {
                const stored = localStorage.getItem('web2app_pro_projects_en');
                state.savedApps = stored ? JSON.parse(stored) : [];
            } catch (e) {
                state.savedApps = [];
            }
            renderDashboard();
        }

        function renderDashboard() {
            const countEl = document.getElementById('saved-count');
            if (countEl) countEl.innerText = state.savedApps.length;

            const emptyBox = document.getElementById('dashboard-empty');
            const grid = document.getElementById('dashboard-grid');

            if (!emptyBox || !grid) return;

            if (state.savedApps.length === 0) {
                emptyBox.classList.remove('hidden');
                grid.classList.add('hidden');
            } else {
                emptyBox.classList.add('hidden');
                grid.classList.remove('hidden');

                grid.innerHTML = state.savedApps.map(app => `
                    <div class="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <img src="${app.icon || 'https://placehold.co/128x128/6366f1/ffffff?text=APP'}" class="w-12 h-12 rounded-2xl object-cover border border-gray-700">
                                <div>
                                    <h4 class="text-white font-bold text-sm truncate max-w-[150px]">${app.name}</h4>
                                    <p class="text-[11px] text-gray-400 font-mono truncate max-w-[150px]">${app.package}</p>
                                </div>
                            </div>
                            <button onclick="deleteSavedApp(${app.id})" class="text-gray-500 hover:text-red-400 text-xs p-1">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        <div class="bg-gray-950/80 p-3 rounded-2xl border border-gray-900 text-xs text-gray-400 space-y-1">
                            <div class="flex justify-between">
                                <span>Target:</span>
                                <span class="text-gray-200 truncate max-w-[160px]">${app.url}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Version:</span>
                                <span class="text-brand-400 font-mono">${app.version}</span>
                            </div>
                        </div>
                        <button onclick="loadAppFromDashboard(${app.id})" class="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition">
                            <i class="fa-solid fa-pen-to-square mr-1"></i> Edit in Builder
                        </button>
                    </div>
                `).join('');
            }
        }

        function deleteSavedApp(id) {
            state.savedApps = state.savedApps.filter(app => app.id !== id);
            localStorage.setItem('web2app_pro_projects_en', JSON.stringify(state.savedApps));
            renderDashboard();
            showToast("App removed from local history");
        }

        function loadAppFromDashboard(id) {
            const app = state.savedApps.find(a => a.id === id);
            if (!app) return;

            setElVal('app-name', app.name);
            setElVal('app-url', app.url);
            setElVal('app-package', app.package);
            setElVal('app-version', app.version || "1.0.0");
            if (app.color) setElVal('primary-color', app.color);
            if (app.icon) state.iconUrl = app.icon;

            switchTab('builder');
            updateSimulator();
            showToast(`Loaded "${app.name}" into Studio!`, "success");
        }

        function saveCurrentAppToDashboard() {
            const appObj = {
                id: Date.now(),
                name: state.appName,
                url: state.appUrl,
                package: getElVal('app-package', state.appPackage),
                version: getElVal('app-version', '1.0.0'),
                color: state.primaryColor,
                icon: state.iconUrl,
                date: new Date().toLocaleDateString()
            };

            state.savedApps.unshift(appObj);
            localStorage.setItem('web2app_pro_projects_en', JSON.stringify(state.savedApps));
            renderDashboard();
        }

        // Toast Notifications Handler
        function showToast(msg, type = "info") {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            const bgClass = type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-gray-900 border border-gray-700";
            
            toast.className = `${bgClass} text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0`;
            toast.innerHTML = `<i class="fa-solid fa-circle-info"></i><span>${msg}</span>`;

            container.appendChild(toast);
            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 50);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
