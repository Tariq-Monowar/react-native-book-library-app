import {getBookInternalData} from '../database/HomeBookData';

// Opens one chapter directly (from "continue reading" or the history), with
// its book's chapter list behind it, so that going back lands in the book.
export const openChapter = (
  navigation: any,
  setRecevedBookName: (id: number) => void,
  bookId: number,
  chapterId: number,
) => {
  const chapters: any[] = getBookInternalData(bookId)?.data?.[1] ?? [];
  const chapter = chapters.find(item => item.id === chapterId);
  setRecevedBookName(bookId);
  navigation.navigate('chapterList');
  if (chapter) {
    navigation.navigate('chapter', {
      selector: chapter.selector,
      bookId,
      chapterId,
    });
  }
};
