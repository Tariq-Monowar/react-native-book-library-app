import { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

// Define type for Task (representing a book entry)
export type Task = {
  id: number;
  title: string;
  description: string;
};

// Get database connection
export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return openDatabase({ name: 'bookmarked.db', location: 'default' });
};

// Create a table if it doesn't exist
export const createTable = async (db: SQLiteDatabase): Promise<void> => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL
      );`
    );
  });
};

// Insert a new book entry into the todos table

export const createTodo = async (db: SQLiteDatabase, title: string, description: string): Promise<void> => {
 let aaa=  db.transaction((tx) => {
    tx.executeSql('INSERT INTO todos (title, description) VALUES (?, ?);', [title, description]);
  });
  console.log(aaa, db, title, description)
};


// Delete a book entry from the todos table
export const deleteTodo = async (db: SQLiteDatabase, id: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'DELETE FROM todos WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    );
  });
};


// Update an existing todo entry in the todos table
export const updateTodo = async (
  db: SQLiteDatabase,
  id: number,
  title: string,
  description: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE todos SET title = ?, description = ? WHERE id = ?;',
          [title, description, id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    );
  });
};


// Fetch all book entries from the todos table
export const getTodos = async (db: SQLiteDatabase): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM todos;',
          [],
          (_, results) => {
            const tasks: Task[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              tasks.push(results.rows.item(i));
            }
            resolve(tasks.reverse());
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};
