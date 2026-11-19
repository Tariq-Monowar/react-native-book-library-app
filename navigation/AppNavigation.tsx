import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, {FC, useMemo} from 'react';
import {HEADER_BOTTOM} from '../utils/layout';
import {shelfScrollRef} from '../utils/gestures';
import {NavigationContainer, DrawerActions} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Bars3BottomLeftIcon} from 'react-native-heroicons/outline';

import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import SheetInput from '../components/SheetInput';

import HomeScreen from '../screens/HomeScreen';
import HomeDrawer from '../drower/HomeDrower';
// The other screens are loaded the first time they are opened (see the
// `getComponent` props below), so starting the app runs less code and uses
// less memory.
import {UseAppContext} from '../context/AppContext';
import {
  DocumentPlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from 'react-native-heroicons/solid';
import {useThemeColors} from '../context/ThemeContext';
// Fixed typo

// Navigators must be created once, at module level. Creating them inside a
// component makes a brand-new navigator on every render, which unmounts and
// remounts every screen each time the context changes.
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const renderDrawerContent = (props: any) => <HomeDrawer {...props} />;

const DrawerNavigation: FC = () => {
  const {appBackground} = useThemeColors();

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        overlayColor: 'rgba(8, 12, 22, 0.5)',
        // Swiping right anywhere on the screen opens the menu. Android's own
        // back gesture owns the screen edge, so an edge-only swipe is not
        // reliable there.
        swipeEdgeWidth: Dimensions.get('window').width,
        // A swipe that starts on the home screen's bookshelf scrolls the
        // books instead (see utils/gestures.ts).
        gestureHandlerProps: {waitFor: shelfScrollRef},
        drawerStyle: {
          width: '82%',
          backgroundColor: appBackground,
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
};

const AppNavigation: FC = () => {
  const {
    bookChapter,
    setIsBottomSheetVisible,
    isBottomSheetVisible,
    setCtlBookeMarked,
  } = UseAppContext();

  const {
    appHeader,
    appBackground,
    textColor,
    iconColor,
    shitBgColor,
    indicatorBgColor,
    borderColor,
    plusButtonBg,
    isDark,
  } = useThemeColors();

  // Tells the navigator the app's colours, so the gap between two screens
  // during a transition is the theme's background and not a white flash.
  const navigationTheme = useMemo(
    () => ({
      dark: isDark,
      colors: {
        primary: plusButtonBg,
        background: appBackground,
        card: appHeader,
        text: textColor,
        border: borderColor,
        notification: plusButtonBg,
      },
    }),
    [isDark, plusButtonBg, appBackground, appHeader, textColor, borderColor],
  );

  return (
    <>
      <GestureHandlerRootView>
        <StatusBar
          translucent={true}
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={'transparent'}
        />
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator>
            <Stack.Screen
              name="Homes"
              component={DrawerNavigation}
              options={({navigation}) => ({
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.dispatch(DrawerActions.toggleDrawer())
                    }
                    style={styles.menuButton}>
                    <Bars3BottomLeftIcon
                      size={29}
                      strokeWidth={2}
                      color={iconColor}
                    />
                  </TouchableOpacity>
                ),
                headerTitle: () => (
                  <Text
                    style={{
                      fontFamily: 'MeriendaBold',
                      fontSize: 20,
                      color: textColor,
                      marginTop: 5,
                    }}>
                    {/* শার্লক হোমস সমগ্র */}
                    Sherlock Holmes
                  </Text>
                ),

                headerTitleAlign: 'center',
                headerStyle: {
                  // backgroundColor: '#fcfbff',
                  backgroundColor: appHeader,
                },
              })}
            />
            <Stack.Screen
              options={{
                headerTitleAlign: 'center',
                headerTitle: () => (
                  <Text
                    style={{
                      fontFamily: 'kalpurush',
                      fontSize: 22,
                      color: textColor,
                      marginTop: 5,
                    }}>
                    {bookChapter?.data?.[0]?.bnBookName}
                  </Text>
                ),
                headerTintColor: iconColor,
                headerStyle: {
                  backgroundColor: appHeader,
                },
                // headerSearchBarOptions: true
                // gestureEnabled: false,
                // headerShadowVisible: false,
              }}
              name="chapterList"
              getComponent={() => require('../screens/ChapterList').default}
            />

            <Stack.Screen
              options={({route}: any) => ({
                headerTitle: () => (
                  // Long chapter names are cut with "…" so they never run
                  // into the back arrow or the text-size button.
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      fontFamily: 'kalpurush',
                      fontSize: 20,
                      color: textColor,
                      marginTop: 5,
                      maxWidth: Dimensions.get('window').width - 150,
                    }}>
                    {route.params.selector}
                  </Text>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerLeft: () => null, // Use a function to return null
                headerStyle: {
                  backgroundColor: appHeader,
                },
                gestureEnabled: false,
              })}
              name="chapter"
              getComponent={() => require('../screens/Chapter').default}
            />

            <Stack.Screen
              options={() => ({
                headerTitle: () => (
                  <Text
                    style={{
                      fontSize: 19,
                      fontWeight: '700',
                      color: textColor,
                    }}>
                    Bookmarks
                  </Text>
                ),
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() =>
                      setIsBottomSheetVisible(!isBottomSheetVisible)
                    }
                    style={styles.menuButton}>
                    <DocumentPlusIcon
                      size={30}
                      strokeWidth={2}
                      color={iconColor}
                      style={{marginRight: 3}}
                    />
                  </TouchableOpacity>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerLeft: () => null, // Use a function to return null
                headerStyle: {
                  backgroundColor: appHeader,
                },
                gestureEnabled: false,
              })}
              name="Bookmarked"
              getComponent={() => require('../screens/Bookmarked').default}
            />

            <Stack.Screen
              options={({route}: any) => ({
                headerTitle: () => (
                  <Text
                    style={{
                      fontSize: 19,
                      fontWeight: '700',
                      color: textColor,
                    }}>
                    Bookmarks
                  </Text>
                ),
                headerRight: () => (
                  <>
                    <TouchableOpacity
                      onPress={() => setCtlBookeMarked(1)}
                      style={styles.menuButton}>
                      <PencilSquareIcon
                        size={30}
                        strokeWidth={2}
                        color={iconColor}
                        style={{marginRight: 10}}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCtlBookeMarked(2)}
                      style={styles.menuButton}>
                      <TrashIcon
                        size={30}
                        strokeWidth={2}
                        color={iconColor}
                        style={{marginLeft: 5}}
                      />
                    </TouchableOpacity>
                  </>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerLeft: () => null, // Use a function to return null
                headerStyle: {
                  backgroundColor: appHeader,
                },
                gestureEnabled: false,
              })}
              name="MarkedDetalse"
              getComponent={() => require('../screens/MarkedDetalse').default}
            />

            <Stack.Screen
              options={{
                headerTitle: () => (
                  <Text
                    style={{
                      fontFamily: 'kalpurush',
                      fontSize: 22,
                      color: textColor,
                      marginTop: 5,
                    }}>
                    লেখক পরিচিতি
                  </Text>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerStyle: {
                  backgroundColor: appHeader,
                },
              }}
              name="bookswriter"
              getComponent={() => require('../screens/BooksWriter').default}
            />

            <Stack.Screen
              options={{
                headerTitle: () => (
                  <Text
                    style={{
                      fontFamily: 'kalpurush',
                      fontSize: 22,
                      color: textColor,
                      marginTop: 5,
                    }}>
                    পড়ার ইতিহাস
                  </Text>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerStyle: {
                  backgroundColor: appHeader,
                },
              }}
              name="history"
              getComponent={() => require('../screens/History').default}
            />

            <Stack.Screen
              options={{
                headerTitle: () => (
                  <Text
                    style={{
                      fontFamily: 'kalpurush',
                      fontSize: 22,
                      color: textColor,
                      marginTop: 5,
                    }}>
                    অ্যাপ নির্দেশিকা
                  </Text>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerStyle: {
                  backgroundColor: appHeader,
                },
              }}
              name="aboutapp"
              getComponent={() => require('../screens/AboutApp').default}
            />

            <Stack.Screen
              options={{
                headerTitle: () => (
                  <Text
                    style={{
                      fontSize: 19,
                      fontWeight: '700',
                      color: textColor,
                    }}>
                    Developer Profile
                  </Text>
                ),
                headerTitleAlign: 'center',
                headerTintColor: iconColor,
                headerStyle: {
                  backgroundColor: appHeader,
                },
              }}
              name="needanapp"
              getComponent={() => require('../screens/NeedAnApp').default}
            />
          </Stack.Navigator>

          {isBottomSheetVisible && (
            <BottomSheet
              // ref={bottomSheetRef}
              // Opens to just under the header, on every screen size.
              snapPoints={['100%']}
              topInset={HEADER_BOTTOM}
              enablePanDownToClose={true}
              // initialSnapIndex={0}
              handleIndicatorStyle={{
                backgroundColor: indicatorBgColor,
                width: 100,
              }}
              backgroundStyle={{backgroundColor: shitBgColor}}
              onClose={() => setIsBottomSheetVisible(false)}>
              <BottomSheetScrollView>
                <SheetInput />
              </BottomSheetScrollView>
            </BottomSheet>
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    </>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({
  menuButton: {
    // marginLeft: 10,
  },
});
