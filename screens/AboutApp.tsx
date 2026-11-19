import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  BookOpenIcon,
  BookmarkIcon,
  Bars3BottomLeftIcon,
  ChartBarIcon,
  ClockIcon,
  MoonIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
} from 'react-native-heroicons/outline';
import {useThemeColors} from '../context/ThemeContext';
import {
  InfoCard,
  Paragraph,
  SectionLabel,
  Step,
} from '../components/InfoBlocks';

// "About App": what the app is, then a step-by-step guide to every feature,
// written for someone opening it for the first time.
const AboutApp = () => {
  const c = useThemeColors();
  return (
    <ScrollView
      style={{backgroundColor: c.appBackground}}
      contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image
          source={require('../assets/image/icon.png')}
          style={styles.heroIcon}
        />
        <Text style={[styles.heroTitle, {color: c.textColor}]}>
          শার্লক হোমস সমগ্র
        </Text>
        <Text style={[styles.heroText, {color: c.subTextColor}]}>
          স্যার আর্থার কোনান ডয়েলের শার্লক হোমসের উপন্যাস ও গল্প, বাংলায়, এক
          জায়গায়। ইন্টারনেট ছাড়াই পড়া যায়।
        </Text>
      </View>

      <InfoCard Icon={BookOpenIcon} title="অ্যাপে যা আছে">
        <Paragraph>
          মোট ৯টি বই: ৪টি উপন্যাস (আ স্টাডি ইন স্কারলেট, দ্য সাইন অব ফোর, দ্য
          হাউন্ড অব দ্য বাস্কারভিলস, দ্য ভ্যালি অফ ফিয়ার) এবং ৫টি গল্প সংকলন
          (অ্যাডভেঞ্চারস, মেমোয়ার্স, রিটার্ন, হিজ লাস্ট বাও, কেস বুক)।
        </Paragraph>
      </InfoCard>

      <SectionLabel>কীভাবে ব্যবহার করবেন</SectionLabel>

      <InfoCard Icon={BookOpenIcon} title="বই পড়া শুরু করা">
        <Step n="১" title="হোম পেজ থেকে একটি বই বেছে নিন">
          ওপরে "উপন্যাস" সারিটি ডানে-বাঁয়ে টেনে সব উপন্যাস দেখুন, নিচে "গল্প
          সংকলন" তালিকা।
        </Step>
        <Step n="২" title="অধ্যায় বেছে নিন">
          বইয়ে চাপ দিলে তার সব অধ্যায়ের তালিকা আসবে। যেকোনো অধ্যায়ে চাপ দিয়ে
          পড়া শুরু করুন।
        </Step>
        <Step n="৩" title="স্ক্রল করে পড়ুন">
          ওপরের সরু দাগটি দেখায় অধ্যায়ের কতটা পড়া হলো।
        </Step>
      </InfoCard>

      <InfoCard Icon={PlayIcon} title="যেখানে থেমেছিলেন, সেখান থেকে">
        <Step n="১" title="অ্যাপ নিজেই জায়গা মনে রাখে">
          পড়া থামিয়ে বেরিয়ে গেলে, এমনকি অ্যাপ বন্ধ করে দিলেও, ঠিক যে লাইনে
          ছিলেন সেটা মনে থাকে।
        </Step>
        <Step n="২" title="হোম পেজের ‘পড়া চালিয়ে যান’">
          সবার ওপরের কার্ডে শেষ পড়া অধ্যায়, সেখানকার লেখা, কত শতাংশ পড়েছেন আর
          কত মিনিট বাকি দেখায়। বোতামে চাপ দিলেই সেই লাইনে পৌঁছে যাবেন।
        </Step>
        <Step n="৩" title="অধ্যায় শেষ হলে">
          কার্ডটি নিজে থেকে পরের অধ্যায় দেখাবে ("এরপর পড়ুন")।
        </Step>
      </InfoCard>

      <InfoCard Icon={ChartBarIcon} title="অগ্রগতি ও শেষ করা অধ্যায়">
        <Step n="১" title="অধ্যায়ের তালিকায় অগ্রগতি">
          ওপরে দেখায় কতগুলো অধ্যায় শেষ হয়েছে, আর "চালিয়ে যান" বোতাম। যে
          অধ্যায় শুরু করেছেন তার পাশে শতাংশ লেখা থাকে।
        </Step>
        <Step n="২" title="শেষ হিসেবে চিহ্ন দেওয়া">
          অধ্যায়ের শেষ পর্যন্ত পড়লে সেটা নিজে থেকেই শেষ হিসেবে চিহ্নিত হয়।
          নামের বাঁ পাশের গোল চিহ্নে চাপ দিয়ে নিজেও চিহ্ন দিতে বা তুলে নিতে
          পারেন।
        </Step>
      </InfoCard>

      <InfoCard Icon={BookmarkIcon} title="বুকমার্ক (Sherlock's Archive)">
        <Step n="১" title="পছন্দের লাইন সংরক্ষণ">
          পড়ার সময় কোনো লেখা চেপে ধরে কপি করুন। নিচে ডান কোণে "+" বোতাম আসবে,
          চাপ দিয়ে লেখাটি পেস্ট করে সংরক্ষণ করুন। শিরোনাম দেওয়া ঐচ্ছিক।
        </Step>
        <Step n="২" title="নিজের নোট লেখা">
          বুকমার্ক পেজের "+" বোতাম দিয়ে যেকোনো সময় নিজের নোট লিখে রাখুন।
        </Step>
        <Step n="৩" title="খুঁজুন, প্রিয় তালিকায় রাখুন">
          ওপরের 🔍 দিয়ে শিরোনাম বা লেখার ভেতরে খুঁজুন। তারা ★ চাপলে
          "Favourites" ট্যাবে থাকবে।
        </Step>
        <Step n="৪" title="সাজানো ও দেখার ধরন">
          ওপরের ⋮ মেনু থেকে তালিকা বা গ্রিড, আর নতুন-পুরনো বা নাম অনুযায়ী
          সাজানো বেছে নিন।
        </Step>
        <Step n="৫" title="পড়া, সম্পাদনা, মুছে ফেলা">
          বুকমার্কে চাপ দিলে পুরোটা পড়তে পারবেন, সেখান থেকে সম্পাদনা বা মুছে
          ফেলা যায়। কার্ড চেপে ধরলেও এসব বিকল্প আসে।
        </Step>
      </InfoCard>

      <InfoCard Icon={ClockIcon} title="পড়ার ইতিহাস">
        <Step n="১" title="সাইড মেনু থেকে Reading History">
          সম্প্রতি পড়া সব অধ্যায়, সবচেয়ে নতুনটা ওপরে, কতটা পড়েছেন আর কখন।
        </Step>
        <Step n="২" title="আবার সেখানে ফেরা">
          যেকোনো সারিতে চাপ দিলে সেই অধ্যায়ের সেই জায়গায় খুলবে। ✕ দিয়ে একটি,
          বা "সব মুছুন" দিয়ে পুরো ইতিহাস মোছা যায়। শেষ করা অধ্যায়ের চিহ্ন তাতে
          মোছে না।
        </Step>
      </InfoCard>

      <InfoCard Icon={MoonIcon} title="আলো ও অন্ধকার মোড">
        <Step n="১" title="শুরুতে ফোনের সেটিং অনুযায়ী">
          ফোন ডার্ক মোডে থাকলে অ্যাপও অন্ধকারে খুলবে।
        </Step>
        <Step n="২" title="নিজে বদলাতে">
          সাইড মেনুর APPEARANCE অংশে চাপ দিন। আপনার পছন্দ মনে থাকবে।
        </Step>
      </InfoCard>

      <InfoCard Icon={Bars3BottomLeftIcon} title="সাইড মেনু">
        <Step n="১" title="খোলার দুটি উপায়">
          ওপরে বাঁ কোণের ☰ চিহ্নে চাপ দিন, অথবা হোম পেজে বাঁ থেকে ডানে টানুন।
        </Step>
        <Step n="২" title="এখানে যা পাবেন">
          পড়ার ইতিহাস, বুকমার্ক, আলো-অন্ধকার মোড, লেখক পরিচিতি, অ্যাপ শেয়ার আর
          নির্মাতার সাথে যোগাযোগ।
        </Step>
      </InfoCard>

      <SectionLabel>প্রায়ই জিজ্ঞাসিত</SectionLabel>

      <InfoCard Icon={QuestionMarkCircleIcon} title="জেনে রাখুন">
        <Step n="?" title="ইন্টারনেট লাগে কি?">
          না। সব বই অ্যাপের ভেতরেই আছে।
        </Step>
        <Step n="?" title="বুকমার্ক ও ইতিহাস কোথায় থাকে?">
          শুধু আপনার ফোনেই। অ্যাপ মুছে ফেললে এগুলোও মুছে যাবে।
        </Step>
        <Step n="?" title="‘+’ বোতাম দেখা যাচ্ছে না?">
          বোতামটি লেখা কপি করার পর কয়েক সেকেন্ড দেখা যায়। আবার কপি করলে আবার
          আসবে।
        </Step>
      </InfoCard>
    </ScrollView>
  );
};

export default AboutApp;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 20,
  },
  heroTitle: {
    fontFamily: 'kalpurush',
    fontSize: 26,
    lineHeight: 34,
    marginTop: 12,
  },
  heroText: {
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 4,
  },
});
