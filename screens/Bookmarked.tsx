import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import {StarIcon as StarSolidIcon} from 'react-native-heroicons/solid';
import {UseAppContext} from '../context/AppContext';
import {useThemeColors} from '../context/ThemeContext';
import {Task} from '../interface/Interface';
import {getLocalData, storeLocalData} from '../utils/asyncstorage';
import {HEADER_HEIGHT, STATUS_BAR_HEIGHT} from '../utils/layout';

// How much text to keep in front of a match that sits deep inside a bookmark.
const SNIPPET_LEAD_CHARS = 18;
const STAR_COLOR = '#f5a524';
const SCREEN_PADDING = 14;
// Gap between the tab's sliding line and the tab's own edges.
const TAB_LINE_INSET = 28;

// Grid view: clean cards in two columns, each as tall as its text, the
// columns filled independently so they stay level (like Google Keep or
// Apple Notes).
const NOTE_MAX_LINES = 8;
// Rough number of characters that fit on one line of a card, used only to
// decide which column a card goes in so the two columns end up level.
const NOTE_CHARS_PER_LINE = 16;

// What the reader chose is remembered between visits.
const FAVORITES_KEY = 'bookmark_favorites';
const VIEW_KEY = 'bookmark_view';
const SORT_KEY = 'bookmark_sort';

type ViewMode = 'list' | 'grid';
type SortMode = 'newest' | 'oldest' | 'az';
type Filter = 'all' | 'favorites';

const VIEW_OPTIONS: {value: ViewMode; label: string}[] = [
  {value: 'list', label: 'List'},
  {value: 'grid', label: 'Grid'},
];
const SORT_OPTIONS: {value: SortMode; label: string}[] = [
  {value: 'newest', label: 'Newest first'},
  {value: 'oldest', label: 'Oldest first'},
  {value: 'az', label: 'Title A to Z'},
];

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "holmes  Watson" -> ['holmes', 'watson']. Every word must be found, in any
// order, in the title or the text.
const toTerms = (query: string) =>
  oneLine(query).toLowerCase().split(' ').filter(Boolean);

type Entry = {
  item: Task;
  title: string;
  body: string;
};

// Title matches are worth more than text matches, so they are listed first.
const scoreEntry = (entry: Entry, terms: string[]): number => {
  const title = entry.title.toLowerCase();
  const body = entry.body.toLowerCase();
  let score = 0;
  for (const term of terms) {
    const inTitle = title.includes(term);
    const inBody = body.includes(term);
    if (!inTitle && !inBody) {
      return 0;
    }
    score += inTitle ? (title.startsWith(term) ? 4 : 3) : 1;
  }
  return score;
};

// When the match is far into a long text, start the preview just before it so
// the reader sees why this bookmark was found.
const snippetAround = (text: string, terms: string[]): string => {
  const lower = text.toLowerCase();
  let first = -1;
  for (const term of terms) {
    const at = lower.indexOf(term);
    if (at !== -1 && (first === -1 || at < first)) {
      first = at;
    }
  }
  if (first <= SNIPPET_LEAD_CHARS) {
    return text;
  }
  let start = first - SNIPPET_LEAD_CHARS;
  const space = text.indexOf(' ', start);
  if (space !== -1 && space < first) {
    start = space + 1;
  }
  return '…' + text.slice(start);
};

const keyExtractor = (entry: Entry) => String(entry.item.id);

