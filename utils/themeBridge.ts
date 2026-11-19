import {NativeModules, Platform} from 'react-native';

// Lets Android draw its launch screen in the theme chosen inside the app
// (see ThemeBridgeModule.kt). `mode` is 'light', 'dark', or '' to follow the
// phone. Does nothing on iOS or where the native part is missing.
export const syncLaunchTheme = (mode: string) => {
  if (Platform.OS !== 'android') {
    return;
  }
  NativeModules.ThemeBridge?.setNightMode?.(mode || 'auto');
};

// Tells Android the animated splash is on screen, so its own launch picture
// can step aside (see MainActivity.onCreate).
export const notifySplashReady = () => {
  if (Platform.OS !== 'android') {
    return;
  }
  NativeModules.ThemeBridge?.splashReady?.();
};

// Every button press plays the app's own tap sound on Android (see
// ThemeBridgeModule.playTap), instead of the system click, which many phones
// have switched off. React Native's buttons all go through SoundManager, so
// replacing it here covers the whole app.
export const installTapSound = () => {
  if (Platform.OS !== 'android' || !NativeModules.ThemeBridge?.playTap) {
    return;
  }
  const SoundManager = require('react-native/Libraries/Components/Sound/SoundManager');
  SoundManager.playTouchSound = () => NativeModules.ThemeBridge.playTap();
};
