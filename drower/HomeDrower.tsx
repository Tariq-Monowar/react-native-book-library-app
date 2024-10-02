import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Switch,
  Image,
  Share,
  ToastAndroid,
} from 'react-native';
import React, {FC} from 'react';
import {DrawerContentComponentProps} from '@react-navigation/drawer';

import {
  BookmarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
  ShareIcon,
} from 'react-native-heroicons/solid';

import {
  ArrowPathIcon,
  CodeBracketIcon,
  ExclamationCircleIcon,
} from 'react-native-heroicons/outline';

// import {ShareIcon} from 'react-native-heroicons/outline';

import {UseAppContext} from '../context/AppContext';
import { useThemeColors } from '../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
// import { ChatBubbleBottomCenterIcon } from 'react-native-heroicons/outline';

const HomeDrawer: FC<DrawerContentComponentProps> = () => {
  const { isDarkMode, toggleTheme } = UseAppContext();
  const { appBackground, textColor, iconColor, buttonColor, shadowColor } = useThemeColors();
  const navigation = useNavigation<any>();
  

  const onShare = async () => {
    try {
      await Share.share({
        message:
          'https://play.google.com/store/apps/details?id=com.holmes_somograh',
      });
    } catch (error) {
      ToastAndroid.show('try again', ToastAndroid.SHORT);
    }
  };

  return (
    <ScrollView style={{...styles.container, backgroundColor: appBackground}}>
      <View style={styles.appIcon}>
        <Image
          source={require('../assets/image/icon.png')}
          style={styles.appImage}
        />
        {/* <Text style={styles.appName}>শার্লক হোমস সমগ্র</Text> */}
      </View>

      <TouchableOpacity
        style={{...styles.element, ...styles.shadowProp, backgroundColor: buttonColor, shadowColor: shadowColor}}
        onPress={() => navigation.navigate('Bookmarked')}>
        <BookmarkIcon size={27} strokeWidth={2} color={iconColor} />
        <Text style={{...styles.text, color: textColor}}>Sherlock's Archive</Text>
      </TouchableOpacity>

      <Text style={{...styles.title, color: textColor}}>whose the app</Text>
      <TouchableOpacity
        style={{...styles.element, ...styles.shadowProp, marginTop: 6, backgroundColor: buttonColor, shadowColor: shadowColor}}
        onPress={() => navigation.navigate('bookswriter')}>
        <PencilSquareIcon size={27} strokeWidth={2} color={iconColor} />
        <Text style={{...styles.text, color: textColor}}>Books Writer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('aboutapp')}
        style={{...styles.element, ...styles.shadowProp, backgroundColor: buttonColor, shadowColor: shadowColor}}>
        <ExclamationCircleIcon size={27} strokeWidth={2} color={iconColor} />
        <Text style={{...styles.text, color: textColor}}>About App</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          ToastAndroid.show('app is not update yet', ToastAndroid.SHORT)
        }
        style={{
          ...styles.element,
          ...styles.shadowProp,
          backgroundColor: buttonColor, shadowColor: shadowColor,
          // shadowColor: shadowColor,
        }}>
        <ArrowPathIcon
          size={26}
          strokeWidth={2}
          color={iconColor}
          style={{marginLeft: 2, marginRight: 3}}
        />
        <Text style={{...styles.text, color: textColor}}>Update</Text>
      </TouchableOpacity>
      <Text style={{...styles.title, color: textColor}}>switch theme</Text>

      <TouchableOpacity
        style={{
          ...styles.element,
          ...styles.shadowProp,
          justifyContent: 'space-between',
          marginTop: 6,
          backgroundColor: buttonColor, shadowColor: shadowColor
        }}>
        <Text style={{...styles.text, color: textColor}}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={'#f4f3f4'}
        />
      </TouchableOpacity>

      <Text style={{...styles.title, color: textColor}}>Communication</Text>
      <TouchableOpacity
        style={{...styles.element, ...styles.shadowProp, marginTop: 6, backgroundColor: buttonColor, shadowColor: shadowColor}}
        onPress={() => {
          Linking.openURL(
            'https://www.facebook.com/profile.php?id=100080938471859',
          );
        }}>
        <ChatBubbleOvalLeftEllipsisIcon
          size={27}
          strokeWidth={2}
          color={iconColor}
        />
        <Text style={{...styles.text, color: textColor}}>Dev Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(
            'https://bd.linkedin.com/in/tariq-monowar-hossainnnn',
          );
        }}
        style={{...styles.element, ...styles.shadowProp, backgroundColor: buttonColor, shadowColor: shadowColor}}>
        <ChatBubbleOvalLeftEllipsisIcon
          size={27}
          strokeWidth={2}
          color={iconColor}
        />
        <Text style={{...styles.text, color: textColor}}>Dev LinkedIn</Text>
      </TouchableOpacity>

      <Text style={{...styles.title, color: textColor}}>Share The app</Text>
      <TouchableOpacity
        style={{...styles.element, ...styles.shadowProp, marginTop: 6, backgroundColor: buttonColor, shadowColor: shadowColor}}
        onPress={onShare}>
        <ShareIcon
          size={23}
          strokeWidth={2}
          color={iconColor}
          style={{marginLeft: 3, marginBottom: -4}}
        />
        <Text style={{...styles.text, color: textColor}}>Share</Text>
      </TouchableOpacity>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
    </ScrollView>
  );
};

export default HomeDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: '#f6f8fa',
    height: '100%',
    paddingHorizontal: 5,
  },

  appIcon: {
    marginTop: 15,
    marginLeft: 10,
  },
  appImage: {
    height: 100,
    width: 100,
  },
  appName: {
    color: '#3b3b3b',
    fontFamily: 'kalpurush',
    fontSize: 25,
    marginTop: 10,
  },

  title: {
    color: '#3b3b3b',
    // fontFamily: 'MeriendaBold',
    fontFamily: 'kalpurush',
    fontSize: 18,
    marginLeft: 12,
    marginTop: 10,
  },
  element: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f9fafc',
    borderRadius: 8,

    paddingHorizontal: 6,
    paddingTop: 7,
    paddingBottom: 10,

    marginTop: 9,
  },
  text: {
    color: '#3b3b3b',
    fontFamily: 'MeriendaBold',
    fontSize: 16,
    marginLeft: 5,
  },
  shadowProp: {
    shadowColor: '#354158',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
});
