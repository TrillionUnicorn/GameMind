# 🔨 Build Guide - GameMind Flutter App

**Complete guide to building APK and IPA files**

---

## 📋 Prerequisites

### System Requirements
- Flutter 3.16+
- Dart 3.2+
- 10GB free disk space
- macOS 12+ (for iOS)
- Windows/macOS/Linux (for Android)

### Tools Installation

**Flutter:**
```bash
# Download Flutter
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Verify installation
flutter doctor
```

**Android:**
- Android Studio 2023.1+
- Android SDK 34+
- NDK 25.1+

**iOS:**
- Xcode 15+
- CocoaPods 1.14+
- iOS 12.0+ deployment target

---

## 🔧 Setup

### 1. Clone Repository
```bash
git clone https://github.com/TrillionUnicorn/GameMind.git
cd MOBILE/flutter_app
```

### 2. Get Dependencies
```bash
flutter pub get
flutter pub run build_runner build
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API URLs and keys
```

### 4. Verify Setup
```bash
flutter doctor
flutter analyze
flutter test
```

---

## 📱 Android Build

### Debug APK

```bash
# Build debug APK
flutter build apk --debug

# Output: build/app/outputs/flutter-apk/app-debug.apk
```

### Release APK

```bash
# Create keystore (first time only)
keytool -genkey -v -keystore ~/gamemind-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias gamemind

# Build release APK
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### App Bundle (for Play Store)

```bash
# Build app bundle
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

### Signing Configuration

**android/key.properties:**
```properties
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=gamemind
storeFile=<path-to-keystore>
```

**android/app/build.gradle:**
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
```

---

## 🍎 iOS Build

### Debug Build

```bash
# Build debug app
flutter build ios --debug

# Run on simulator
flutter run -d <simulator-id>
```

### Release Build

```bash
# Build release app
flutter build ios --release

# Output: build/ios/iphoneos/Runner.app
```

### Archive for App Store

```bash
# Create archive
flutter build ios --release

# Open in Xcode
open ios/Runner.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device (arm64)"
# 2. Product > Archive
# 3. Distribute App
# 4. App Store Connect
```

### Signing Configuration

**ios/Runner.xcodeproj/project.pbxproj:**
```
PROVISIONING_PROFILE_SPECIFIER = "GameMind Distribution"
CODE_SIGN_IDENTITY = "iPhone Distribution"
DEVELOPMENT_TEAM = "YOUR_TEAM_ID"
```

---

## 📦 Build Optimization

### Size Optimization

```bash
# Analyze app size
flutter build apk --analyze-size --release

# Remove unused code
flutter build apk --split-per-abi --release
```

### Performance Optimization

```bash
# Enable profiling
flutter build apk --profile

# Check performance
flutter run --profile
```

---

## 🧪 Testing Before Build

### Run Tests
```bash
# Unit tests
flutter test

# Widget tests
flutter test test/widget/

# Integration tests
flutter drive --target=test_driver/app.dart
```

### Lint & Analyze
```bash
# Analyze code
flutter analyze

# Format code
dart format lib/

# Check for issues
dart fix --dry-run
```

---

## 📊 Build Artifacts

### Android Artifacts
- **Debug APK:** `build/app/outputs/flutter-apk/app-debug.apk`
- **Release APK:** `build/app/outputs/flutter-apk/app-release.apk`
- **App Bundle:** `build/app/outputs/bundle/release/app-release.aab`

### iOS Artifacts
- **Debug App:** `build/ios/Debug-iphonesimulator/Runner.app`
- **Release App:** `build/ios/iphoneos/Runner.app`
- **Archive:** `build/ios/archive/Runner.xcarchive`

---

## 🚀 CI/CD Build

### GitHub Actions

**.github/workflows/build.yml:**
```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔍 Troubleshooting

### Build Fails
```bash
# Clean build
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build

# Rebuild
flutter build apk --release
```

### Gradle Issues
```bash
# Update Gradle
cd android
./gradlew wrapper --gradle-version 8.1
cd ..
```

### Pod Issues (iOS)
```bash
# Update pods
cd ios
pod repo update
pod install --repo-update
cd ..
```

---

## 📝 Version Management

### Update Version

**pubspec.yaml:**
```yaml
version: 1.0.0+1
```

Format: `major.minor.patch+build`

### Build Number
```bash
# Increment build number
flutter build apk --build-number=2
```

---

## ✅ Pre-Release Checklist

- [ ] All tests passing
- [ ] No lint warnings
- [ ] Version updated
- [ ] Changelog updated
- [ ] Screenshots prepared
- [ ] Store listing complete
- [ ] Privacy policy ready
- [ ] Terms of service ready
- [ ] Build tested on device
- [ ] Performance verified

---

**Status:** Ready to build! 🚀

