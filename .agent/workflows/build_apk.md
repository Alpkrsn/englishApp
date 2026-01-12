---
description: How to build an Android APK file for local testing
---

1. Install EAS CLI (if not already installed):
   ```powershell
   npm install -g eas-cli
   ```

2. Login to your Expo account:
   ```powershell
   eas login
   ```

3. Run the build command to generate an APK:
   ```powershell
   eas build --platform android --profile preview
   ```
   - Select "Yes" to generate a new keystore if asked.
   - Wait for the build to finish in the cloud.
   - Download the `.apk` file from the link provided at the end.
