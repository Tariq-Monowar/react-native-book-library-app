import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ArrowRightIcon, CheckCircleIcon} from 'react-native-heroicons/solid';
import {booksList} from '../database/HomeBookData';
import {UseAppContext} from '../context/AppContext';
import {Book} from '../interface/Interface';
import {useThemeColors} from '../context/ThemeContext';
import {
  doneCount,
  getRecord,
  percentLabel,
  setChapterDone,
  toBengaliNumber,
  useReading,
} from '../utils/reading';

const keyExtractor = (chapter: Book) => String(chapter.id);

const ListFooter = () => <View style={styles.footer} />;

const ChapterList: FC = () => {
  const {bookChapter} = UseAppContext();
  const navigation = useNavigation<any>();
  const {
    appBackground,
    textColor,
    subTextColor,
    buttonColor,
    shadowColor,
    softFill,
    cardColor,
    borderColor,
    plusButtonBg,
    plusButtonFg,
  } = useThemeColors();
  const reading = useReading();

  const bookId: number | undefined = bookChapter?.id;
  const chapters: Book[] = useMemo(
    () => bookChapter?.data?.[1] ?? [],
    [bookChapter],
  );
  const finished =
    typeof bookId === 'number'
      ? Math.min(chapters.length, doneCount(reading, bookId))
      : 0;

  const openChapterRow = useCallback(
    (chapter: Book) =>
      navigation.navigate('chapter', {
        selector: chapter.selector,
        bookId,
        chapterId: Number(chapter.id),
      }),
    [navigation, bookId],
  );

  const renderItem = useCallback(
    ({item: chapter}: {item: Book}) => {
      const chapterId = Number(chapter.id);
      const selector = String(chapter.selector ?? '');
      const record =
        typeof bookId === 'number'
          ? getRecord(reading, bookId, chapterId)
          : undefined;
      const done = record?.done ?? false;
      const started = !done && (record?.percent ?? 0) > 0;

      return (
        <View
          style={[
            styles.chapterButton,
            styles.shadowProp,
            {backgroundColor: buttonColor, shadowColor: shadowColor},
          ]}>
          {/* The circle is the reader's own tick-box: tap it to mark the
              chapter finished, tap again to un-mark it. */}
          {typeof bookId === 'number' && (
            <TouchableOpacity
              onPress={() => setChapterDone(bookId, chapterId, selector, !done)}
              hitSlop={styles.hitSlop}
              accessibilityRole="checkbox"
              accessibilityState={{checked: done}}
              accessibilityLabel={
                done ? 'Mark as not finished' : 'Mark as finished'
              }
              style={styles.tick}>
              {done ? (
                <CheckCircleIcon size={28} color={plusButtonBg} />
              ) : (
                <View style={[styles.tickEmpty, {borderColor: subTextColor}]} />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openChapterRow(chapter)}
            style={styles.chapterMain}>
            <Text
              style={[
                styles.selectorName,
                {color: done ? subTextColor : textColor},
              ]}>
              {chapter.selector}
            </Text>
            {started && (
              <Text style={[styles.percent, {color: subTextColor}]}>
                {percentLabel(record?.percent ?? 0)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [
      openChapterRow,
      bookId,
      reading,
      buttonColor,
      shadowColor,
      textColor,
      subTextColor,
      plusButtonBg,
    ],
  );

  const book = booksList.find(item => item.id === bookId);
  const unit = book?.kind === 'stories' ? 'গল্প' : 'অধ্যায়';

  // What to read next in this book: the unfinished chapter opened most
  // recently, otherwise the first one that is not finished.
  const next = useMemo(() => {
    if (typeof bookId !== 'number') {
      return null;
    }
    let resume: {chapter: Book; visitedAt: number} | null = null;
    let firstOpen: Book | null = null;
    for (const chapter of chapters) {
      const record = getRecord(reading, bookId, Number(chapter.id));
      if (record?.done) {
        continue;
      }
      if (!firstOpen) {
        firstOpen = chapter;
      }
      if (
        record &&
        record.visitedAt > 0 &&
        (!resume || record.visitedAt > resume.visitedAt)
      ) {
        resume = {chapter, visitedAt: record.visitedAt};
      }
    }
    if (resume) {
      return {chapter: resume.chapter, resuming: true};
    }
    return firstOpen ? {chapter: firstOpen, resuming: false} : null;
  }, [bookId, chapters, reading]);

  const header =
    typeof bookId === 'number' && chapters.length > 0 ? (
      <View
        style={[
          styles.summary,
          {backgroundColor: cardColor, borderColor, shadowColor},
        ]}>
        <View style={styles.summaryTop}>
          {book ? <Image resizeMethod="resize" source={book.image} style={styles.summaryCover} /> : null}
          <View style={styles.summaryBody}>
            <Text style={[styles.summaryCount, {color: textColor}]}>
              {toBengaliNumber(finished)}
              <Text style={{color: subTextColor}}>
                /{toBengaliNumber(chapters.length)} {unit} শেষ
              </Text>
            </Text>
            <View style={[styles.summaryTrack, {backgroundColor: softFill}]}>
              <View
                style={[
                  styles.summaryFill,
                  {
                    backgroundColor: plusButtonBg,
                    width: `${Math.round((finished / chapters.length) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.summaryMeta, {color: subTextColor}]}>
              {finished === chapters.length
                ? 'পুরো বইটি পড়া শেষ'
                : `${toBengaliNumber(chapters.length - finished)}টি বাকি${
                    book ? ` · ${toBengaliNumber(book.year)}` : ''
                  }`}
            </Text>
          </View>
        </View>

        {next ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openChapterRow(next.chapter)}
            accessibilityRole="button"
            style={[styles.summaryButton, {backgroundColor: plusButtonBg}]}>
            <View style={styles.summaryButtonText}>
              <Text
                style={[styles.summaryButtonLabel, {color: plusButtonFg}]}>
                {next.resuming ? 'চালিয়ে যান' : 'পড়া শুরু করুন'}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.summaryButtonChapter, {color: plusButtonFg}]}>
                {String(next.chapter.selector ?? '')}
              </Text>
            </View>
            <ArrowRightIcon size={18} color={plusButtonFg} />
          </TouchableOpacity>
        ) : null}
      </View>
    ) : null;

  return (
    <View style={[styles.screen, {backgroundColor: appBackground}]}>
      <FlatList
        style={styles.list}
        data={chapters}
        // Rows show the reading history, so they follow it.
        extraData={reading}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={14}
        ListHeaderComponent={header}
        ListFooterComponent={ListFooter}
      />
    </View>
  );
};

export default ChapterList;

const styles = StyleSheet.create({
  screen: {
    height: '100%',
  },
  list: {
    paddingHorizontal: 10,
  },
  footer: {
    height: 100,
  },
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 4,
  },

  summary: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCover: {
    width: 58,
    height: 83,
    borderRadius: 6,
  },
  summaryBody: {
    flex: 1,
    marginLeft: 14,
  },
  summaryCount: {
    fontFamily: 'kalpurush',
    fontSize: 26,
    lineHeight: 32,
  },
  summaryTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  summaryFill: {
    height: 6,
    borderRadius: 3,
  },
  summaryMeta: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 6,
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  summaryButtonText: {
    flex: 1,
    marginRight: 10,
  },
  summaryButtonLabel: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 19,
    opacity: 0.75,
  },
  summaryButtonChapter: {
    fontFamily: 'kalpurush',
    fontSize: 19,
    lineHeight: 25,
  },

  chapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tick: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  tickEmpty: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    borderWidth: 1.8,
    opacity: 0.7,
  },
  chapterMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  selectorName: {
    flex: 1,
    fontFamily: 'kalpurush',
    textAlign: 'left',
    fontSize: 22,
    paddingVertical: 10,
    color: '#0a1930',
  },
  percent: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 8,
  },
});
