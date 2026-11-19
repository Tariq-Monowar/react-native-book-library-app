import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  AcademicCapIcon,
  BookOpenIcon,
  HomeIcon,
  PencilSquareIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import {useThemeColors} from '../context/ThemeContext';
import {
  Fact,
  InfoCard,
  Paragraph,
  SectionLabel,
} from '../components/InfoBlocks';

// Key moments of Conan Doyle's life, shown as a timeline.
const TIMELINE: {year: string; text: string}[] = [
  {year: '১৮৫৯', text: '২২ মে, স্কটল্যান্ডের এডিনবার্গে জন্ম।'},
  {year: '১৮৮১', text: 'এডিনবার্গ বিশ্ববিদ্যালয় থেকে চিকিৎসাবিদ্যায় ডিগ্রি।'},
  {year: '১৮৮২', text: 'ইংল্যান্ডের সাউথসিতে ডাক্তারি চেম্বার খোলেন।'},
  {year: '১৮৮৭', text: 'প্রথম শার্লক হোমস উপন্যাস "আ স্টাডি ইন স্কারলেট"।'},
  {year: '১৮৯১', text: '"দ্য স্ট্র্যান্ড" পত্রিকায় হোমসের ছোটগল্প, বিপুল জনপ্রিয়তা।'},
  {year: '১৮৯৩', text: '"দ্য ফাইনাল প্রবলেম" গল্পে হোমসকে বিদায় জানান।'},
  {year: '১৯০২', text: '"দ্য হাউন্ড অব দ্য বাস্কারভিলস"; একই বছর নাইট উপাধি।'},
  {year: '১৯০৩', text: 'পাঠকদের দাবিতে হোমস ফিরে আসেন ("দ্য রিটার্ন")।'},
  {year: '১৯২৭', text: 'শেষ সংকলন "দ্য কেস বুক অফ শার্লক হোমস"।'},
  {year: '১৯৩০', text: '৭ জুলাই, ইংল্যান্ডের ক্রোবরোতে মৃত্যু।'},
];

