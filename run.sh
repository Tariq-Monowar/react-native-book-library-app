#!/bin/bash
# Starts the emulator and Metro if they are not running, then builds,
# installs and opens the app.
cd "$(dirname "$0")" || exit 1

export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

if ! adb devices | grep -q "emulator-.*device$"; then
  echo "Starting emulator..."
  nohup emulator -avd Pixel_4 >/dev/null 2>&1 &
  adb wait-for-device
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done
fi

if ! lsof -iTCP:8081 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Starting Metro..."
  nohup npx react-native start >/tmp/metro.log 2>&1 &
  sleep 5
fi

npx react-native run-android --no-packager
