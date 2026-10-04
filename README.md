# Web2App Studio Pro

A modern, browser-based tool for turning a website into a native Android app project. The app helps users define branding, splash screens, permissions, and Android package metadata, then generate an Android Studio-ready project structure and source snippets in the browser.

## What this project does

- Converts a website URL into a WebView-based Android app configuration
- Lets users customize app identity, theme, splash screen, icon, and permissions
- Generates Android source artifacts for export or inspection
- Provides template-driven starter flows for common app categories
- Saves project drafts in browser storage for reuse
- Includes a documentation, legal, and templates experience for a polished landing-page product feel

## Stack

- Frontend: HTML, CSS, JavaScript
- Styling: Tailwind CSS via CDN
- Runtime: static web app served through any web server or GitHub Pages
- Android project output: Gradle + Android Studio project skeleton

## Project structure

```text
.
├── index.html
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/
│   ├── icons/
│   ├── images/
│   └── js/
│       ├── app.js
│       ├── android-project.js
│       ├── layout.js
│       ├── site-core.js
│       └── tailwind.config.js
├── pages/
│   ├── apps/
│   ├── blog/
│   ├── docs/
│   ├── features/
│   ├── legal/
│   └── templates/
├── android-project/
│   ├── app/
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── settings.gradle
│   └── README.md
└── README.md
```

## How to run locally

Because this is a static site, you can serve it with any local web server.

```bash
cd todroid
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Production notes

This project is designed as a frontend product experience plus Android project generation logic. It is intentionally static and browser-driven, which makes it easy to deploy on GitHub Pages or any static hosting provider.

## Recommended future improvements

- Extract the builder logic into modules for easier testing and maintenance
- Add a real backend or API layer for production-grade project generation
- Add automated browser tests for the main flows
- Introduce stronger validation for URLs, package IDs, and app configuration
- Add a robust PWA offline layer and install flow
- Improve the Android build/export flow with a real backend compiler pipeline

## Notes

The generated Android project is a realistic Studio template intended for CI validation and export workflows. This project is a frontend-first product and does not replace a full native build service by itself.
