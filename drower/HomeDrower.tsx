import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import React, {FC, ReactNode, useEffect, useState} from 'react';
import {
  DrawerContentComponentProps,
  useDrawerProgress,
} from '@react-navigation/drawer';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ClockIcon,
  CodeBracketIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ShareIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
} from 'react-native-heroicons/outline';

import {UseAppContext} from '../context/AppContext';
import {useThemeColors} from '../context/ThemeContext';
import {booksList} from '../database/HomeBookData';

const STORE_URL =
  'https://play.google.com/store/apps/details?id=com.holmes_somograh';

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';
const toBengaliNumber = (value: number) =>
  String(value).replace(/\d/g, digit => BENGALI_DIGITS[Number(digit)]);

// ToastAndroid does nothing on iOS, so fall back to an alert there.
const notify = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

type Colors = ReturnType<typeof useThemeColors>;
type IconType = typeof BookmarkIcon;

// Each block slides and fades in as the drawer opens. It is driven by the
// drawer's own progress value, so it follows a finger drag exactly and runs
// on the UI thread; later blocks start a little later for a cascade.
const Reveal: FC<{
  progress: SharedValue<number>;
  index: number;
  children: ReactNode;
}> = ({progress, index, children}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const start = index * 0.07;
    const shown = interpolate(
      progress.value,
      [start, Math.min(1, start + 0.6)],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: shown,
      transform: [{translateX: (1 - shown) * -22}],
    };
  });
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

type RowProps = {
  colors: Colors;
  Icon: IconType;
  label: string;
  onPress: () => void;
  // What sits at the right edge: a chevron for in-app pages, an "opens
  // outside" arrow for links, or a custom control such as the switch.
  trailing?: 'chevron' | 'external' | ReactNode;
  last?: boolean;
};

