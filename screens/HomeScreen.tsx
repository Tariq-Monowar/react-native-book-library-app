import {
  Image,
  Pressable,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlatList as GestureFlatList} from 'react-native-gesture-handler';
import {shelfScrollRef} from '../utils/gestures';
import {ChevronRightIcon} from 'react-native-heroicons/outline';
import {UseAppContext} from '../context/AppContext';
import {
  READING_ORDER,
  booksList,
  getBookInternalData,
} from '../database/HomeBookData';
import {useThemeColors} from '../context/ThemeContext';
import {
  doneCount,
  getRecord,
  lastRead,
  minutesLeft,
  percentLabel,
  timeAgo,
  toBengaliNumber,
  useReading,
} from '../utils/reading';
import {openChapter} from '../utils/openChapter';

type BookInfo = (typeof booksList)[number];

// The book a first-time reader is pointed to: the first Holmes story.
const FIRST_BOOK_ID = 9;

const SCREEN_PADDING = 14;
// Book covers are drawn at the proportions of the artwork (360 x 515).
const COVER_RATIO = 515 / 360;
const HERO_COVER_WIDTH = 74;
const ROW_COVER_WIDTH = 54;

const SHELF_COVER_WIDTH = 124;
const byYear = (a: BookInfo, b: BookInfo) => a.year - b.year;
const NOVELS = booksList.filter(book => book.kind === 'novel').sort(byYear);
const COLLECTIONS = booksList
  .filter(book => book.kind === 'stories')
  .sort(byYear);

// The books in reading order, each with its one-line reason (used to
// suggest the next book once one is finished).
const ORDERED = READING_ORDER.map(({id, hint}) => ({
  book: booksList.find(item => item.id === id)!,
  hint,
}));

// "আ স্টাডি ইন স্কারলেট (রক্ত সমীক্ষা)" -> "আ স্টাডি ইন স্কারলেট": the
// part in brackets is an alternative title, too long for a small cover.
const shortName = (name: string) => name.replace(/\s*\(.*\)\s*$/, '');

const unitFor = (book: BookInfo) =>
  book.kind === 'novel' ? 'অধ্যায়' : 'গল্প';

// A book cover: the artwork at its own proportions, with a soft shadow under
// it and a thin highlight down the left edge where a real book has its spine.
const Cover: FC<{source: ImageSourcePropType; width: number}> = ({
  source,
  width,
}) => {
  const height = Math.round(width * COVER_RATIO);
  const radius = Math.max(4, Math.round(width * 0.06));
  return (
    <View style={[styles.coverShadow, {width, height, borderRadius: radius}]}>
      <Image
        resizeMethod="resize"
        source={source}
        style={{width, height, borderRadius: radius}}
        resizeMode="cover"
      />
    </View>
  );
};

const ProgressBar: FC<{value: number; track: string; fill: string}> = ({
  value,
  track,
  fill,
}) => (
  <View style={[styles.progressTrack, {backgroundColor: track}]}>
    <View
      style={[
        styles.progressFill,
        {backgroundColor: fill, width: `${Math.round(value * 100)}%`},
      ]}
    />
  </View>
);

