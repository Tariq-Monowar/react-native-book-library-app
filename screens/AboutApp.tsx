import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ScrollView} from 'react-native';
import {useThemeColors} from '../context/ThemeContext';

const AboutApp = () => {
  const {textColor, appBackground} = useThemeColors();
  return (
    <ScrollView style={{...styles.container, backgroundColor: appBackground}}>
      <Text
        style={{
          ...styles.text,
          marginTop: 15,
          marginBottom: -1,
          color: textColor,
          textAlign: 'center',
        }}>
        অ্যাপ সম্পর্কে
      </Text>

      <Text style={{...styles.text, color: textColor}}>
        এই অ্যাপে আপনি স্যার আর্থার কোনান ডয়েল রচিত শার্লক হোমসের সকল উপন্যাস
        এবং গল্প একত্রিতভাবে পাবেন। প্রতিটি কাহিনি শার্লক হোমসের বুদ্ধিমত্তা এবং
        রহস্য সমাধানের দারুণ উদাহরণ তুলে ধরে, যা পাঠকদের অগাধ আনন্দ দেবে। বাংলা
        অনুবাদে এই অ্যাপের মাধ্যমে শার্লক হোমসের গল্পগুলোকে সহজে পড়া এবং উপভোগ
        করা যাবে।
      </Text>
      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        বুকমার্ক সুবিধা
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        যখন আপনি কোনো গল্প পড়বেন, গুরুত্বপূর্ণ অংশগুলো সহজেই বুকমার্ক করে রাখতে
        পারবেন। যখনই কোনো বিশেষ অংশ কপি করবেন, সাথে সাথে বুকমার্ক বাটন দেখতে
        পাবেন, যা একটি ক্লিকে আপনার প্রিয় অংশটি সংরক্ষণ করবে। পরবর্তীতে আপনি
        বুকমার্ক করা অংশগুলো সহজেই আবার পড়তে পারবেন।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        নোট গ্রহণের সুবিধা
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        আপনি যেকোনো সময় গল্প পড়ার সময় আপনার ব্যক্তিগত নোট লিখে রাখতে পারবেন।
        এটি কাহিনির গুরুত্বপূর্ণ বিষয়বস্তু, চরিত্রের বিবরণ, বা নিজস্ব ভাবনা নোট
        আকারে সংরক্ষণ করার সুযোগ দেয়। নোটগুলো পরে আপনি সম্পাদনা করতে, পড়তে এবং
        প্রয়োজনে মুছে ফেলতে পারবেন।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        গল্প ও উপন্যাসের বিন্যাস
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        অ্যাপের হোম পেইজে প্রথমে শার্লক হোমসের উপন্যাসগুলো তালিকাভুক্ত করা
        হয়েছে এবং তারপরে ছোটগল্পগুলো দেওয়া হয়েছে। এটি আপনাকে সহজেই পুরো
        সংগ্রহের সাথে পরিচিত হতে এবং ধারাবাহিকভাবে উপন্যাস থেকে গল্পে প্রবেশ
        করতে সাহায্য করবে।
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        এই অ্যাপটি শুধু শার্লক হোমসের অসাধারণ কাহিনির সংকলনই নয়, বরং এটি আপনার
        পঠনের অভিজ্ঞতাকে সমৃদ্ধ করার জন্যও নানা সুবিধা নিয়ে এসেছে।
      </Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
    </ScrollView>
  );
};

export default AboutApp;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    height: '100%',
    backgroundColor: '#f9fafc',
  },
  title: {
    fontFamily: 'kalpurush',
    color: '#0a1930',
    fontSize: 27,
    marginTop: 10,
    marginBottom: -10,
  },
  text: {
    fontSize: 22,
    marginVertical: 10,
    fontFamily: 'kalpurush',
    color: '#0a1930',
  },
});
