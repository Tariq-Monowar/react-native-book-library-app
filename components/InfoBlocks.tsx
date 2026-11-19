import React, {FC, ReactNode} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useThemeColors} from '../context/ThemeContext';

// Small building blocks shared by the "About App" and "Books Writer" pages,
// so both read the same way: cards with a heading, numbered steps, and
// short paragraphs.

type IconType = FC<{size?: number; strokeWidth?: number; color?: string}>;

export const InfoCard: FC<{
  Icon?: IconType;
  title: string;
  subtitle?: string;
  children: ReactNode;
}> = ({Icon, title, subtitle, children}) => {
  const c = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.cardColor,
          borderColor: c.borderColor,
          shadowColor: c.shadowColor,
        },
      ]}>
      <View style={styles.cardHead}>
        {Icon ? (
          <View style={[styles.cardIcon, {backgroundColor: c.softFill}]}>
            <Icon size={20} strokeWidth={2} color={c.iconColor} />
          </View>
        ) : null}
        <View style={styles.cardHeadText}>
          <Text style={[styles.cardTitle, {color: c.textColor}]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.cardSubtitle, {color: c.subTextColor}]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
};

// One numbered step: "1  Do this — and this is what happens."
export const Step: FC<{n: string; title: string; children?: ReactNode}> = ({
  n,
  title,
  children,
}) => {
  const c = useThemeColors();
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, {backgroundColor: c.plusButtonBg}]}>
        <Text style={[styles.stepNumberText, {color: c.plusButtonFg}]}>
          {n}
        </Text>
      </View>
      <View style={styles.stepBody}>
        <Text style={[styles.stepTitle, {color: c.textColor}]}>{title}</Text>
        {children ? (
          <Text style={[styles.body, {color: c.subTextColor}]}>{children}</Text>
        ) : null}
      </View>
    </View>
  );
};

export const Paragraph: FC<{children: ReactNode}> = ({children}) => {
  const c = useThemeColors();
  return <Text style={[styles.paragraph, {color: c.textColor}]}>{children}</Text>;
};

// A heading between cards, in the same small capitals style as the menu.
export const SectionLabel: FC<{children: ReactNode}> = ({children}) => {
  const c = useThemeColors();
  return (
    <Text style={[styles.sectionLabel, {color: c.subTextColor}]}>
      {children}
    </Text>
  );
};

export const Fact: FC<{label: string; value: string}> = ({label, value}) => {
  const c = useThemeColors();
  return (
    <View style={[styles.fact, {backgroundColor: c.softFill}]}>
      <Text style={[styles.factLabel, {color: c.subTextColor}]}>{label}</Text>
      <Text style={[styles.factValue, {color: c.textColor}]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginTop: 12,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeadText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'kalpurush',
    fontSize: 22,
    lineHeight: 28,
  },
  cardSubtitle: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 20,
  },
  step: {
    flexDirection: 'row',
    marginTop: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 20,
  },
  stepBody: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontFamily: 'kalpurush',
    fontSize: 18.5,
    lineHeight: 25,
  },
  body: {
    fontFamily: 'kalpurush',
    fontSize: 16.5,
    lineHeight: 24,
    marginTop: 2,
  },
  paragraph: {
    fontFamily: 'kalpurush',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 22,
    marginTop: 24,
    marginLeft: 6,
  },
  fact: {
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 8,
    width: '48.5%',
  },
  factLabel: {
    fontFamily: 'kalpurush',
    fontSize: 14,
    lineHeight: 18,
  },
  factValue: {
    fontFamily: 'kalpurush',
    fontSize: 17.5,
    lineHeight: 23,
    marginTop: 1,
  },
});
