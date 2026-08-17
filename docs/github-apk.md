# Noum List Android APK

The Android project is stored in `android/` and wraps the locally built Noum List web interface. It does not require the deployed website to open its app shell.

## Automated release

Pushing a version tag that starts with `v` starts the APK workflow. For example, tag `v1.0.0` creates a GitHub Release containing `Noum-List.apk`. A manually triggered workflow also keeps an installable APK in its run artifacts.

The debug APK is signed with the standard debug key and is intended for personal installation and testing. A Play Store release should use a dedicated release signing key and an Android App Bundle.
