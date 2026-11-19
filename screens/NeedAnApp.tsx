import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {FC} from 'react';
import {
  BriefcaseIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import {useThemeColors} from '../context/ThemeContext';
import {DEVELOPER, openWhatsApp} from '../utils/developer';

// Who made the app, what he builds, and how to reach him for a project.
const SERVICES = [
  {
    Icon: DevicePhoneMobileIcon,
    title: 'Mobile Apps',
    text: 'Android and iOS apps, built to the same quality as this one.',
  },
  {
    Icon: BriefcaseIcon,
    title: 'Business Software',
    text: 'Complete software solutions that make running your business easier.',
  },
  {
    Icon: GlobeAltIcon,
    title: 'Web Applications',
    text: 'Websites, dashboards and online systems.',
  },
  {
    Icon: WrenchScrewdriverIcon,
    title: 'Custom Tools',
    text: 'Tools built specifically around your needs.',
  },
];

// The first message WhatsApp opens with: short, professional, and leaves
// the visitor to add their own details.
const FIRST_MESSAGE =
  "Hi Tariq, I found you through the Sherlock Holmes app and I'd like to talk about a project.";

const NeedAnApp: FC = () => {
  const c = useThemeColors();

  const open = (url: string) =>
    Linking.openURL(url).catch(() =>
      Alert.alert('Could not open the link', 'Please try again later.'),
    );

  const whatsapp = (text: string) =>
    openWhatsApp(text).catch(() =>
      Alert.alert(
        'Could not open WhatsApp',
        `Contact me directly at ${DEVELOPER.whatsappDisplay}`,
      ),
    );

  return (
    <View style={[styles.screen, {backgroundColor: c.appBackground}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Who */}
        <View style={styles.hero}>
          <View style={[styles.avatar, {backgroundColor: c.softFill}]}>
            <CodeBracketIcon size={38} strokeWidth={1.8} color={c.iconColor} />
          </View>
          <Text style={[styles.name, {color: c.textColor}]}>
            {DEVELOPER.name}
          </Text>
          <Text style={[styles.role, {color: c.subTextColor}]}>
            {DEVELOPER.role}
          </Text>
          <View style={[styles.badge, {backgroundColor: c.softFill}]}>
            <Text style={[styles.badgeText, {color: c.textColor}]}>
              I'm working with a passionate software team in Germany
            </Text>
          </View>
        </View>

        {/* Pitch */}
        <View
          style={[
            styles.card,
            {backgroundColor: c.cardColor, borderColor: c.borderColor},
          ]}>
          <Text style={[styles.pitchTitle, {color: c.textColor}]}>
            Turn your idea into reality
          </Text>
          <Text style={[styles.pitchText, {color: c.subTextColor}]}>
            I designed and built this app myself. I can build any kind of
            software solution for your business: mobile apps, web applications
            and custom tools. Get in touch for your next project.
          </Text>
        </View>

        {/* What */}
        <Text style={[styles.label, {color: c.textColor}]}>What I build</Text>
        <View style={styles.grid}>
          {SERVICES.map(({Icon, title, text}) => (
            <View
              key={title}
              style={[
                styles.service,
                {backgroundColor: c.cardColor, borderColor: c.borderColor},
              ]}>
              <View style={[styles.serviceIcon, {backgroundColor: c.softFill}]}>
                <Icon size={20} strokeWidth={2} color={c.iconColor} />
              </View>
              <Text style={[styles.serviceTitle, {color: c.textColor}]}>
                {title}
              </Text>
              <Text style={[styles.serviceText, {color: c.subTextColor}]}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        {/* How to reach */}
        <Pressable
          onPress={() => whatsapp(FIRST_MESSAGE)}
          accessibilityRole="button"
          style={({pressed}) => [styles.primary, pressed && styles.pressed]}>
          <ChatBubbleOvalLeftEllipsisIcon
            size={22}
            strokeWidth={2}
            color="#fff"
          />
          <View style={styles.primaryText}>
            <Text style={styles.primaryTitle}>Chat on WhatsApp</Text>
            <Text style={styles.primarySub}>{DEVELOPER.whatsappDisplay}</Text>
          </View>
        </Pressable>

        <View style={styles.links}>
          <Pressable
            onPress={() => open(DEVELOPER.linkedin)}
            accessibilityRole="button"
            style={({pressed}) => [
              styles.link,
              {backgroundColor: c.cardColor, borderColor: c.borderColor},
              pressed && styles.pressed,
            ]}>
            <View style={[styles.logo, styles.logoLinkedIn]}>
              <Text style={styles.logoText}>in</Text>
            </View>
            <Text style={[styles.linkText, {color: c.textColor}]}>
              LinkedIn
            </Text>
          </Pressable>
          <Pressable
            onPress={() => open(DEVELOPER.facebook)}
            accessibilityRole="button"
            style={({pressed}) => [
              styles.link,
              {backgroundColor: c.cardColor, borderColor: c.borderColor},
              pressed && styles.pressed,
            ]}>
            <View style={[styles.logo, styles.logoFacebook]}>
              <Text style={[styles.logoText, styles.logoTextF]}>f</Text>
            </View>
            <Text style={[styles.linkText, {color: c.textColor}]}>
              Facebook
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default NeedAnApp;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1fa855',
    borderRadius: 18,
    height: 64,
    paddingHorizontal: 18,
    marginTop: 26,
    shadowColor: '#1fa855',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryText: {
    marginLeft: 12,
  },
  primaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  primarySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 23,
    fontWeight: '700',
    marginTop: 14,
  },
  role: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 3,
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 14,
  },
  badgeText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginTop: 22,
  },
  pitchTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
  },
  pitchText: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 2,
    marginLeft: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  service: {
    width: '48.5%',
    minHeight: 150,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15.5,
    lineHeight: 21,
    fontWeight: '700',
  },
  serviceText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  link: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    height: 54,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  logo: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLinkedIn: {
    borderRadius: 6,
    backgroundColor: '#0a66c2',
  },
  logoFacebook: {
    borderRadius: 13,
    backgroundColor: '#1877f2',
  },
  logoText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  logoTextF: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.8,
  },
});
