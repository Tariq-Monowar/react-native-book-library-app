import { ReactNode, Dispatch, SetStateAction } from 'react';
import { SQLiteDatabase } from 'react-native-sqlite-storage';

export interface Book {
  id: number;
  name: string;
  image: any; // Replace with appropriate type for image
  backgroundColor: string;
  [x: string]: ReactNode;
}

export interface Bookmark {
  id?: number; 
  title?: string; 
  description?: string; 
}

export interface Task {
  id: number;
  title: string;
  description: string;
}

export interface AppContextType {
  data: string;
  recevedBookName: Book | null;
  setRecevedBookName: (id: number) => void;
  bookChapter: Book | any;
  isBottomSheetVisible: boolean;
  setIsBottomSheetVisible: Dispatch<SetStateAction<boolean>>;
  bookmarked: Bookmark[];  
  setBookmarked: Dispatch<SetStateAction<Bookmark[]>>;

  reRanderMark: boolean;  
  setReRanderMark: (value: boolean) => void;

  ctlBookeMarked: number; 
  setCtlBookeMarked: (value: number) => void;

  // SQLite-related functions
  getDBConnection: () => Promise<SQLiteDatabase | null>;
  createTable: (db: SQLiteDatabase) => Promise<void>;
  createTodo: (db: SQLiteDatabase, title: string, description: string) => Promise<void>;
  updateTodo: (db: SQLiteDatabase, id: number, title: string, description: string) => Promise<void>;
  deleteTodo: (db: SQLiteDatabase, id: number) => Promise<void>;
  fetchTodos: (db: SQLiteDatabase) => Promise<Task[]>;
  todos: any,

  overTheme: string, 
  setOverTheme: (value: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  toggleTheme: () => void;
}
