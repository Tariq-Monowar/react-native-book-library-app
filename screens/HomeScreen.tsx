import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import React, {FC} from 'react';
import {useNavigation} from '@react-navigation/native';
import {UseAppContext} from '../context/AppContext';
import {booksList} from '../database/HomeBookData';
import {useThemeColors} from '../context/ThemeContext';

const HomeScreen: FC = () => {
  // 1. Always call hooks at the top level
  const navigation = useNavigation<any>();
  const {setRecevedBookName} = UseAppContext();
  const {appBackground, textColor} = useThemeColors();

  // 2. Dimension hook for screen width calculation
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth > 600 ? 4 : 2;
  const bookWidth = (screenWidth - 40) / numColumns - 10;

  // 3. Handle opening books
  const handleOpenBook = (book: any) => {
    setRecevedBookName(book.id);
    navigation.navigate('chapterList');
  };

  return (
    <View style={[styles.container, {backgroundColor: appBackground}]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* <Text style={{...styles.titles}} selectable={true}>
          Sherlock Holmes Novels
        </Text> */}

        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.horizontalScrollView}> */}
        <View style={styles.N_booksContainer}>
          {booksList.slice(5).map(book => (
            <TouchableOpacity
              key={book.id}
              onPress={() => handleOpenBook(book)}
              style={{...styles.N_bookView, width: bookWidth}}>
              <View
                style={{
                  ...styles.backgroundStyle,
                  backgroundColor: book.backgroundColor,
                }}
              />
              <Image style={styles.bookImage} source={book.image} />
              <Text
                style={[styles.booksName, {color: textColor}]}
                selectable={true}>
                {book.name}
              </Text>
            </TouchableOpacity>
          ))}
          {/* </ScrollView> */}
        </View>

        <Text
          style={{
            ...styles.titles,
            marginBottom: 8,
            marginTop: 10,
            color: textColor,
          }}>
          Short Story book
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          indicatorStyle="black"
          contentContainerStyle={styles.horizontalScrollView}>
          {booksList.slice(0, 5).map(book => (
            <TouchableOpacity
              onPress={() => handleOpenBook(book)}
              key={book.id}
              style={styles.bookView}>
              <View
                style={{
                  ...styles.backgroundStyle,
                  backgroundColor: book.backgroundColor,
                }}
              />
              <Image style={styles.bookImage} source={book.image} />
              <Text style={{...styles.booksName, color: textColor}}>
                {book.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f6f8fa',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  horizontalScrollView: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  titles: {
    fontFamily: 'MeriendaBold',
    // color: '#0a1930',
    marginTop: 5,
    fontSize: 17,
    marginLeft: 10,
  },
  bookView: {
    width: 145,
    marginHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
  },
  backgroundStyle: {
    width: '100%',
    height: 130,
    marginTop: 50,
    borderRadius: 10,
  },
  bookImage: {
    width: 100,
    height: 155,
    position: 'absolute',
    borderRadius: 10,
  },
  booksName: {
    // color: '#0a1930',
    fontFamily: 'kalpurush',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 10,
  },

  N_booksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  N_bookView: {
    marginTop: 20,
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 10,
  },
});
