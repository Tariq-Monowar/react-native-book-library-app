import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ScrollView} from 'react-native';
import {useThemeColors} from '../context/ThemeContext';

const BooksWriter = () => {
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
        স্যার আর্থার কোনান ডয়েল এর জীবনী
      </Text>
      <Text style={{...styles.title, color: textColor}}>
        জন্ম ও পরিবারিক পটভূমি
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        স্যার আর্থার কোনান ডয়েল জন্মগ্রহণ করেন ২২ মে, ১৮৫৯ সালে স্কটল্যান্ডের
        এডিনবার্গ শহরে। তিনি আইরিশ বংশোদ্ভূত ছিলেন। তাঁর পিতা চার্লস অল্টামন্ট
        ডয়েল একজন শিল্পী ছিলেন এবং মা মেরি ডয়েল ছিলেন শিক্ষিত এবং সংস্কৃতিমনা
        একজন মহিলা। ছোটবেলা থেকেই তাঁর মায়ের কাছ থেকে গল্প শোনার মাধ্যমে তাঁর
        কল্পনাশক্তি বিকশিত হয়।
      </Text>
      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        শিক্ষা ও ছাত্রজীবন
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        কোনান ডয়েল এডিনবার্গের জেসুইট স্কুলে পড়াশোনা করেন এবং পরে এডিনবার্গ
        বিশ্ববিদ্যালয়ে চিকিৎসাশাস্ত্রে পড়াশোনা করেন। সেখানে পড়াকালীন তিনি
        লেখালেখি শুরু করেন এবং প্রথম ছোট গল্পগুলি ম্যাগাজিনে প্রকাশিত হতে শুরু
        করে। তাঁর সাহিত্য প্রতিভার বিকাশ এসময়েই ঘটে।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        চিকিৎসা পেশা শুরু
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        চিকিৎসা ডিগ্রি অর্জনের পর ডয়েল ইংল্যান্ডের সাউথসি শহরে নিজের চেম্বার
        খোলেন এবং চিকিৎসা পেশা শুরু করেন। কিন্তু পেশায় খুব একটা সফল না হওয়ায়,
        তিনি লেখালেখির প্রতি বেশি সময় দিতে শুরু করেন।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        শার্লক হোমসের উদ্ভব
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        ১৮৮৭ সালে "এ স্টাডি ইন স্কারলেট" উপন্যাসের মাধ্যমে বিশ্ব বিখ্যাত
        গোয়েন্দা চরিত্র শার্লক হোমসের উদ্ভব ঘটে। হোমসের চরিত্র এবং তাঁর সহযোগী
        ডক্টর ওয়াটসনের মধ্যকার সম্পর্ক পাঠকদের মধ্যে ব্যাপক জনপ্রিয়তা অর্জন
        করে। এই চরিত্রটি ডয়েলকে সারা বিশ্বে খ্যাতি এনে দেয়।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        শার্লক হোমসের অন্যান্য কাজ
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        ডয়েল হোমসকে কেন্দ্র করে আরও বেশ কিছু গল্প ও উপন্যাস লেখেন, যার মধ্যে
        উল্লেখযোগ্য হলো "দ্য সাইন অফ দ্য ফোর," "দ্য অ্যাডভেঞ্চার অফ শার্লক
        হোমস," এবং "দ্য হাউন্ড অফ দ্য বাস্কারভিলস।" হোমসের অসাধারণ পর্যবেক্ষণ
        ক্ষমতা এবং ডিডাকটিভ রিজনিং তাকে অনন্য এক চরিত্র হিসেবে স্থান দেয়।।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        শার্লক হোমসকে হত্যা এবং পুনর্জীবন
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        ১৮৯৩ সালে "দ্য ফাইনাল প্রোব্লেম" গল্পে ডয়েল শার্লক হোমসকে হত্যা করার
        চেষ্টা করেন, কারণ তিনি চাননি এই চরিত্রটি তাঁকে চিরকাল আটকে রাখুক। কিন্তু
        পাঠক সমাজের প্রবল চাপে তিনি ১৯০১ সালে "দ্য হাউন্ড অফ দ্য বাস্কারভিলস"
        উপন্যাসে হোমসকে পুনর্জীবিত করেন এবং তাঁর গল্প আবার লেখা শুরু করেন।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        অন্যান্য সাহিত্যকর্ম
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        শার্লক হোমসের পাশাপাশি ডয়েল আরও অনেক ধরনের গল্প ও উপন্যাস লিখেছেন। তার
        মধ্যে উল্লেখযোগ্য হলো "দ্য লস্ট ওয়ার্ল্ড," যেখানে একটি প্রাগৈতিহাসিক
        পৃথিবীর কাহিনি রয়েছে। এছাড়াও তিনি ঐতিহাসিক এবং বিজ্ঞান কল্পকাহিনী রচনা
        করেন।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        ব্যক্তিগত জীবন
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        ডয়েল দুইবার বিবাহিত হন। তাঁর প্রথম স্ত্রী লুইসা হকিন্স ১৮৮৫ সালে বিবাহ
        বন্ধনে আবদ্ধ হন এবং তাঁর মৃত্যু হয় ১৯০৬ সালে। পরে ১৯০৭ সালে তিনি জিন
        লেকির সঙ্গে বিবাহ করেন। তাঁর মোট পাঁচ সন্তান ছিল।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        আধ্যাত্মিকতা এবং জীবনের শেষ পর্যায়
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        ডয়েলের জীবনের শেষের দিকে তিনি আধ্যাত্মিকতা এবং অতিপ্রাকৃত বিষয়ে আগ্রহী
        হয়ে ওঠেন। তিনি স্পিরিচুয়ালিজমকে সমর্থন করেন এবং এই বিষয়ে কিছু বইও
        লেখেন। তিনি দ্বিতীয় বিশ্বযুদ্ধের পর নিজের বিশ্বাসের ওপর বেশ কিছু লেকচার
        দিয়েছিলেন।
      </Text>

      <Text style={{...styles.title, marginTop: 10, color: textColor}}>
        মৃত্যু
      </Text>
      <Text style={{...styles.text, color: textColor}}>
        স্যার আর্থার কোনান ডয়েল ৭ জুলাই, ১৯৩০ সালে ক্রোবারো, ইংল্যান্ডে
        মৃত্যুবরণ করেন। মৃত্যুর পরেও তাঁর রচনাবলী এবং বিশেষত শার্লক হোমস চরিত্র
        আজও সমান জনপ্রিয় রয়ে গেছে।
      </Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
    </ScrollView>
  );
};

export default BooksWriter;

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
