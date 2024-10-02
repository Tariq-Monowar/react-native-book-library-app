import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC} from 'react';
import {UseAppContext} from '../context/AppContext';
import {Book} from '../interface/Interface';
import {useNavigation} from '@react-navigation/native';
import { useThemeColors } from '../context/ThemeContext';

const ChapterList: FC = () => {
  const {bookChapter} = UseAppContext();
  const navigation = useNavigation<any>();
  const {appBackground, textColor,  buttonColor, shadowColor } = useThemeColors()

  const handleOpenChapter = (chapter: Book) => {
    navigation.navigate('chapter', {description: chapter.desciption, selector: chapter.selector});
  };

  return (
    <View style={{backgroundColor: appBackground, height: '100%'}}>
      <ScrollView style={{paddingHorizontal: 10}}>
        {bookChapter.data[1].map((chapter: Book) => (
          <TouchableOpacity
            onPress={() => handleOpenChapter(chapter)}
            key={chapter.id}
            style={{...styles.chapterButton, ...styles.shadowProp, backgroundColor: buttonColor, shadowColor: shadowColor}}>
            <Text style={{...styles.selectorName, color: textColor}}>{chapter.selector}</Text>
          </TouchableOpacity>
        ))}
        <View style={{height: 100}}></View>
      </ScrollView>
    </View>
  );
};

export default ChapterList;

const styles = StyleSheet.create({
  chapterButton: {
    width: '100%',
    backgroundColor: '#f9fafc',
    borderRadius: 8,
    marginTop: 15,
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
  selectorName: {
    fontFamily: 'kalpurush',
    textAlign: 'left',
    fontSize: 22,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#0a1930',
  },
});