const Row: FC<RowProps> = ({colors, Icon, label, onPress, trailing, last}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    android_ripple={{color: colors.softFill}}
    style={({pressed}) => [
      styles.row,
      pressed && Platform.OS === 'ios' && {backgroundColor: colors.softFill},
    ]}>
    <View style={[styles.rowIcon, {backgroundColor: colors.softFill}]}>
      <Icon size={20} strokeWidth={2} color={colors.iconColor} />
    </View>
    <View
      style={[
        styles.rowMain,
        !last && {
          borderBottomColor: colors.borderColor,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}>
      {/* Keep every label on one line; shrink slightly before wrapping. */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[styles.rowLabel, {color: colors.textColor}]}>
        {label}
      </Text>
      {trailing === 'chevron' ? (
        <ChevronRightIcon
          size={18}
          strokeWidth={2.2}
          color={colors.subTextColor}
        />
      ) : trailing === 'external' ? (
        <ArrowTopRightOnSquareIcon
          size={17}
          strokeWidth={2}
          color={colors.subTextColor}
        />
      ) : (
        trailing
      )}
    </View>
  </Pressable>
);

const Section: FC<{colors: Colors; title: string; children: ReactNode}> = ({
  colors,
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, {color: colors.subTextColor}]}>
      {title}
    </Text>
    <View
      style={[
        styles.group,
        {
          backgroundColor: colors.cardColor,
          borderColor: colors.borderColor,
          shadowColor: colors.shadowColor,
        },
      ]}>
      <View style={styles.groupClip}>{children}</View>
    </View>
  </View>
);

const HomeDrawer: FC<DrawerContentComponentProps> = ({navigation}) => {
  const {isDarkMode, toggleTheme, todos} = UseAppContext();
  const colors = useThemeColors();
  const {appBackground, textColor, subTextColor} = colors;
  const progress = useDrawerProgress() as SharedValue<number>;

  const bookmarkCount: number = todos?.length ?? 0;

  // The row changes the moment it is tapped; the colours follow a moment
  // later with the wipe animation.
  const [shownDark, setShownDark] = useState(isDarkMode);
  useEffect(() => {
    setShownDark(isDarkMode);
  }, [isDarkMode]);
  const onToggleTheme = () => {
    if (toggleTheme()) {
      setShownDark(dark => !dark);
    }
  };

  // Close the drawer first, so coming back lands on the books, not the menu.
  const goTo = (screen: string) => {
    navigation.closeDrawer();
    navigation.navigate(screen);
  };

  const onShare = async () => {
    try {
      await Share.share({message: STORE_URL});
    } catch (error) {
      notify('try again');
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: appBackground}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* App identity. The screen header above already says "Sherlock
          Holmes", so this shows the Bengali name instead of repeating it. */}
      <Reveal progress={progress} index={0}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.cardColor,
              borderColor: colors.borderColor,
              shadowColor: colors.shadowColor,
            },
          ]}>
          <Image
            source={require('../assets/image/icon.png')}
            style={styles.appImage}
          />
          <View style={styles.heroText}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.appName, {color: textColor}]}>
              শার্লক হোমস সমগ্র
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.appTagline, {color: subTextColor}]}>
              স্যার আর্থার কোনান ডয়েল
            </Text>
            <View style={[styles.heroChip, {backgroundColor: colors.softFill}]}>
              <BookOpenIcon
                size={14}
                strokeWidth={2.2}
                color={colors.iconColor}
              />
              <Text style={[styles.heroChipText, {color: textColor}]}>
                {toBengaliNumber(booksList.length)}টি বই
              </Text>
            </View>
          </View>
        </View>
      </Reveal>

      <Reveal progress={progress} index={1}>
        <Section colors={colors} title="MY LIBRARY">
          <Row
            colors={colors}
            Icon={ClockIcon}
            label="Reading History"
            onPress={() => goTo('history')}
            trailing="chevron"
          />
          <Row
            colors={colors}
            Icon={BookmarkIcon}
            label="Sherlock's Archive"
            onPress={() => goTo('Bookmarked')}
            last
            trailing={
              <View style={styles.trailingGroup}>
                {bookmarkCount > 0 && (
                  <View
                    style={[
                      styles.badge,
                      {backgroundColor: colors.plusButtonBg},
                    ]}>
                    <Text
                      style={[styles.badgeText, {color: colors.plusButtonFg}]}>
                      {bookmarkCount}
                    </Text>
                  </View>
                )}
                <ChevronRightIcon
                  size={18}
                  strokeWidth={2.2}
                  color={subTextColor}
                />
              </View>
            }
          />
        </Section>
      </Reveal>

      <Reveal progress={progress} index={2}>
        <Section colors={colors} title="APPEARANCE">
          {/* Tap to switch between light and dark. */}
          <Row
            colors={colors}
            Icon={shownDark ? MoonIcon : SunIcon}
            label={shownDark ? 'Dark Mode' : 'Light Mode'}
            onPress={onToggleTheme}
            trailing={
              <ArrowRightIcon
                size={20}
                strokeWidth={2}
                color={colors.subTextColor}
              />
            }
            last
          />
        </Section>
      </Reveal>

      <Reveal progress={progress} index={3}>
        <Section colors={colors} title="ABOUT">
          <Row
            colors={colors}
            Icon={PencilSquareIcon}
            label="Books Writer"
            onPress={() => goTo('bookswriter')}
            trailing="chevron"
          />
          <Row
            colors={colors}
            Icon={InformationCircleIcon}
            label="About App"
            onPress={() => goTo('aboutapp')}
            trailing="chevron"
          />
          <Row
            colors={colors}
            Icon={ArrowPathIcon}
            label="Update"
            onPress={() => notify('app is not update yet')}
            last
          />
        </Section>
      </Reveal>

      <Reveal progress={progress} index={4}>
        <Section colors={colors} title="DEVELOPER">
          {/* Who made the app, and an open door for project work. */}
          <Pressable
            onPress={() => goTo('needanapp')}
            accessibilityRole="button"
            android_ripple={{color: colors.softFill}}
            style={({pressed}) => [
              styles.devCard,
              pressed &&
                Platform.OS === 'ios' && {
                  backgroundColor: colors.softFill,
                },
            ]}>
            <View
              style={[styles.devAvatar, {backgroundColor: colors.softFill}]}>
              <CodeBracketIcon
                size={20}
                strokeWidth={2}
                color={colors.iconColor}
              />
            </View>
            <View style={styles.devText}>
              <Text style={[styles.devName, {color: colors.textColor}]}>
                Developer Profile
              </Text>
              <Text style={[styles.devRole, {color: colors.subTextColor}]}>
                Need an app or software for yourself?
              </Text>
            </View>
            <ChevronRightIcon
              size={18}
              strokeWidth={2.2}
              color={colors.subTextColor}
            />
          </Pressable>
        </Section>
      </Reveal>

      <Reveal progress={progress} index={5}>
        <Section colors={colors} title="SPREAD THE WORD">
          <Row
            colors={colors}
            Icon={ShareIcon}
            label="Share the App"
            onPress={onShare}
            last
          />
        </Section>
      </Reveal>
    </ScrollView>
  );
};

export default HomeDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  appImage: {
    height: 72,
    width: 72,
    borderRadius: 18,
  },
  heroText: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontFamily: 'kalpurush',
    fontSize: 21,
    lineHeight: 27,
  },
  appTagline: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 20,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 22,
    marginTop: 6,
  },
  heroChipText: {
    fontFamily: 'kalpurush',
    fontSize: 13.5,
    lineHeight: 18,
    marginLeft: 5,
  },

  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  devAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  devName: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  devRole: {
    fontSize: 13,
    lineHeight: 17,
    marginTop: 2,
  },
  devCta: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 19,
    marginTop: 5,
  },
  trailingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 24,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginLeft: 6,
    marginBottom: 8,
  },
  group: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  // Clips the press ripple to the rounded corners without clipping the
  // card's own shadow.
  groupClip: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    marginLeft: 12,
    paddingRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: 'MeriendaBold',
    fontSize: 14.5,
    // MeriendaBold sits low in its line box; lift it to centre on the icon.
    marginTop: -3,
  },
});
