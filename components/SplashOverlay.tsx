import React, {FC, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {getLocalData} from '../utils/asyncstorage';
import {notifySplashReady} from '../utils/themeBridge';

// The app's opening animation. The phone shows only a plain background in
// the app's own colour while the app starts (see
// android/app/src/main/res/drawable/splash_screen.xml), so this animation is
// the first thing the reader actually sees.
//
// It uses the app's colours: light or dark, whichever the reader chose in
// the app, or the phone's setting if they have not chosen.
//
// Kept deliberately light for older phones: a handful of views, the icon as
// the only image, and only opacity and transform animations, which run on the
// UI thread with the native driver. It removes itself when done.

const LOGO_SIZE = 112;
// The phone centres its launch icon on the whole screen (including the
// system bars); centre ours on the same point so nothing moves.
const SCREEN_CENTER_Y = Dimensions.get('screen').height / 2;

// Same values as appBackground / textColor / subTextColor in ThemeContext.
const PALETTE = {
  light: {
    background: '#f9fafc',
    title: '#0a1930',
    subtitle: '#5b6577',
    accent: '#263147',
    statusBar: 'dark-content' as const,
  },
  dark: {
    background: '#2a2a2a',
    title: '#e1e1e1',
    subtitle: '#a8a8a8',
    accent: '#d9b77a',
    statusBar: 'light-content' as const,
  },
};

const SplashOverlay: FC<{onDone: () => void}> = ({onDone}) => {
  const systemTheme = useColorScheme();
  // The reader's saved choice ('light', 'dark' or '' for "follow the
  // phone"); null until it has been read.
  const [saved, setSaved] = useState<string | null>(null);
  useEffect(() => {
    getLocalData('theme')
      .then(value => setSaved(value || ''))
      .catch(() => setSaved(''));
  }, []);
  const mode = (saved || systemTheme) === 'dark' ? 'dark' : 'light';
  const colors = PALETTE[mode];
  // The icon image must be decoded before the splash takes over from the
  // phone's launch picture, or there would be a frame without it.
  const [iconShown, setIconShown] = useState(false);
  const ready = saved !== null && iconShown;
  // The phone's launch screen can only follow the phone's own setting. If
  // the reader chose the other theme inside the app, the splash starts in
  // the phone's colour and fades over to the app's.
  const phoneMode = systemTheme === 'dark' ? 'dark' : 'light';
  const startsDifferent = ready && phoneMode !== mode;
  const tint = useRef(new Animated.Value(0)).current;

  const enter = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const line = useRef(new Animated.Value(0)).current;
  const subtitle = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!ready) {
      return;
    }
    const ease = Easing.bezier(0.22, 1, 0.36, 1);
    const ripple = (value: Animated.Value) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    const reveal = (value: Animated.Value, duration = 520) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: ease,
        useNativeDriver: true,
      });

    const animation = Animated.sequence([
      // Fade from the phone's launch colour to the app's, if they differ.
      Animated.timing(tint, {
        toValue: 1,
        duration: startsDifferent ? 260 : 0,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // The icon is already on screen (the phone's launch picture showed
      // it); it "breathes" once as the animation takes over.
      Animated.sequence([
        Animated.timing(enter, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(enter, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        // The lens "searches": two rings spread out from the icon.
        ripple(ring1),
        Animated.sequence([Animated.delay(260), ripple(ring2)]),
        // The name rises in under it, then the rule, then the author.
        reveal(title),
        Animated.sequence([Animated.delay(220), reveal(line, 460)]),
        Animated.sequence([Animated.delay(360), reveal(subtitle)]),
      ]),
      Animated.delay(300),
      Animated.timing(exit, {
        toValue: 1,
        duration: 340,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animation.start(({finished}) => {
      if (finished) {
        onDone();
      }
    });
    return () => animation.stop();
  }, [
    ready,
    startsDifferent,
    tint,
    enter,
    ring1,
    ring2,
    title,
    line,
    subtitle,
    exit,
    onDone,
  ]);

  const ringStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0, 0.5, 0],
    }),
    transform: [
      {
        scale: value.interpolate({inputRange: [0, 1], outputRange: [1, 2.1]}),
      },
    ],
  });

  const rise = (value: Animated.Value, distance: number) => ({
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.root,
        {
          // Matches the phone's launch screen exactly.
          backgroundColor: PALETTE[phoneMode].background,
          opacity: exit.interpolate({inputRange: [0, 1], outputRange: [1, 0]}),
        },
      ]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: colors.background, opacity: tint},
        ]}
      />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colors.statusBar}
      />
      {
        <View style={[styles.center, {top: SCREEN_CENTER_Y}]}>
          <Animated.View
            style={[
              styles.ring,
              {borderColor: colors.accent},
              ringStyle(ring1),
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {borderColor: colors.accent},
              ringStyle(ring2),
            ]}
          />
          <Animated.Image
            source={require('../assets/image/icon.png')}
            fadeDuration={0}
            onLoad={() => {
              setIconShown(true);
              // Give the icon a few frames to be drawn before the phone's
              // launch picture steps aside.
              setTimeout(notifySplashReady, 120);
            }}
            style={[
              styles.logo,
              {
                transform: [
                  {
                    scale: Animated.add(
                      enter.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.06],
                      }),
                      exit.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.14],
                      }),
                    ),
                  },
                ],
              },
            ]}
          />

          <View style={styles.texts}>
            <Animated.Text
              style={[styles.title, {color: colors.title}, rise(title, 14)]}>
              শার্লক হোমস সমগ্র
            </Animated.Text>
            <Animated.View
              style={[
                styles.line,
                {
                  backgroundColor: colors.accent,
                  opacity: line,
                  transform: [{scaleX: line}],
                },
              ]}
            />
            <Animated.Text
              style={[
                styles.subtitle,
                {color: colors.subtitle},
                rise(subtitle, 10),
              ]}>
              স্যার আর্থার কোনান ডয়েল
            </Animated.Text>
          </View>
        </View>
      }
    </Animated.View>
  );
};

export default SplashOverlay;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  // A zero-height box at the exact centre of the screen: the icon is centred
  // on it and the text hangs below it.
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    top: -LOGO_SIZE / 2,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 1.5,
  },
  logo: {
    position: 'absolute',
    top: -LOGO_SIZE / 2,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  texts: {
    position: 'absolute',
    top: LOGO_SIZE / 2 + 34,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'kalpurush',
    fontSize: 30,
    lineHeight: 38,
  },
  line: {
    width: 44,
    height: 2,
    borderRadius: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'kalpurush',
    fontSize: 16.5,
    lineHeight: 22,
  },
});
