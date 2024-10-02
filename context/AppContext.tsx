import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';


import { booksInternalData } from '../database/HomeBookData'; // Adjust the import path
import { AppContextType, Book, Bookmark, Task } from '../interface/Interface';
import { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { getLocalData, storeLocalData } from '../utils/asyncstorage';

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
  toggleTheme: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContextValue);

export const UseAppContext = () => useContext(AppContext);

interface AppContextProviderProps {
  children: ReactNode;
}

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
      if (savedTheme) {
        setOverTheme(savedTheme);
        setIsDarkMode(savedTheme === 'dark');
      }
    };
    fetchTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = overTheme === 'light' ? 'dark' : 'light';
    setOverTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
    await storeLocalData('theme', newTheme); // Store new theme in local storage
  };





  const findBookById = (id: number): any => {
    return booksInternalData.find(book => book.id === id);
  };
  
  const handleSetRecevedBookName = (id: number) => {
    const book = findBookById(id);
    setRecevedBookName(book ?? null);
    setBookChapter(book ?? null);
  };

  // SQLite Database handling
  const getDBConnection = async (): Promise<SQLiteDatabase> => {
    return openDatabase({ name: 'bookmarked.db', location: 'default' });
  };

  const createTable = async (db: SQLiteDatabase): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL);',
        [],
        () => {
          console.log('Table created successfully');
        },
        (error) => {
          console.log('Error creating table', error);
        }
      );
    });
  };

  const createTodo = async (db: SQLiteDatabase, title: string, description: string): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO todos (title, description) VALUES (?, ?);',
        [title, description],
        (tx, result) => {
          console.log('Task added:', title);
          fetchTodos(db); // Re-fetch todos after insert
        },
        (error) => {
          console.log('Error adding task', error);
        }
      );
    });
  };

  const updateTodo = async (db: SQLiteDatabase, id: number, title: string, description: string): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE todos SET title = ?, description = ? WHERE id = ?;',
        [title, description, id],
        (tx, result) => {
          console.log('Task updated with id:', id);
          fetchTodos(db); // Re-fetch todos after update
        },
        (error) => {
          console.log('Error updating task', error);
        }
      );
    });
  };

  const deleteTodo = async (db: SQLiteDatabase, id: number): Promise<void> => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM todos WHERE id = ?;',
        [id],
        (tx, result) => {
          console.log('Task deleted with id:', id);
          fetchTodos(db); // Re-fetch todos after delete
        },
        (error) => {
          console.log('Error deleting task', error);
        }
      );
    });
  };

  const fetchTodos = async (db: SQLiteDatabase): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM todos;',
          [],
          (tx, results) => {
            const rows = results.rows;
            let tasks: Task[] = [];
            for (let i = 0; i < rows.length; i++) {
              tasks.push({
                id: rows.item(i).id,
                title: rows.item(i).title,
                description: rows.item(i).description,
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
  };

  useEffect(() => {
    const loadData = async () => {
      const db = await getDBConnection();
      await createTable(db);
      await fetchTodos(db);
    };
    loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
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
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