const Bookmarked: React.FC = () => {
  const {getDBConnection, deleteTodo, todos, setIsBottomSheetVisible} =
    UseAppContext();
  const colors = useThemeColors();
  const {
    appBackground,
    textColor,
    subTextColor,
    borderColor,
    softFill,
    cardColor,
    shadowColor,
    iconColor,
    plusButtonBg,
    plusButtonFg,
    highlightColor,
    appHeader,
  } = colors;
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const searchRef = useRef<TextInput>(null);
  const [tabsWidth, setTabsWidth] = useState(0);
  const tabPosition = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(tabPosition, {
      toValue: filter === 'favorites' ? 1 : 0,
      duration: 220,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [filter, tabPosition]);

  // Restore what was chosen last time.
  useEffect(() => {
    (async () => {
      const [savedFavorites, savedView, savedSort] = await Promise.all([
        getLocalData(FAVORITES_KEY),
        getLocalData(VIEW_KEY),
        getLocalData(SORT_KEY),
      ]);
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            setFavoriteIds(parsed.filter(id => typeof id === 'number'));
          }
        } catch (error) {
          // Unreadable list: start with no favourites.
        }
      }
      if (savedView === 'list' || savedView === 'grid') {
        setViewMode(savedView);
      }
      if (savedSort === 'newest' || savedSort === 'oldest' || savedSort === 'az') {
        setSortMode(savedSort);
      }
    })();
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(current => {
      const next = current.includes(id)
        ? current.filter(other => other !== id)
        : [...current, id];
      storeLocalData(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const chooseView = useCallback((value: ViewMode) => {
    setViewMode(value);
    storeLocalData(VIEW_KEY, value);
  }, []);

  const chooseSort = useCallback((value: SortMode) => {
    setSortMode(value);
    storeLocalData(SORT_KEY, value);
  }, []);

  // One-line versions prepared once. `todos` is in the order they were added.
  const allEntries: Entry[] = useMemo(
    () =>
      ((todos ?? []) as Task[]).map(item => ({
        item,
        title: oneLine(item.title ?? ''),
        body: oneLine(item.description ?? ''),
      })),
    [todos],
  );

  const favoriteCount = useMemo(
    () => allEntries.filter(entry => favoriteSet.has(entry.item.id)).length,
    [allEntries, favoriteSet],
  );

  const terms = useMemo(() => toTerms(query), [query]);
  const isSearching = terms.length > 0;

  const visibleEntries = useMemo(() => {
    let entries =
      filter === 'favorites'
        ? allEntries.filter(entry => favoriteSet.has(entry.item.id))
        : allEntries;

    if (isSearching) {
      // While searching, the best match comes first whatever the sort is.
      return entries
        .map(entry => ({entry, score: scoreEntry(entry, terms)}))
        .filter(scored => scored.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(scored => scored.entry);
    }
    if (sortMode === 'newest') {
      return [...entries].reverse();
    }
    if (sortMode === 'az') {
      return [...entries].sort((a, b) =>
        (a.title || a.body).localeCompare(b.title || b.body),
      );
    }
    return entries;
  }, [allEntries, filter, favoriteSet, isSearching, terms, sortMode]);

  const highlightPattern = useMemo(
    () =>
      isSearching
        ? new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
        : null,
    [terms, isSearching],
  );

  // Splits text on the searched words and paints the matching parts.
  const highlight = useCallback(
    (text: string) => {
      if (!highlightPattern) {
        return text;
      }
      return text.split(highlightPattern).map((part, index) =>
        // split() with one capture group puts the matches at odd indexes.
        index % 2 === 1 ? (
          <Text
            key={index}
            style={[
              styles.highlight,
              {backgroundColor: highlightColor, color: textColor},
            ]}>
            {part}
          </Text>
        ) : (
          part
        ),
      );
    },
    [highlightPattern, highlightColor, textColor],
  );

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // Focus once the field has been mounted.
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setQuery('');
    setSearchOpen(false);
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSearch();
      return true;
    });
    return () => sub.remove();
  }, [searchOpen, closeSearch]);

  const openAddSheet = useCallback(() => {
    Keyboard.dismiss();
    setIsBottomSheetVisible(true);
  }, [setIsBottomSheetVisible]);

  const confirmDelete = useCallback(
    (item: Task) => {
      Alert.alert(
        'Delete bookmark?',
        'This bookmark will be removed permanently.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const db = await getDBConnection();
              if (db) {
                deleteTodo(db, item.id);
              }
              // Drop it from the favourites too, so the list stays clean.
              setFavoriteIds(current => {
                if (!current.includes(item.id)) {
                  return current;
                }
                const next = current.filter(other => other !== item.id);
                storeLocalData(FAVORITES_KEY, JSON.stringify(next));
                return next;
              });
            },
          },
        ],
      );
    },
    [getDBConnection, deleteTodo],
  );

  // Long-press: the same actions for a card in either view.
  const openCardActions = useCallback(
    (entry: Entry) => {
      const isFavorite = favoriteSet.has(entry.item.id);
      Alert.alert(entry.title || entry.body.slice(0, 40), undefined, [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(entry.item),
        },
        {
          text: isFavorite ? 'Remove favourite' : 'Add to favourites',
          onPress: () => toggleFavorite(entry.item.id),
        },
        {text: 'Cancel', style: 'cancel'},
      ]);
    },
    [favoriteSet, confirmDelete, toggleFavorite],
  );

  const hasBookmarks = allEntries.length > 0;

  // The header carries the page's tools as two icons, so the page itself
  // stays clear: search, and a menu for the view and the order.
  useLayoutEffect(() => {
    navigation.setOptions({
      // While searching, the screen draws its own header with the search
      // field in it (see below), the way Gmail or Telegram do.
      headerShown: !searchOpen,
      headerRight: hasBookmarks
        ? () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={searchOpen ? closeSearch : openSearch}
                hitSlop={styles.hitSlop}
                accessibilityRole="button"
                accessibilityLabel="Search bookmarks"
                style={styles.headerButton}>
                <MagnifyingGlassIcon
                  size={24}
                  strokeWidth={2.2}
                  color={iconColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                hitSlop={styles.hitSlop}
                accessibilityRole="button"
                accessibilityLabel="View and sort options"
                style={styles.headerButton}>
                <EllipsisVerticalIcon
                  size={24}
                  strokeWidth={2.2}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>
          )
        : () => null,
    });
  }, [navigation, hasBookmarks, searchOpen, closeSearch, openSearch, iconColor]);

  // One card (grid view).
  const renderNote = (entry: Entry) => {
    const {item, title} = entry;
    const body = isSearching ? snippetAround(entry.body, terms) : entry.body;
    const isFavorite = favoriteSet.has(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('MarkedDetalse', {data: item})}
        onLongPress={() => openCardActions(entry)}
        style={[
          styles.note,
          {backgroundColor: cardColor, borderColor, shadowColor},
        ]}>
        {title ? (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[styles.noteTitle, {color: textColor}]}>
            {highlight(title)}
          </Text>
        ) : null}
        <Text
          numberOfLines={NOTE_MAX_LINES}
          ellipsizeMode="tail"
          style={[
            styles.noteText,
            {color: title ? subTextColor : textColor},
          ]}>
          {highlight(body)}
        </Text>

        <View style={[styles.noteFooter, {borderTopColor: borderColor}]}>
          <BookmarkIcon size={15} strokeWidth={2} color={subTextColor} />
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            hitSlop={styles.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'Remove from favourites' : 'Add to favourites'
            }>
            {isFavorite ? (
              <StarSolidIcon size={19} color={STAR_COLOR} />
            ) : (
              <StarIcon size={19} strokeWidth={1.8} color={subTextColor} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Deals the notes into two columns, always adding to the shorter one, so
  // notes of different heights still leave the columns about level.
  const noteColumns = useMemo(() => {
    const columns: [Entry[], Entry[]] = [[], []];
    const heights = [0, 0];
    for (const entry of visibleEntries) {
      const lines =
        (entry.title ? 1.4 : 0) +
        Math.min(
          NOTE_MAX_LINES,
          Math.max(1, Math.ceil(entry.body.length / NOTE_CHARS_PER_LINE)),
        );
      const shorter = heights[0] <= heights[1] ? 0 : 1;
      columns[shorter].push(entry);
      // +3 for the card's padding, footer and the gap under it.
      heights[shorter] += lines + 3;
    }
    return columns;
  }, [visibleEntries]);

  const renderItem = useCallback(
    ({item: entry}: {item: Entry}) => {
      const {item, title} = entry;
      const body = isSearching ? snippetAround(entry.body, terms) : entry.body;
      const isFavorite = favoriteSet.has(item.id);
      const open = () => navigation.navigate('MarkedDetalse', {data: item});

      const star = (
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          hitSlop={styles.hitSlop}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favourites' : 'Add to favourites'
          }
          style={styles.iconButton}>
          {isFavorite ? (
            <StarSolidIcon size={22} color={STAR_COLOR} />
          ) : (
            <StarIcon size={22} strokeWidth={1.8} color={subTextColor} />
          )}
        </TouchableOpacity>
      );

      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={open}
          onLongPress={() => openCardActions(entry)}
          style={[
            styles.card,
            {backgroundColor: cardColor, borderColor, shadowColor},
          ]}>
          <View style={[styles.cardIcon, {backgroundColor: softFill}]}>
            <BookmarkIcon size={20} strokeWidth={2} color={iconColor} />
          </View>

          <View style={styles.cardBody}>
            {title ? (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.cardTitle, {color: textColor}]}>
                {highlight(title)}
              </Text>
            ) : null}
            {/* Every card shows two lines in total, so all cards are the
                same height however long the bookmark is; the rest is cut
                with "…" and can be read by opening the card. */}
            <Text
              numberOfLines={title ? 1 : 2}
              ellipsizeMode="tail"
              style={[
                styles.cardText,
                {color: title ? subTextColor : textColor},
              ]}>
              {highlight(body)}
            </Text>
          </View>

          {star}
          <TouchableOpacity
            onPress={() => confirmDelete(item)}
            hitSlop={styles.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Delete bookmark"
            style={styles.iconButton}>
            <TrashIcon size={21} strokeWidth={1.8} color={subTextColor} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [
      navigation,
      confirmDelete,
      openCardActions,
      toggleFavorite,
      favoriteSet,
      highlight,
      isSearching,
      terms,
      cardColor,
      borderColor,
      shadowColor,
      softFill,
      iconColor,
      textColor,
      subTextColor,
    ],
  );

  // Nothing saved yet: explain the feature and offer the one useful action.
  if (!hasBookmarks) {
    return (
      <View style={[styles.emptyScreen, {backgroundColor: appBackground}]}>
        <View style={[styles.emptyIcon, {backgroundColor: softFill}]}>
          <BookmarkIcon size={44} strokeWidth={1.6} color={iconColor} />
        </View>
        <Text style={[styles.emptyTitle, {color: textColor}]}>
          No bookmarks yet
        </Text>
        <Text style={[styles.emptyText, {color: subTextColor}]}>
          Save your favourite lines and notes here. Copy any text while
          reading, then tap the + button.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAddSheet}
          style={[styles.emptyButton, {backgroundColor: plusButtonBg}]}>
          <PlusIcon size={20} strokeWidth={2.4} color={plusButtonFg} />
          <Text style={[styles.emptyButtonText, {color: plusButtonFg}]}>
            Add bookmark
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = allEntries.length;
  const found = visibleEntries.length;

  // All / Favourites as two tabs across the top, the active one marked by
  // a line that slides under it (transform only, animated off the JS thread).
  const tab = (value: Filter, label: string, count: number) => {
    const active = filter === value;
    return (
      <Pressable
        key={value}
        onPress={() => setFilter(value)}
        accessibilityRole="tab"
        accessibilityState={{selected: active}}
        style={styles.tab}>
        <Text
          style={[
            styles.tabText,
            {color: active ? textColor : subTextColor},
          ]}>
          {label}
        </Text>
        <View
          style={[
            styles.tabCount,
            {backgroundColor: active ? plusButtonBg : softFill},
          ]}>
          <Text
            style={[
              styles.tabCountText,
              {color: active ? plusButtonFg : subTextColor},
            ]}>
            {count}
          </Text>
        </View>
      </Pressable>
    );
  };

  const menuSection = <T extends string>(
    title: string,
    options: {value: T; label: string}[],
    current: T,
    choose: (value: T) => void,
  ) => (
    <View>
      <Text style={[styles.menuTitle, {color: subTextColor}]}>{title}</Text>
      {options.map(option => (
        <Pressable
          key={option.value}
          onPress={() => {
            choose(option.value);
            setMenuOpen(false);
          }}
          android_ripple={{color: softFill}}
          style={styles.menuItem}>
          <Text style={[styles.menuItemText, {color: textColor}]}>
            {option.label}
          </Text>
          {current === option.value && (
            <CheckIcon size={18} strokeWidth={2.6} color={textColor} />
          )}
        </Pressable>
      ))}
    </View>
  );

  const emptyList = isSearching ? (
    <View style={styles.noResult}>
      <View style={[styles.noResultIcon, {backgroundColor: softFill}]}>
        <MagnifyingGlassIcon size={30} strokeWidth={1.8} color={iconColor} />
      </View>
      <Text style={[styles.noResultTitle, {color: textColor}]}>
        No match found
      </Text>
      <Text style={[styles.noResultText, {color: subTextColor}]}>
        Nothing matches “{oneLine(query)}”. Try a shorter word or check the
        spelling.
      </Text>
      <TouchableOpacity
        onPress={() => setQuery('')}
        activeOpacity={0.8}
        style={[styles.noResultButton, {borderColor: subTextColor}]}>
        <Text style={[styles.noResultButtonText, {color: textColor}]}>
          Clear search
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.noResult}>
      <View style={[styles.noResultIcon, {backgroundColor: softFill}]}>
        <StarIcon size={30} strokeWidth={1.8} color={iconColor} />
      </View>
      <Text style={[styles.noResultTitle, {color: textColor}]}>
        No favourites yet
      </Text>
      <Text style={[styles.noResultText, {color: subTextColor}]}>
        Tap the star on a bookmark to keep it here.
      </Text>
      <TouchableOpacity
        onPress={() => setFilter('all')}
        activeOpacity={0.8}
        style={[styles.noResultButton, {borderColor: subTextColor}]}>
        <Text style={[styles.noResultButtonText, {color: textColor}]}>
          Show all bookmarks
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.screen, {backgroundColor: appBackground}]}>
      {searchOpen && (
        <View style={[styles.searchHeader, {backgroundColor: appHeader}]}>
          <TouchableOpacity
            onPress={closeSearch}
            hitSlop={styles.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Close search"
            style={styles.searchHeaderButton}>
            <ArrowLeftIcon size={24} strokeWidth={2} color={iconColor} />
          </TouchableOpacity>
          <TextInput
            ref={searchRef}
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search bookmarks"
            placeholderTextColor={subTextColor}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor={textColor}
            style={[styles.searchHeaderInput, {color: textColor}]}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              hitSlop={styles.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={styles.searchHeaderButton}>
              <XMarkIcon size={22} strokeWidth={2} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View
        accessibilityRole="tablist"
        onLayout={event => setTabsWidth(event.nativeEvent.layout.width)}
        style={[styles.tabs, {borderBottomColor: borderColor}]}>
        {tab('all', 'All', total)}
        {tab('favorites', 'Favourites', favoriteCount)}
        {tabsWidth > 0 && (
          <Animated.View
            style={[
              styles.tabLine,
              {
                width: tabsWidth / 2 - TAB_LINE_INSET * 2,
                backgroundColor: textColor,
                transform: [
                  {
                    translateX: tabPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        TAB_LINE_INSET,
                        tabsWidth / 2 + TAB_LINE_INSET,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
      </View>

      {/* Tools that stay in reach while the list scrolls. */}
      <View style={styles.top}>

        {isSearching && (
          <Text style={[styles.resultCount, {color: subTextColor}]}>
            {found} {found === 1 ? 'result' : 'results'}
          </Text>
        )}
      </View>

      {viewMode === 'grid' ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {visibleEntries.length === 0 ? (
            emptyList
          ) : (
            <View style={styles.board}>
              <View style={styles.boardColumn}>
                {noteColumns[0].map(renderNote)}
              </View>
              <View style={styles.boardColumn}>
                {noteColumns[1].map(renderNote)}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={visibleEntries}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={emptyList}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openAddSheet}
        accessibilityRole="button"
        accessibilityLabel="Add bookmark"
        style={[styles.fab, {backgroundColor: plusButtonBg, shadowColor}]}>
        <PlusIcon size={30} strokeWidth={2.2} color={plusButtonFg} />
      </TouchableOpacity>

      {/* The header's menu: how the bookmarks are laid out and ordered. */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            // Taps inside the menu must not reach the backdrop.
            onPress={() => {}}
            style={[
              styles.menu,
              {backgroundColor: cardColor, borderColor, shadowColor},
            ]}>
            <View style={styles.menuViewRow}>
              {VIEW_OPTIONS.map(option => {
                const active = viewMode === option.value;
                const Icon =
                  option.value === 'grid' ? Squares2X2Icon : ListBulletIcon;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      chooseView(option.value);
                      setMenuOpen(false);
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{selected: active}}
                    style={[
                      styles.menuViewButton,
                      {
                        backgroundColor: active ? plusButtonBg : softFill,
                      },
                    ]}>
                    <Icon
                      size={19}
                      strokeWidth={2}
                      color={active ? plusButtonFg : iconColor}
                    />
                    <Text
                      style={[
                        styles.menuViewText,
                        {color: active ? plusButtonFg : textColor},
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.menuDivider, {backgroundColor: borderColor}]} />
            {menuSection('SORT BY', SORT_OPTIONS, sortMode, chooseSort)}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Bookmarked;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  top: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 4,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    // Room so the last card is never hidden behind the floating button.
    paddingBottom: 110,
  },
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: STATUS_BAR_HEIGHT,
    height: STATUS_BAR_HEIGHT + HEADER_HEIGHT,
    paddingHorizontal: 6,
  },
  searchHeaderButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchHeaderInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 0,
    marginLeft: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabCount: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabLine: {
    position: 'absolute',
    left: 0,
    bottom: -StyleSheet.hairlineWidth,
    height: 2.5,
    borderRadius: 1.25,
  },
  resultCount: {
    fontSize: 13,
    letterSpacing: 0.3,
    marginLeft: 4,
    marginBottom: 2,
  },
  highlight: {
    borderRadius: 3,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 6,
    marginTop: 10,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 4,
  },
  cardTitle: {
    fontFamily: 'kalpurush',
    fontSize: 20,
    lineHeight: 27,
  },
  cardText: {
    fontFamily: 'kalpurush',
    fontSize: 17,
    lineHeight: 24,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  board: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  boardColumn: {
    width: '48.3%',
  },
  note: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: 13,
    paddingHorizontal: 14,
    paddingBottom: 10,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  noteTitle: {
    fontFamily: 'kalpurush',
    fontSize: 19,
    lineHeight: 25,
    marginBottom: 3,
  },
  noteText: {
    fontFamily: 'kalpurush',
    fontSize: 16,
    lineHeight: 22,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 9,
  },

  noResult: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 48,
  },
  noResultIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultTitle: {
    fontFamily: 'MeriendaBold',
    fontSize: 18,
    marginBottom: 8,
  },
  noResultText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  noResultButton: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
  },
  noResultButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  menu: {
    position: 'absolute',
    // Just under the header's menu icon.
    top: (StatusBar.currentHeight ?? 44) + 50,
    right: 10,
    width: 236,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  menuViewRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  menuViewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  menuViewText: {
    fontSize: 14.5,
    fontWeight: '600',
    marginLeft: 7,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 6,
  },
  menuTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 46,
  },
  menuItemText: {
    fontSize: 15.5,
  },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },

  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  emptyTitle: {
    fontFamily: 'MeriendaBold',
    fontSize: 21,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15.5,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 26,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    height: 50,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontFamily: 'MeriendaBold',
    fontSize: 15,
    marginLeft: 8,
    // MeriendaBold sits low in its line box; lift it to centre on the icon.
    marginTop: -3,
  },
});