const HomeScreen: FC = () => {
  const navigation = useNavigation<any>();
  const {setRecevedBookName} = UseAppContext();
  const colors = useThemeColors();
  const {
    appBackground,
    textColor,
    subTextColor,
    cardColor,
    borderColor,
    softFill,
    shadowColor,
    plusButtonBg,
  } = colors;

  // The reading history; this screen re-renders whenever it changes.
  const reading = useReading();
  const readingState = reading;
  const last = useMemo(() => lastRead(reading), [reading]);

  // How many chapters of a book are finished.
  const readCount = useCallback(
    (book: BookInfo) => Math.min(book.chapters, doneCount(reading, book.id)),
    [reading],
  );

  const openBook = useCallback(
    (book: BookInfo) => {
      setRecevedBookName(book.id);
      navigation.navigate('chapterList');
    },
    [navigation, setRecevedBookName],
  );

  const lastBook = useMemo(
    () =>
      last ? booksList.find(book => book.id === last.bookId) ?? null : null,
    [last],
  );

  const left = last ? minutesLeft(last) : null;

  // When the chapter read last is finished, the card moves on by itself:
  // it offers the next unfinished chapter of the same book. (The book's text
  // is only loaded in that case.)
  const upNext = useMemo(() => {
    if (!last || !last.done) {
      return null;
    }
    const chapters: any[] = getBookInternalData(last.bookId)?.data?.[1] ?? [];
    const isOpen = (chapter: any) =>
      !getRecord(reading, last.bookId, Number(chapter.id))?.done;
    const at = chapters.findIndex(chapter => chapter.id === last.chapterId);
    const chapter =
      chapters.slice(at + 1).find(isOpen) ?? chapters.find(isOpen) ?? null;
    return chapter
      ? {
          chapterId: Number(chapter.id),
          selector: String(chapter.selector ?? ''),
        }
      : null;
  }, [last, reading]);
  const bookFinished = !!last?.done && !upNext;
  // When a whole book is finished, the card points to the next book in
  // reading order that is not finished yet.
  const nextBook = useMemo(() => {
    if (!bookFinished || !lastBook) {
      return null;
    }
    const at = ORDERED.findIndex(entry => entry.book.id === lastBook.id);
    const later = [...ORDERED.slice(at + 1), ...ORDERED.slice(0, at)];
    return (
      later.find(entry => readCount(entry.book) < entry.book.chapters)?.book ??
      null
    );
  }, [bookFinished, lastBook, readCount]);

  const continueReading = useCallback(() => {
    if (!last) {
      return;
    }
    if (bookFinished && lastBook) {
      openBook(nextBook ?? lastBook);
      return;
    }
    openChapter(
      navigation,
      setRecevedBookName,
      last.bookId,
      upNext ? upNext.chapterId : last.chapterId,
    );
  }, [
    last,
    lastBook,
    upNext,
    bookFinished,
    nextBook,
    openBook,
    navigation,
    setRecevedBookName,
  ]);

  const firstBook = booksList.find(book => book.id === FIRST_BOOK_ID)!;

  const sectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, {color: textColor}]}>{title}</Text>
      <Text style={[styles.countText, {color: subTextColor}]}>
        {toBengaliNumber(count)}টি বই
      </Text>
    </View>
  );

  const renderNovel = ({item: book}: {item: BookInfo}) => {
    const done = readCount(book);
    return (
      <Pressable
        onPress={() => openBook(book)}
        accessibilityRole="button"
        accessibilityLabel={book.name}
        // Pressed: shrink a touch instead of fading, so nothing behind the
        // cover shows through.
        style={({pressed}) => [
          styles.novel,
          {width: SHELF_COVER_WIDTH},
          pressed && styles.novelPressed,
        ]}>
        <Cover source={book.image} width={SHELF_COVER_WIDTH} />
        <Text numberOfLines={1} style={[styles.novelTitle, {color: textColor}]}>
          {shortName(book.name)}
        </Text>
        <Text style={[styles.novelYear, {color: subTextColor}]}>
          {toBengaliNumber(book.chapters)}টি অধ্যায় ·{' '}
          {toBengaliNumber(book.year)}
        </Text>
        {done > 0 && (
          <View style={styles.novelProgress}>
            <ProgressBar
              value={done / book.chapters}
              track={softFill}
              fill={plusButtonBg}
            />
          </View>
        )}
      </Pressable>
    );
  };

  const meta = (book: BookInfo) =>
    `${toBengaliNumber(book.chapters)}টি ${unitFor(book)} · ${toBengaliNumber(
      book.year,
    )}`;

  return (
    <View style={[styles.container, {backgroundColor: appBackground}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* The first thing on the screen is the one thing most readers come
            for: picking up where they stopped (or, the first time, where to
            start). */}
        {(() => {
          // The card at the top: the book the reader is in, the chapter
          // they stopped at and the words they stopped on, and a bar of the
          // whole book split into its chapters. The first time, it points
          // to where the stories begin.
          const reading = !!(lastBook && last);
          const book = reading
            ? (bookFinished && nextBook) || lastBook!
            : firstBook;
          const chapterId = reading
            ? upNext
              ? upNext.chapterId
              : last!.chapterId
            : null;
          const chapters: any[] = getBookInternalData(book.id)?.data?.[1] ?? [];
          const position = chapters.findIndex(
            item => Number(item.id) === chapterId,
          );
          const label = !reading
            ? 'এখান থেকে শুরু করুন'
            : bookFinished
            ? nextBook
              ? `${shortName(lastBook!.name)} শেষ · এরপর পড়ুন`
              : 'সব বই পড়া শেষ'
            : upNext
            ? 'এরপর পড়ুন'
            : `পড়ছেন · ${timeAgo(last!.visitedAt)}`;
          const title = !reading
            ? 'শার্লক হোমসের প্রথম কাহিনি'
            : bookFinished
            ? nextBook
              ? READING_ORDER.find(entry => entry.id === nextBook.id)!.hint
              : 'সব অধ্যায় শেষ হয়েছে'
            : upNext
            ? upNext.selector
            : last!.selector;
          const where =
            reading && position >= 0
              ? `${unitFor(book)} ${toBengaliNumber(
                  position + 1,
                )}/${toBengaliNumber(chapters.length)}`
              : `${toBengaliNumber(book.chapters)}টি ${unitFor(book)}`;
          const extra =
            reading && !last!.done && !upNext
              ? left !== null
                ? `আরও ${toBengaliNumber(left)} মিনিট`
                : percentLabel(last!.percent)
              : toBengaliNumber(book.year);
          const quote =
            reading && !last!.done && !upNext ? last!.snippet : undefined;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={reading ? continueReading : () => openBook(firstBook)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${title}`}
              style={[
                styles.hero,
                {backgroundColor: cardColor, borderColor, shadowColor},
              ]}>
              <View style={styles.heroTop}>
                <Cover source={book.image} width={HERO_COVER_WIDTH} />
                <View style={styles.heroBody}>
                  <Text
                    numberOfLines={1}
                    style={[styles.heroBook, {color: subTextColor}]}>
                    {shortName(book.name)}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.heroTitle, {color: textColor}]}>
                    {title}
                  </Text>
                  <View style={styles.heroMetaRow}>
                    <View
                      style={[styles.heroDot, {backgroundColor: plusButtonBg}]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.heroMeta, {color: subTextColor}]}>
                      {label}
                    </Text>
                  </View>
                </View>
              </View>

              {quote ? (
                <View style={styles.heroQuote}>
                  <Text style={[styles.heroQuoteMark, {color: plusButtonBg}]}>
                    “
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.heroQuoteText, {color: textColor}]}>
                    {quote}
                  </Text>
                </View>
              ) : null}

              {/* The whole book, one segment per chapter: finished ones
                  filled, the current one filled as far as it was read. */}
              <View style={styles.heroSegments}>
                {chapters.map(item => {
                  const record = getRecord(
                    readingState,
                    book.id,
                    Number(item.id),
                  );
                  const fill = record?.done
                    ? 1
                    : Number(item.id) === chapterId
                    ? record?.percent ?? 0
                    : 0;
                  return (
                    <View key={item.id} style={styles.heroSegment}>
                      <View
                        style={[
                          styles.heroSegmentTrack,
                          {backgroundColor: subTextColor},
                        ]}
                      />
                      {fill > 0 ? (
                        <View
                          style={[
                            styles.heroSegmentFill,
                            {
                              backgroundColor: plusButtonBg,
                              width: `${Math.round(fill * 100)}%`,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={styles.heroFooter}>
                <Text style={[styles.heroFooterText, {color: subTextColor}]}>
                  {where} · {extra}
                </Text>
                <View style={styles.heroAction}>
                  <Text style={[styles.heroActionText, {color: textColor}]}>
                    {!reading
                      ? 'শুরু করুন'
                      : bookFinished
                      ? nextBook
                        ? 'শুরু করুন'
                        : 'বইটি খুলুন'
                      : 'চালিয়ে যান'}
                  </Text>
                  <ChevronRightIcon
                    size={16}
                    strokeWidth={2.6}
                    color={textColor}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })()}

        {sectionHeader('উপন্যাস', NOVELS.length)}
        {/* A sideways shelf of covers. A swipe that starts here scrolls
            the books; anywhere else it opens the side menu. */}
        <GestureFlatList
          ref={shelfScrollRef}
          horizontal
          data={NOVELS}
          renderItem={renderNovel}
          keyExtractor={book => String(book.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shelf}
        />

        {sectionHeader('গল্প সংকলন', COLLECTIONS.length)}
        <View
          style={[
            styles.group,
            {backgroundColor: cardColor, borderColor, shadowColor},
          ]}>
          {COLLECTIONS.map((book, index) => {
            const done = readCount(book);
            const isLast = index === COLLECTIONS.length - 1;
            return (
              <TouchableOpacity
                key={book.id}
                activeOpacity={0.75}
                onPress={() => openBook(book)}
                accessibilityRole="button"
                accessibilityLabel={book.name}
                style={styles.row}>
                <Cover source={book.image} width={ROW_COVER_WIDTH} />
                <View
                  style={[
                    styles.rowMain,
                    !isLast && {
                      borderBottomColor: borderColor,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}>
                  <View style={styles.rowText}>
                    <Text
                      numberOfLines={2}
                      style={[styles.rowTitle, {color: textColor}]}>
                      {book.name}
                    </Text>
                    <Text style={[styles.metaText, {color: subTextColor}]}>
                      {meta(book)}
                    </Text>
                    {done > 0 && (
                      <View style={styles.rowProgress}>
                        <ProgressBar
                          value={done / book.chapters}
                          track={softFill}
                          fill={plusButtonBg}
                        />
                        <Text
                          style={[
                            styles.rowProgressText,
                            {color: subTextColor},
                          ]}>
                          {toBengaliNumber(done)}/
                          {toBengaliNumber(book.chapters)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <ChevronRightIcon
                    size={18}
                    strokeWidth={2.2}
                    color={subTextColor}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 36,
  },

  // Soft shadow on iOS. No Android elevation: while a cover is pressed it
  // fades a little, and Android then draws its elevation as a light ring
  // around the cover.
  coverShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 2.5,
  },

  hero: {
    marginHorizontal: SCREEN_PADDING,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBody: {
    flex: 1,
    marginLeft: 16,
  },
  heroBook: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 19,
  },
  heroTitle: {
    fontFamily: 'kalpurush',
    fontSize: 22,
    lineHeight: 29,
    marginTop: 2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  heroMeta: {
    flex: 1,
    fontFamily: 'kalpurush',
    fontSize: 13.5,
    lineHeight: 18,
  },
  heroQuote: {
    flexDirection: 'row',
    marginTop: 16,
  },
  heroQuoteMark: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '700',
    marginRight: 6,
    marginTop: -2,
  },
  heroQuoteText: {
    flex: 1,
    fontFamily: 'kalpurush',
    fontSize: 16.5,
    lineHeight: 24,
    opacity: 0.85,
  },
  heroSegments: {
    flexDirection: 'row',
    marginTop: 18,
  },
  heroSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1.5,
    overflow: 'hidden',
  },
  // Unread part of a segment: the grey text colour, faded right down.
  heroSegmentTrack: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  heroSegmentFill: {
    height: 4,
    borderRadius: 2,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  heroFooterText: {
    fontFamily: 'kalpurush',
    fontSize: 14,
    lineHeight: 18,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionText: {
    fontFamily: 'kalpurush',
    fontSize: 16,
    lineHeight: 21,
    marginRight: 2,
  },

  sectionNote: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 21,
    marginHorizontal: SCREEN_PADDING + 2,
    marginTop: -6,
    marginBottom: 12,
  },
  stepColumn: {
    width: 30,
    alignItems: 'center',
    marginRight: 8,
  },
  step: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: 'kalpurush',
    fontSize: 14,
    lineHeight: 18,
  },
  rowHint: {
    fontFamily: 'kalpurush',
    fontSize: 14.5,
    lineHeight: 20,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SCREEN_PADDING,
    marginTop: 30,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'kalpurush',
    fontSize: 26,
    lineHeight: 32,
  },
  countPill: {
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 11,
    justifyContent: 'center',
  },
  countText: {
    fontFamily: 'kalpurush',
    fontSize: 14,
    lineHeight: 18,
  },
  metaText: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },

  shelf: {
    paddingHorizontal: SCREEN_PADDING,
    // Room for the covers' shadows, which a sideways list would clip.
    paddingBottom: 10,
  },
  novelPressed: {
    transform: [{scale: 0.96}],
  },
  novel: {
    marginRight: 14,
  },
  novelTitle: {
    fontFamily: 'kalpurush',
    fontSize: 16,
    lineHeight: 21,
    marginTop: 10,
  },
  novelYear: {
    fontFamily: 'kalpurush',
    fontSize: 12.5,
    lineHeight: 16,
    marginTop: 1,
  },
  novelProgress: {
    flexDirection: 'row',
    marginTop: 8,
  },

  group: {
    marginHorizontal: SCREEN_PADDING,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingRight: 12,
    paddingVertical: 14,
    minHeight: ROW_COVER_WIDTH * COVER_RATIO + 24,
  },
  rowText: {
    flex: 1,
    marginRight: 8,
  },
  rowTitle: {
    fontFamily: 'kalpurush',
    fontSize: 19,
    lineHeight: 25,
  },
  rowProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rowProgressText: {
    fontFamily: 'kalpurush',
    fontSize: 13.5,
    lineHeight: 17,
    marginLeft: 8,
  },
});
