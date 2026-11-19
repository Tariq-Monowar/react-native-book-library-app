import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {MinusIcon, PlusIcon} from 'react-native-heroicons/outline';
import {UseAppContext} from '../context/AppContext';
import {useThemeColors} from '../context/ThemeContext';
import {getChapterText} from '../database/HomeBookData';
import {
  getRecord,
  saveProgress,
  useReading,
  visitChapter,
} from '../utils/reading';
import {getLocalData, storeLocalData} from '../utils/asyncstorage';

// Define the type for the route parameters
type ChapterRouteParams = {
  // Older callers pass the text directly; normally only the ids are given
  // and the chapter's text is loaded here.
  description?: {
    title: string;
    desc: string;
  }[];
  selector?: string;
  // Present when the chapter was opened from a book; they identify it in
  // the reading history.
  bookId?: number;
  chapterId?: number;
};

type Block = {
  key: string;
  type: 'title' | 'text';
  text: string;
  first: boolean;
  last: boolean;
};

// A chapter can be 60,000+ characters. Laying that out as a single <Text>
// blocks the screen from opening, so the text is cut into blocks of a
// paragraph or two and the list only lays out the blocks near the viewport.
// A block is also the unit the reading position is remembered in: the
// chapter reopens at the top of the block the reader was in, so smaller
// blocks mean landing closer to the exact line.
const BLOCK_MIN_CHARS = 500;
const PLUS_BUTTON_VISIBLE_MS = 7000;

// Cuts only at line breaks, and each cut replaces exactly one '\n' with the
// natural break between two <Text> blocks, so the page looks the same as one
// long <Text>.
const splitIntoBlocks = (desc: string): string[] => {
  const lines = desc.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let size = 0;
  for (const line of lines) {
    current.push(line);
    size += line.length + 1;
    if (size >= BLOCK_MIN_CHARS) {
      blocks.push(current.join('\n'));
      current = [];
      size = 0;
    }
  }
  if (current.length > 0) {
    blocks.push(current.join('\n'));
  }
  return blocks;
};

const buildBlocks = (description: ChapterRouteParams['description']) => {
  const out: Block[] = [];
  description?.forEach((data, index) => {
    if (data?.title) {
      out.push({
        key: `${index}-title`,
        type: 'title',
        text: data.title,
        first: true,
        last: true,
      });
    }
    const parts = splitIntoBlocks(data?.desc ?? '');
    parts.forEach((text, i) => {
      out.push({
        key: `${index}-${i}`,
        type: 'text',
        text,
        first: i === 0,
        last: i === parts.length - 1,
      });
    });
  });
  return out;
};

const keyExtractor = (item: Block) => item.key;

// Text sizes the reader can step through with the "অ" control.
const FONT_SIZES = [17, 19, 21, 23, 25, 28];
const DEFAULT_FONT_INDEX = 2;
const FONT_KEY = 'reading_font_size';
// Comfortable reading: lines spaced at 1.65 times the text size.
const LINE_SPACING = 1.65;