const BooksWriter = () => {
  const c = useThemeColors();
  return (
    <ScrollView
      style={{backgroundColor: c.appBackground}}
      contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.avatar, {backgroundColor: c.softFill}]}>
          <UserIcon size={40} strokeWidth={1.6} color={c.iconColor} />
        </View>
        <Text style={[styles.name, {color: c.textColor}]}>
          স্যার আর্থার কোনান ডয়েল
        </Text>
        <Text style={[styles.nameEn, {color: c.subTextColor}]}>
          Sir Arthur Conan Doyle · ১৮৫৯–১৯৩০
        </Text>
        <Text style={[styles.tagline, {color: c.subTextColor}]}>
          চিকিৎসক থেকে লেখক, বিশ্বের সবচেয়ে বিখ্যাত গোয়েন্দা শার্লক হোমসের
          স্রষ্টা।
        </Text>
      </View>

      <View style={styles.facts}>
        <Fact label="জন্ম" value="এডিনবার্গ, স্কটল্যান্ড" />
        <Fact label="পেশা" value="চিকিৎসক ও লেখক" />
        <Fact label="হোমসের উপন্যাস" value="৪টি" />
        <Fact label="হোমসের ছোটগল্প" value="৫৬টি" />
      </View>

      <SectionLabel>জীবনের সময়রেখা</SectionLabel>
      <View
        style={[
          styles.timeline,
          {backgroundColor: c.cardColor, borderColor: c.borderColor},
        ]}>
        {TIMELINE.map((item, index) => {
          const last = index === TIMELINE.length - 1;
          return (
            <View key={item.year} style={styles.timeRow}>
              <Text style={[styles.year, {color: c.textColor}]}>
                {item.year}
              </Text>
              <View style={styles.rail}>
                <View style={[styles.dot, {backgroundColor: c.plusButtonBg}]} />
                {!last && (
                  <View style={[styles.line, {backgroundColor: c.borderColor}]} />
                )}
              </View>
              <Text style={[styles.timeText, {color: c.textColor}]}>
                {item.text}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionLabel>বিস্তারিত</SectionLabel>

      <InfoCard Icon={HomeIcon} title="জন্ম ও পরিবার">
        <Paragraph>
          ১৮৫৯ সালের ২২ মে স্কটল্যান্ডের এডিনবার্গে আইরিশ বংশোদ্ভূত এক পরিবারে
          জন্ম। বাবা চার্লস অল্টামন্ট ডয়েল ছিলেন শিল্পী। মা মেরি ডয়েলের মুখে
          শোনা গল্পই ছোটবেলায় তাঁর কল্পনাশক্তি গড়ে দেয়।
        </Paragraph>
      </InfoCard>

      <InfoCard Icon={AcademicCapIcon} title="পড়াশোনা ও ডাক্তারি">
        <Paragraph>
          জেসুইট স্কুলে পড়ার পর এডিনবার্গ বিশ্ববিদ্যালয়ে চিকিৎসাবিদ্যা পড়েন।
          সেখানকার শিক্ষক ড. জোসেফ বেল রোগী দেখেই তার পেশা আর অতীত বলে দিতে
          পারতেন। এই মানুষটিই পরে শার্লক হোমসের চরিত্রের অনুপ্রেরণা হন।
          ডাক্তারি পেশায় রোগী কম থাকায় অবসরে লেখালেখি শুরু করেন।
        </Paragraph>
      </InfoCard>

      <InfoCard Icon={BookOpenIcon} title="শার্লক হোমসের জন্ম">
        <Paragraph>
          ১৮৮৭ সালে "আ স্টাডি ইন স্কারলেট" উপন্যাসে প্রথম দেখা দেন শার্লক হোমস
          আর তাঁর সঙ্গী ডক্টর ওয়াটসন। ১৮৯১ সাল থেকে "দ্য স্ট্র্যান্ড" পত্রিকায়
          ছোটগল্প ছাপা শুরু হলে হোমস ঘরে ঘরে পরিচিত হয়ে ওঠেন।
        </Paragraph>
        <Paragraph>
          হোমসের জনপ্রিয়তা তাঁর অন্য লেখাকে আড়াল করছে ভেবে ১৮৯৩ সালে "দ্য
          ফাইনাল প্রবলেম" গল্পে তিনি হোমসকে মৃত দেখান। পাঠকদের প্রবল চাপে ১৯০২
          সালে লেখেন "দ্য হাউন্ড অব দ্য বাস্কারভিলস", আর ১৯০৩ সালে "দ্য এম্পটি
          হাউস" গল্পে হোমসকে সত্যিই ফিরিয়ে আনেন।
        </Paragraph>
      </InfoCard>

      <InfoCard Icon={PencilSquareIcon} title="অন্যান্য লেখা ও শেষ জীবন">
        <Paragraph>
          হোমসের বাইরেও তিনি অনেক লিখেছেন, যেমন প্রাগৈতিহাসিক প্রাণীর জগৎ নিয়ে
          "দ্য লস্ট ওয়ার্ল্ড", আর বেশ কিছু ঐতিহাসিক উপন্যাস। ১৯০২ সালে নাইট
          উপাধি পান।
        </Paragraph>
        <Paragraph>
          দুবার বিয়ে করেন: ১৮৮৫ সালে লুইসা হকিন্স (মৃত্যু ১৯০৬), ১৯০৭ সালে জিন
          লেকি। সন্তান পাঁচজন। জীবনের শেষ দিকে আধ্যাত্মবাদে গভীর আগ্রহী হন।
          ১৯৩০ সালের ৭ জুলাই ইংল্যান্ডের ক্রোবরোতে মারা যান।
        </Paragraph>
      </InfoCard>
    </ScrollView>
  );
};

export default BooksWriter;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'kalpurush',
    fontSize: 26,
    lineHeight: 34,
    marginTop: 12,
  },
  nameEn: {
    fontSize: 14,
    marginTop: 2,
  },
  tagline: {
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 8,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  timeline: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  timeRow: {
    flexDirection: 'row',
  },
  year: {
    width: 48,
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 24,
  },
  rail: {
    width: 22,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 7,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 3,
    marginBottom: -7,
  },
  timeText: {
    flex: 1,
    fontFamily: 'kalpurush',
    fontSize: 16.5,
    lineHeight: 24,
    marginLeft: 6,
    paddingBottom: 14,
  },
});
