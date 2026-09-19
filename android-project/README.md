# Web2App Studio Pro — Android CI Build

This checked-in project is a CI validation target for the Android project generator.

GitHub Actions builds:
- Debug APK
- Release AAB (unsigned unless release signing is configured)

The production Studio still exports a customized Android Studio project in the browser. This project exists so the repository has a real, repeatable Android build pipeline using GitHub Actions.
