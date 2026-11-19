import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC, useCallback, useLayoutEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ClockIcon, XMarkIcon} from 'react-native-heroicons/outline';
import {CheckCircleIcon} from 'react-native-heroicons/solid';
import {UseAppContext} from '../context/AppContext';
import {useThemeColors} from '../context/ThemeContext';
import {booksList} from '../database/HomeBookData';
import {
  ChapterRecord,
  chapterKey,
  clearHistory,
  historyList,
  percentLabel,
  removeFromHistory,
  timeAgo,
  useReading,
} from '../utils/reading';
import {openChapter} from '../utils/openChapter';

const COVER_WIDTH = 46;
const COVER_HEIGHT = Math.round((COVER_WIDTH * 515) / 360);

const keyExtractor = (record: ChapterRecord) =>
  chapterKey(record.bookId, record.chapterId);

// Where the reader has been, most recent first. Tap a row to go back to
// that place; the cross takes it off the list.
const History: FC = () => {
  const navigation = useNavigation<any>();
  const {setRecevedBookName} = UseAppContext();
  const {
    appBackground,
    textColor,
    subTextColor,
    cardColor,
    borderColor,
    softFill,
    shadowColor,
    iconColor,
    plusButtonBg,
  } = useThemeColors();
  const reading = useReading();
  const records = useMemo(() => historyList(reading), [reading]);
  const hasRecords = records.length > 0;

  const confirmClear = useCallback(() => {
    Alert.alert(
      'ইতিহাস মুছবেন?',
      'তালিকাটা খালি হবে। যে অধ্যায়গুলো শেষ করেছেন সেগুলো শেষ হিসেবেই থাকবে।',
      [
        {text: 'না', style: 'cancel'},
        {text: 'মুছুন', style: 'destructive', onPress: clearHistory},
      ],
    );
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: hasRecords
        ? () => (
            <TouchableOpacity
              onPress={confirmClear}
              hitSlop={styles.hitSlop}
              accessibilityRole="button">
              <Text style={[styles.clearText, {color: textColor}]}>
                সব মুছুন
              </Text>
            </TouchableOpacity>
          )
        : () => null,
    });
  }, [navigation, hasRecords, confirmClear, textColor]);

  const renderItem = useCallback(
    ({item: record}: {item: ChapterRecord}) => {
      const book = booksList.find(item => item.id === record.bookId);
      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            openChapter(
              navigation,
              setRecevedBookName,
              record.bookId,
              record.chapterId,
            )
          }
          style={[
            styles.card,
            {backgroundColor: cardColor, borderColor, shadowColor},
          ]}>
          {book ? (
            <Image resizeMethod="resize" source={book.image} style={styles.cover} />
          ) : (
            <View style={[styles.cover, {backgroundColor: softFill}]} />
          )}

          <View style={styles.body}>
            <Text
              numberOfLines={1}
              style={[styles.chapter, {color: textColor}]}>
              {record.selector}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.book, {color: subTextColor}]}>
              {book?.name ?? ''}
            </Text>

            <View style={styles.statusRow}>
              {record.done ? (
                <>
                  <CheckCircleIcon size={16} color={plusButtonBg} />
                  <Text style={[styles.status, {color: textColor}]}>
                    শেষ হয়েছে
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.track, {backgroundColor: softFill}]}>
                    <View
                      style={[
                        styles.fill,
                        {
                          backgroundColor: plusButtonBg,
                          width: `${Math.round(record.percent * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.status, {color: textColor}]}>
                    {percentLabel(record.percent)}
                  </Text>
                </>
              )}
              <Text style={[styles.time, {color: subTextColor}]}>
                · {timeAgo(record.visitedAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => removeFromHistory(record.bookId, record.chapterId)}
            hitSlop={styles.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Remove from history"
            style={styles.remove}>
            <XMarkIcon size={19} strokeWidth={2} color={subTextColor} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [
      navigation,
      setRecevedBookName,
      cardColor,
      borderColor,
      shadowColor,
      softFill,
      textColor,
      subTextColor,
      plusButtonBg,
    ],
  );

  if (!hasRecords) {
    return (
      <View style={[styles.empty, {backgroundColor: appBackground}]}>
        <View style={[styles.emptyIcon, {backgroundColor: softFill}]}>
          <ClockIcon size={42} strokeWidth={1.6} color={iconColor} />
        </View>
        <Text style={[styles.emptyTitle, {color: textColor}]}>
          এখনো কিছু পড়া হয়নি
        </Text>
        <Text style={[styles.emptyText, {color: subTextColor}]}>
          কোনো অধ্যায় খুললে সেটা এখানে জমা থাকবে, যাতে পরে ঠিক সেখান থেকেই
          আবার শুরু করতে পারেন।
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{backgroundColor: appBackground}}
      contentContainerStyle={styles.list}
      data={records}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};

export default History;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 40,
  },
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  clearText: {
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 22,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 4,
    marginTop: 10,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 5,
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  chapter: {
    fontFamily: 'kalpurush',
    fontSize: 19.5,
    lineHeight: 26,
  },
  book: {
    fontFamily: 'kalpurush',
    fontSize: 15.5,
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  track: {
    width: 54,
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 2.5,
  },
  status: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 19,
    marginLeft: 6,
  },
  time: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 19,
    marginLeft: 5,
  },
  remove: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'kalpurush',
    fontSize: 23,
    lineHeight: 30,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
});
