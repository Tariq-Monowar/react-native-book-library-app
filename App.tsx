import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import React, {FC, useCallback, useEffect, useState} from 'react';
import AppNavigation from './navigation/AppNavigation';
import './gesture-handler';
import {AppContextProvider} from './context/AppContext';
import SplashOverlay from './components/SplashOverlay';
import {notifySplashReady} from './utils/themeBridge';

const App: FC = () => {
  // Android plays the opening animation natively from the very first frame
  // (android/.../NativeSplash.kt), so it is already running while this code
  // loads; here we only tell it when the first screen is on display. Other
  // platforms play the same animation in JavaScript.
  const [splashVisible, setSplashVisible] = useState(Platform.OS !== 'android');
  const hideSplash = useCallback(() => setSplashVisible(false), []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // A short moment for the first screen to be drawn.
      const timer = setTimeout(notifySplashReady, 120);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        translucent={true}
        barStyle="dark-content"
        backgroundColor={'transparent'}
      />
      <AppContextProvider>
        <AppNavigation />
      </AppContextProvider>
      {splashVisible && <SplashOverlay onDone={hideSplash} />}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