const Chapter = () => {
  const {setIsBottomSheetVisible} = UseAppContext();
  const [visibleBookmark, setVisibleBookmark] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    appBackground,
    textColor,
    subTextColor,
    plusButtonBg,
    plusButtonFg,
    cardColor,
    borderColor,
    shadowColor,
    iconColor,
  } = useThemeColors();
  const navigation = useNavigation<any>();

  // ---- Text size --------------------------------------------------------
  // "অ" in the header opens a small control to make the text smaller or
  // larger; the choice is remembered for every chapter.
  const [fontIndex, setFontIndex] = useState(DEFAULT_FONT_INDEX);
  const [sizeOpen, setSizeOpen] = useState(false);
  useEffect(() => {
    getLocalData(FONT_KEY).then(value => {
      const index = FONT_SIZES.indexOf(Number(value));
      if (index >= 0) {
        setFontIndex(index);
      }
    });
  }, []);
  const changeSize = useCallback((step: number) => {
    setFontIndex(current => {
      const next = Math.min(FONT_SIZES.length - 1, Math.max(0, current + step));
      storeLocalData(FONT_KEY, String(FONT_SIZES[next]));
      return next;
    });
  }, []);
  const fontSize = FONT_SIZES[fontIndex];
  const textStyle = useMemo(
    () => ({
      fontSize,
      lineHeight: Math.round(fontSize * LINE_SPACING),
    }),
    [fontSize],
  );
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setSizeOpen(open => !open)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel="Text size"
          style={styles.sizeButton}>
          <Text style={[styles.sizeButtonText, {color: iconColor}]}>অ</Text>
          <Text style={[styles.sizeButtonTextBig, {color: iconColor}]}>অ</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, iconColor]);

  const route = useRoute<RouteProp<{params: ChapterRouteParams}, 'params'>>();
  const {selector, bookId, chapterId} = route.params;
  const tracked = typeof bookId === 'number' && typeof chapterId === 'number';
  const description = useMemo(
    () =>
      route.params.description ??
      (tracked ? getChapterText(bookId, chapterId) : []),
    [route.params.description, tracked, bookId, chapterId],
  );

  const blocks = useMemo(() => buildBlocks(description), [description]);
  const totalChars = useMemo(
    () => blocks.reduce((sum, block) => sum + block.text.length, 0),
    [blocks],
  );

  // ---- Reading position -------------------------------------------------
  // The chapter reopens where the reader stopped, a thin bar under the
  // header shows how far they are, and reaching the end marks it finished.
  const reading = useReading();
  const listRef = useRef<FlatList<Block>>(null);
  // Where to reopen, read once when the screen opens: the block that was
  // at the top of the screen and how far down inside it the reader was.
  const start = useRef<{index: number; inner: number} | null>(null);
  if (start.current === null) {
    const record = tracked ? getRecord(reading, bookId, chapterId) : undefined;
    // A finished chapter starts again from the top.
    start.current =
      record && !record.done
        ? {
            index: Math.min(record.blockIndex, Math.max(0, blocks.length - 1)),
            inner: Math.max(0, record.innerOffset ?? 0),
          }
        : {index: 0, inner: 0};
  }
  const restoring = start.current.index > 0 || start.current.inner > 0;
  const position = useRef({
    percent: 0,
    blockIndex: start.current.index,
    inner: start.current.inner,
    snippet: '',
    // Which block `snippet` was taken from.
    snippetIndex: -1,
  });
  const barProgress = useRef(new Animated.Value(0)).current;

  // Where each block starts inside the list, filled in as blocks are laid
  // out. The exact reading position is worked out from these.
  const cellTops = useRef(new Map<number, number>()).current;
  const CellRenderer = useMemo(
    () =>
      ({onLayout, index, style, children}: any) =>
        (
          <View
            style={style}
            onLayout={event => {
              cellTops.set(index, event.nativeEvent.layout.y);
              onLayout?.(event);
            }}>
            {children}
          </View>
        ),
    [cellTops],
  );

  const persist = useCallback(() => {
    if (tracked) {
      saveProgress(
        bookId,
        chapterId,
        position.current.percent,
        position.current.blockIndex,
        {
          snippet: position.current.snippet,
          chars: totalChars,
          innerOffset: Math.round(position.current.inner),
        },
      );
    }
  }, [tracked, bookId, chapterId, totalChars]);

  // While the list is moved to the saved place it is kept invisible, then
  // faded in, so the reader never sees it jump.
  const listOpacity = useRef(new Animated.Value(restoring ? 0 : 1)).current;

  useEffect(() => {
    if (tracked) {
      visitChapter(bookId, chapterId, selector ?? '');
    }
    if (!restoring) {
      return;
    }
    const {index, inner} = start.current!;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () =>
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    // Blocks below the first screen are not laid out yet, so the list is
    // first moved near the place (which lays those blocks out), then to the
    // exact line once the block's position is known.
    const go = () => {
      const top = cellTops.get(index);
      if (top !== undefined) {
        listRef.current?.scrollToOffset({offset: top + inner, animated: false});
        // Once more on the next frame, in case blocks above were still
        // settling when the first jump was made.
        timer = setTimeout(() => {
          const settled = cellTops.get(index) ?? top;
          listRef.current?.scrollToOffset({
            offset: settled + inner,
            animated: false,
          });
          reveal();
        }, 60);
        return;
      }
      listRef.current?.scrollToIndex({
        index,
        viewOffset: -inner,
        animated: false,
      });
      tries += 1;
      if (tries > 12) {
        reveal();
        return;
      }
      timer = setTimeout(go, 70);
    };
    timer = setTimeout(go, 0);
    return () => clearTimeout(timer);
    // Runs once, when the chapter opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      // The block whose top is closest above the top of the screen.
      let best = -1;
      let bestTop = -Infinity;
      cellTops.forEach((top, index) => {
        if (top <= y + 0.5 && top > bestTop) {
          best = index;
          bestTop = top;
        }
      });
      if (best < 0) {
        return;
      }
      if (best !== position.current.snippetIndex) {
        position.current.snippetIndex = best;
        // The first words on screen: the reminder of where the reader is.
        position.current.snippet = (blocks[best]?.text ?? '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 140);
      }
      position.current.blockIndex = best;
      position.current.inner = y - bestTop;
    },
    [cellTops, blocks],
  );

  // Save on the way out as well, whatever the reader was doing.
  useEffect(() => persist, [persist]);

  const onScrollToIndexFailed = useCallback(
    (info: {index: number; averageItemLength: number}) => {
      // Move near the block so it gets laid out; the restore loop above
      // then lands on the exact line.
      listRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: false,
      });
    },
    [],
  );

  // FlatList requires these two to keep the same identity for its lifetime.
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 5}).current;
  const lastIndex = blocks.length - 1;
  const onViewable = useRef((info: {viewableItems: ViewToken[]}) => {
    const indexes = info.viewableItems
      .map(token => token.index)
      .filter((index): index is number => typeof index === 'number');
    if (indexes.length === 0) {
      return;
    }
    const top = Math.min(...indexes);
    const bottom = Math.max(...indexes);
    const now = latest.current;
    // Before any scrolling, the first block on screen gives the reminder.
    // (Not while the list is being moved to a saved place: onScroll sets
    // it from the real place then.)
    if (position.current.snippetIndex === -1 && !now.restoring) {
      position.current.snippetIndex = top;
      position.current.snippet = (now.blocks[top]?.text ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);
    }

    if (bottom >= now.lastIndex) {
      position.current.percent = 1;
      now.barProgress.setValue(1);
      now.persist();
      return;
    }
    // Progress is counted in blocks: the share of the chapter's blocks up
    // to the last one on screen. (The list's scroll height cannot be used
    // for this: blocks further down are not laid out yet, so it reads as
    // nearly finished long before the end.) What is on screen counts as
    // reached even before any scrolling, so a chapter that was only
    // opened does not read as 0%.
    const reached = Math.min(0.99, (bottom + 1) / (now.lastIndex + 1));
    if (reached > position.current.percent) {
      position.current.percent = reached;
      now.barProgress.setValue(reached);
    }
    // Record the place soon after opening, so the home screen is right
    // even if the reader leaves without scrolling.
    if (!firstSave.current) {
      firstSave.current = true;
      setTimeout(() => latest.current.persist(), 500);
    }
  }).current;
  const firstSave = useRef(false);
  // The callback above cannot change, so it reads current values from here.
  const latest = useRef({lastIndex, barProgress, persist, blocks, restoring});
  latest.current = {lastIndex, barProgress, persist, blocks, restoring};

  // Show the "+" button when the reader copies text. This listens for the
  // clipboard-changed event instead of reading the clipboard every second:
  // no timer running while reading, and the clipboard content is never read
  // (reading it is what makes iOS / Android 12+ show a "pasted" notice).
  useEffect(() => {
    const subscription = Clipboard.addListener(() => {
      setVisibleBookmark(true);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      hideTimer.current = setTimeout(() => {
        setVisibleBookmark(false);
      }, PLUS_BUTTON_VISIBLE_MS);
    });
    return () => {
      subscription.remove();
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const renderItem = useCallback(
    ({item}: {item: Block}) =>
      item.type === 'title' ? (
        <Text style={[styles.title, {color: textColor}]} selectable={true}>
          {item.text}
        </Text>
      ) : (
        <Text
          selectable={true}
          style={[
            styles.text,
            textStyle,
            item.first && styles.textFirst,
            item.last && styles.textLast,
            {color: textColor},
          ]}>
          {item.text}
        </Text>
      ),
    [textColor, textStyle],
  );

  return (
    <>
      {tracked && (
        <View style={[styles.barTrack, {backgroundColor: appBackground}]}>
          <Animated.View
            style={[
              styles.barFill,
              {
                backgroundColor: plusButtonBg,
                transform: [{scaleX: barProgress}],
              },
            ]}
          />
        </View>
      )}
      <Animated.FlatList
        ref={listRef as any}
        CellRendererComponent={CellRenderer}
        onScroll={onScroll}
        scrollEventThrottle={32}
        onMomentumScrollEnd={persist}
        onScrollEndDrag={persist}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewabilityConfig}
        style={[
          styles.container,
          {backgroundColor: appBackground, opacity: listOpacity},
        ]}
        contentContainerStyle={styles.content}
        data={blocks}
        // Text size changes re-draw every row.
        extraData={fontSize}
        onTouchStart={sizeOpen ? () => setSizeOpen(false) : undefined}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        // Keep only about two screens of text laid out above and below the
        // reader: enough for smooth scrolling, far less memory.
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        // Android: text selection stops working in clipped list rows.
        removeClippedSubviews={false}
      />
      {sizeOpen && (
        <View
          style={[
            styles.sizePanel,
            {backgroundColor: cardColor, borderColor, shadowColor},
          ]}>
          <TouchableOpacity
            onPress={() => changeSize(-1)}
            disabled={fontIndex === 0}
            accessibilityLabel="Smaller text"
            style={[styles.sizeStep, fontIndex === 0 && styles.sizeDisabled]}>
            <MinusIcon size={20} strokeWidth={2.4} color={textColor} />
          </TouchableOpacity>
          <View style={styles.sizeMiddle}>
            <Text style={[styles.sizeSample, {color: textColor, fontSize}]}>
              অক্ষর
            </Text>
            <View style={styles.sizeDots}>
              {FONT_SIZES.map((size, index) => (
                <View
                  key={size}
                  style={[
                    styles.sizeDot,
                    {
                      backgroundColor:
                        index <= fontIndex ? textColor : subTextColor,
                      opacity: index <= fontIndex ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => changeSize(1)}
            disabled={fontIndex === FONT_SIZES.length - 1}
            accessibilityLabel="Larger text"
            style={[
              styles.sizeStep,
              fontIndex === FONT_SIZES.length - 1 && styles.sizeDisabled,
            ]}>
            <PlusIcon size={20} strokeWidth={2.4} color={textColor} />
          </TouchableOpacity>
        </View>
      )}
      {visibleBookmark && (
        <TouchableOpacity
          onPress={() => setIsBottomSheetVisible(true)}
          style={[styles.addBookmarked, {backgroundColor: plusButtonBg}]}>
          <PlusIcon size={32} strokeWidth={2} color={plusButtonFg} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default Chapter;

const styles = StyleSheet.create({
  container: {
    // Wider margins: shorter lines are easier to follow.
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#f9fafc',
  },
  content: {
    paddingTop: 8,
    paddingBottom: 48,
  },
  sizeButton: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  sizeButtonText: {
    fontFamily: 'kalpurush',
    fontSize: 15,
    lineHeight: 22,
  },
  sizeButtonTextBig: {
    fontFamily: 'kalpurush',
    fontSize: 21,
    lineHeight: 26,
    marginLeft: 1,
  },
  sizePanel: {
    position: 'absolute',
    top: 10,
    right: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  sizeStep: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeDisabled: {
    opacity: 0.3,
  },
  sizeMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  sizeSample: {
    fontFamily: 'kalpurush',
  },
  sizeDots: {
    flexDirection: 'row',
    marginTop: 6,
  },
  sizeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  barTrack: {
    height: 3,
  },
  barFill: {
    height: 3,
    width: '100%',
    // Grows from the left edge as scaleX goes from 0 to 1.
    transformOrigin: 'left',
  },
  title: {
    fontFamily: 'kalpurush',
    color: '#0a1930',
    fontSize: 26,
    lineHeight: 36,
    marginTop: 12,
    marginBottom: 2,
  },
  text: {
    fontFamily: 'kalpurush',
    color: '#0a1930',
  },
  // The original single <Text> had marginVertical: 10; keep that only at the
  // outer edges of a section so blocks inside it join without a gap.
  textFirst: {
    marginTop: 10,
  },
  textLast: {
    marginBottom: 10,
  },
  addBookmarked: {
    width: 60,
    height: 60,
    position: 'absolute',
    zIndex: 10,
    bottom: 25,
    right: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#263147',
    elevation: 3,
  },
});
