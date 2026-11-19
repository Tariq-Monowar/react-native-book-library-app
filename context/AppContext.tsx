import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  PixelRatio,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {captureRef} from 'react-native-view-shot';


import { getBookInternalData } from '../database/HomeBookData';
import {
  AppContextType,
  Book,
  Bookmark,
  Task,
  ThemeMode,
} from '../interface/Interface';
import { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { getLocalData, storeLocalData } from '../utils/asyncstorage';
import { syncLaunchTheme } from '../utils/themeBridge';

const defaultContextValue: AppContextType = {
  data: 'hi',
  recevedBookName: null,
  setRecevedBookName: () => {},
  bookChapter: null,
  isBottomSheetVisible: false,
  setIsBottomSheetVisible: () => {},
  bookmarked: [],
  setBookmarked: () => {},

  reRanderMark: false,
  setReRanderMark: () => {},

  ctlBookeMarked: 0,
  setCtlBookeMarked: () => {},

  getDBConnection: async () => null,
  createTable: async () => {},
  createTodo: async () => {},
  updateTodo: async () => {},
  deleteTodo: async () => {},
  fetchTodos: async () => [],
  todos: [],
  overTheme: '', 
  setOverTheme: () => {},
  isDarkMode: false, 
  setIsDarkMode: () => {},
  toggleTheme: () => false,
  setThemeMode: () => false,
};

export const AppContext = createContext<AppContextType>(defaultContextValue);

export const UseAppContext = () => useContext(AppContext);

interface AppContextProviderProps {
  children: ReactNode;
}

const THEME_REVEAL_MS = 680;
// The picture of the old theme shown during the wipe is taken at the
// screen's own pixel density (up to 3x), so it is exactly as sharp as the
// real screen. A smaller picture made text look blurred during the change.
const SNAPSHOT_MAX_SCALE = 3;

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [recevedBookName, setRecevedBookName] = useState<Book | null>(null);
  const [bookChapter, setBookChapter] = useState<Book | null>(null);
  const [bookmarked, setBookmarked] = useState<Bookmark[]>([]);
  const [reRanderMark, setReRanderMark] = useState<boolean>(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState<boolean>(false);
  const [ctlBookeMarked, setCtlBookeMarked] = useState<number>(0);
  const [todos, setTodos] = useState<Task[]>([]); // Type for todos array

  //theem
  const [overTheme, setOverTheme] = useState<string>(''); // Default theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const savedTheme = await getLocalData('theme');
      // Keeps the launch screen in step with a choice saved before this
      // existed.
      syncLaunchTheme(savedTheme || '');
      if (savedTheme) {
        setOverTheme(savedTheme);
        setIsDarkMode(savedTheme === 'dark');
      }
    };
    fetchTheme();
  }, []);

  // Until the reader picks a theme the app follows the phone's setting, so
  // the Dark Mode switch has to reflect that too.
  const systemTheme = useColorScheme();
  useEffect(() => {
    if (!overTheme) {
      setIsDarkMode(systemTheme === 'dark');
    }
  }, [overTheme, systemTheme]);

  // Theme change animation (circular reveal).
  //
  // A picture of the screen in the old theme is laid over the app, the
  // colours are swapped underneath it, and the picture is then wiped away
  // through a round window that shrinks into a corner:
  //  - to dark, into the top-right corner, so dark rises from the bottom;
  //  - to light, into the bottom-left corner, so light comes down from the top.
  //
  // The window is always mounted at full size and simply empty while idle.
  // That way the picture covers the screen the moment it is mounted, with
  // nothing to wait for, and the delay between the tap and the wipe is only
  // the time to take the picture and repaint. The wipe runs on the UI thread.
  const rootRef = useRef<View>(null);
  const themeChanging = useRef(false);
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const pendingTheme = useRef<string | null>(null);
  const [rootSize, setRootSize] = useState<{width: number; height: number}>(
    () => {
      const {width, height} = Dimensions.get('window');
      return {width, height};
    },
  );
  // Far enough to reach from one corner of the screen to the opposite one.
  const fullRadius = Math.hypot(rootSize.width, rootSize.height);
  const revealRadius = useSharedValue(fullRadius);
  // 1 while the wipe itself is moving.
  const revealRunning = useSharedValue(0);
  const revealX = useSharedValue(0);
  // The same corner, for laying out the circle (set once per change).
  const [revealCorner, setRevealCorner] = useState({x: 0, y: 0});
  const revealY = useSharedValue(0);

  const onRootLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setRootSize(size =>
      size.width === width && size.height === height ? size : {width, height},
    );
  }, []);

  // `mode` is 'light', 'dark', or '' to follow the phone's setting.
  const applyTheme = useCallback(
    (mode: string) => {
      setOverTheme(mode);
      setIsDarkMode((mode || systemTheme) === 'dark');
      storeLocalData('theme', mode); // Store the choice in local storage
      syncLaunchTheme(mode);
    },
    [systemTheme],
  );

  // While idle (no picture mounted) keep the empty window at full size,
  // ready for the next change.
  useEffect(() => {
    if (snapshotUri === null) {
      revealRadius.value = fullRadius;
      themeChanging.current = false;
    }
  }, [snapshotUri, fullRadius, revealRadius]);

  const finishThemeChange = useCallback(() => {
    setSnapshotUri(null);
  }, []);

  // Step 1: take the picture of the old theme and mount it.
  // Returns false when a change is already running and the tap was ignored.
  // Sets the theme: 'light', 'dark', or 'system' (follow the phone).
  // Returns false when a change is already running and the call was ignored.
  const setThemeMode = useCallback(
    (choice: ThemeMode) => {
      if (themeChanging.current) {
        return false;
      }
      const mode = choice === 'system' ? '' : choice;
      const shownNow = overTheme || systemTheme || 'light';
      const shownNext = mode || systemTheme || 'light';
      if (shownNext === shownNow) {
        // Nothing on screen changes (e.g. picking "System" while the phone
        // is already in the same mode): just remember the choice.
        applyTheme(mode);
        return true;
      }
      themeChanging.current = true;

      // The corner the old picture shrinks into.
      revealX.value = shownNext === 'dark' ? rootSize.width : 0;
      revealY.value = shownNext === 'dark' ? 0 : rootSize.height;
      setRevealCorner({
        x: shownNext === 'dark' ? rootSize.width : 0,
        y: shownNext === 'dark' ? 0 : rootSize.height,
      });

      // Full screen resolution, so the picture matches the screen pixel for
      // pixel and nothing looks blurred while it is on display.
      const scale = Math.min(PixelRatio.get(), SNAPSHOT_MAX_SCALE);
      captureRef(rootRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
        width: Math.round(rootSize.width * scale),
        height: Math.round(rootSize.height * scale),
      })
        .then(uri => {
          pendingTheme.current = mode;
          // Continues in onSnapshotShown, once the picture has loaded.
          setSnapshotUri(uri);
        })
        .catch(() => {
          // No picture, no animation: change the theme directly.
          applyTheme(mode);
          themeChanging.current = false;
        });
      return true;
    },
    [overTheme, systemTheme, rootSize, applyTheme, revealX, revealY],
  );

  const toggleTheme = useCallback(
    () =>
      setThemeMode((overTheme || systemTheme) === 'dark' ? 'light' : 'dark'),
    [overTheme, systemTheme, setThemeMode],
  );

  // Step 2, once the picture covers the screen: swap the colours under it.
  const awaitingRepaint = useRef(false);
  const onSnapshotShown = useCallback(() => {
    const newTheme = pendingTheme.current;
    // '' (follow the phone) is a real choice, so test for null only.
    if (newTheme === null) {
      return;
    }
    pendingTheme.current = null;
    // One frame so the picture is on screen before anything under it moves.
    requestAnimationFrame(() => {
      awaitingRepaint.current = true;
      applyTheme(newTheme);
    });
  }, [applyTheme]);

  // Step 3, after React has committed the new colours: wipe the picture
  // away. The frame of waiting lets the native views repaint first.
  useEffect(() => {
    if (!awaitingRepaint.current) {
      return;
    }
    awaitingRepaint.current = false;
    requestAnimationFrame(() => {
      revealRunning.value = 1;
      revealRadius.value = withTiming(
        0,
        // Starts gently, sweeps, and settles: a wipe with some weight to it.
        {duration: THEME_REVEAL_MS, easing: Easing.bezier(0.65, 0, 0.35, 1)},
        () => {
          revealRunning.value = 0;
          runOnJS(finishThemeChange)();
        },
      );
    });
  }, [overTheme, finishThemeChange, revealRadius, revealRunning]);

  // The round window: a circle of fixed size, centred on the corner it
  // shrinks into, made smaller with a scale transform. Only transforms
  // change from frame to frame (no layout, no re-measuring), so the phone
  // can draw the wipe smoothly even on slower devices.
  const MIN_SCALE = 0.0005;
  const pictureWindowStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: Math.max(MIN_SCALE, revealRadius.value / fullRadius)},
    ],
  }));
  // The picture inside is scaled the opposite way around the same centre, so
  // it stays still on the screen while the circle closes over it.
  const pictureStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: 1 / Math.max(MIN_SCALE, revealRadius.value / fullRadius)},
    ],
  }));

  // Loads the book's text on demand (see getBookInternalData).
  const handleSetRecevedBookName = useCallback((id: number) => {
    const book: any = getBookInternalData(id);
    setRecevedBookName(book ?? null);
    setBookChapter(book ?? null);
  }, []);

  // SQLite Database handling
  const getDBConnection = useCallback(async (): Promise<SQLiteDatabase> => {
    return openDatabase({ name: 'bookmarked.db', location: 'default' });
  }, []);

  const createTable = useCallback(async (db: SQLiteDatabase): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL);',
        [],
        undefined,
        (error) => {
          console.log('Error creating table', error);
        }
      );
    });
  }, []);

  const fetchTodos = useCallback(async (db: SQLiteDatabase): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM todos;',
          [],
          (_tx, results) => {
            const rows = results.rows;
            let tasks: Task[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              tasks.push({
                id: row.id,
                title: row.title,
                description: row.description,
              });
            }
            setTodos(tasks); // Update state with latest todos
            resolve(tasks);
          },
          (error) => {
            console.log('Error fetching tasks', error);
            reject(error);
          }
        );
      });
    });
  }, []);

  const createTodo = useCallback(async (db: SQLiteDatabase, title: string, description: string): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO todos (title, description) VALUES (?, ?);',
        [title, description],
        () => {
          fetchTodos(db); // Re-fetch todos after insert
        },
        (error) => {
          console.log('Error adding task', error);
        }
      );
    });
  }, [fetchTodos]);

  const updateTodo = useCallback(async (db: SQLiteDatabase, id: number, title: string, description: string): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE todos SET title = ?, description = ? WHERE id = ?;',
        [title, description, id],
        () => {
          fetchTodos(db); // Re-fetch todos after update
        },
        (error) => {
          console.log('Error updating task', error);
        }
      );
    });
  }, [fetchTodos]);

  const deleteTodo = useCallback(async (db: SQLiteDatabase, id: number): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM todos WHERE id = ?;',
        [id],
        () => {
          fetchTodos(db); // Re-fetch todos after delete
        },
        (error) => {
          console.log('Error deleting task', error);
        }
      );
    });
  }, [fetchTodos]);

  useEffect(() => {
    const loadData = async () => {
      const db = await getDBConnection();
      await createTable(db);
      await fetchTodos(db);
    };
    loadData();
  }, [getDBConnection, createTable, fetchTodos]);

  // Memoised so screens re-render only when a value they could read changed,
  // not on every provider render.
  const value = useMemo<AppContextType>(
    () => ({
      data: 'hi',
      recevedBookName,
      setRecevedBookName: handleSetRecevedBookName,
      bookChapter,
      isBottomSheetVisible,
      setIsBottomSheetVisible,
      bookmarked,
      setBookmarked,
      reRanderMark,
      setReRanderMark,
      ctlBookeMarked,
      setCtlBookeMarked,
      // SQLite functions
      getDBConnection,
      createTable,
      createTodo,
      updateTodo,
      deleteTodo,
      fetchTodos,
      todos,

      overTheme,
      setOverTheme,
      isDarkMode,
      setIsDarkMode,
      toggleTheme,
      setThemeMode,
    }),
    [
      recevedBookName,
      handleSetRecevedBookName,
      bookChapter,
      isBottomSheetVisible,
      bookmarked,
      reRanderMark,
      ctlBookeMarked,
      getDBConnection,
      createTable,
      createTodo,
      updateTodo,
      deleteTodo,
      fetchTodos,
      todos,
      overTheme,
      isDarkMode,
      toggleTheme,
      setThemeMode,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      <View style={styles.fill} onLayout={onRootLayout}>
        {/* collapsable={false} keeps this a real native view, which the
            screen picture is taken from. */}
        <View ref={rootRef} collapsable={false} style={styles.fill}>
          {children}
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.revealWindow,
            {
              left: revealCorner.x - fullRadius,
              top: revealCorner.y - fullRadius,
              width: fullRadius * 2,
              height: fullRadius * 2,
              borderRadius: fullRadius,
            },
            pictureWindowStyle,
          ]}>
          <Animated.View
            style={[
              styles.revealContent,
              {
                left: fullRadius - revealCorner.x,
                top: fullRadius - revealCorner.y,
                width: rootSize.width,
                height: rootSize.height,
                // Scale around the circle's centre, which is the corner.
                transformOrigin: [revealCorner.x, revealCorner.y, 0],
              },
              pictureStyle,
            ]}>
            {snapshotUri && (
              <Image
                source={{uri: snapshotUri}}
                onLoad={onSnapshotShown}
                onError={onSnapshotShown}
                fadeDuration={0}
                style={styles.fill}
              />
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </AppContext.Provider>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  revealWindow: {
    position: 'absolute',
    overflow: 'hidden',
  },
  revealContent: {
    position: 'absolute',
  },
});
