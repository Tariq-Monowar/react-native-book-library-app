import {useSyncExternalStore} from 'react';
import {getLocalData, storeLocalData} from './asyncstorage';

// The reader's history: for every chapter they have opened, how far they
// got, whether it is finished, and when they were last there. One small
// store shared by every screen. A change shows on all screens at once
// (nothing waits for the disk), and is written to storage shortly after.

// v3: progress is counted in text blocks. Records from v2 measured it by
// scroll height and were wrong, so they are not carried over.
const READING_KEY = 'reading_history_v3';
const SAVE_DELAY_MS = 600;

export type ChapterRecord = {
  bookId: number;
  chapterId: number;
  // The chapter's name as shown in the chapter list.
  selector: string;
  // Furthest point reached, 0 to 1.
  percent: number;
  // Where the reader currently is (index of the text block at the top of
  // the screen), used to reopen the chapter at the same place.
  blockIndex: number;
  // How far down inside that block the top of the screen was, in pixels,
  // so the chapter reopens at exactly the same line.
  innerOffset?: number;
  done: boolean;
  // The first words of the text at the reader's current place, shown as a
  // reminder of where they stopped.
  snippet?: string;
  // Length of the whole chapter in characters, for "about N minutes left".
  chars?: number;
  // When it was last opened (ms). 0 means "not in the history list": the
  // chapter was only marked by hand, or was removed from the list.
  visitedAt: number;
};

export type ReadingState = {
  chapters: {[key: string]: ChapterRecord};
};

const EMPTY: ReadingState = {chapters: {}};

export const chapterKey = (bookId: number, chapterId: number) =>
  `${bookId}:${chapterId}`;

let state: ReadingState = EMPTY;
let loaded = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(listener => listener());

const scheduleSave = () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    storeLocalData(READING_KEY, JSON.stringify(state));
  }, SAVE_DELAY_MS);
};

const setState = (next: ReadingState) => {
  state = next;
  emit();
  scheduleSave();
};

const load = async () => {
  if (loaded) {
    return;
  }
  loaded = true;
  const saved = await getLocalData(READING_KEY);
  if (!saved) {
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    if (parsed?.chapters && typeof parsed.chapters === 'object') {
      // Anything recorded before the load finished wins over the saved copy.
      state = {chapters: {...parsed.chapters, ...state.chapters}};
      emit();
    }
  } catch (error) {
    // Unreadable record: start fresh rather than fail.
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

// Screens call this to read the history and re-render when it changes.
export const useReading = (): ReadingState =>
  useSyncExternalStore(subscribe, getSnapshot);

const update = (
  bookId: number,
  chapterId: number,
  selector: string,
  change: (record: ChapterRecord) => ChapterRecord,
) => {
  const key = chapterKey(bookId, chapterId);
  const current: ChapterRecord = state.chapters[key] ?? {
    bookId,
    chapterId,
    selector,
    percent: 0,
    blockIndex: 0,
    done: false,
    visitedAt: 0,
  };
  const next = change({...current, selector: selector || current.selector});
  setState({chapters: {...state.chapters, [key]: next}});
};

// The reader opened a chapter.
export const visitChapter = (
  bookId: number,
  chapterId: number,
  selector: string,
) => update(bookId, chapterId, selector, record => ({
    ...record,
    visitedAt: Date.now(),
  }));

// The reader scrolled. `percent` only ever grows (it is the furthest point
// reached); `blockIndex` follows where they are now. Reaching the end marks
// the chapter finished.
export const saveProgress = (
  bookId: number,
  chapterId: number,
  percent: number,
  blockIndex: number,
  place?: {snippet: string; chars: number; innerOffset?: number},
) => {
  const record = state.chapters[chapterKey(bookId, chapterId)];
  if (!record) {
    return;
  }
  const furthest = Math.max(record.percent, Math.min(1, percent));
  const done = record.done || furthest >= 1;
  const snippet = place?.snippet ?? record.snippet;
  const chars = place?.chars ?? record.chars;
  const innerOffset = place?.innerOffset ?? record.innerOffset;
  if (
    innerOffset === record.innerOffset &&
    furthest === record.percent &&
    blockIndex === record.blockIndex &&
    done === record.done &&
    snippet === record.snippet &&
    chars === record.chars
  ) {
    return;
  }
  update(bookId, chapterId, record.selector, current => ({
    ...current,
    percent: furthest,
    blockIndex,
    done,
    snippet,
    chars,
    innerOffset,
  }));
};

// The reader marked a chapter finished or not finished by hand.
export const setChapterDone = (
  bookId: number,
  chapterId: number,
  selector: string,
  done: boolean,
) =>
  update(bookId, chapterId, selector, record => ({
    ...record,
    done,
    // Un-finishing starts the chapter over; finishing fills the bar.
    percent: done ? 1 : 0,
    blockIndex: done ? record.blockIndex : 0,
    innerOffset: done ? record.innerOffset : 0,
  }));

// Takes one chapter out of the history list. What was finished stays
// finished: the list is about where the reader has been, not what is done.
export const removeFromHistory = (bookId: number, chapterId: number) => {
  const key = chapterKey(bookId, chapterId);
  const record = state.chapters[key];
  if (!record) {
    return;
  }
  setState({chapters: {...state.chapters, [key]: {...record, visitedAt: 0}}});
};

export const clearHistory = () => {
  const chapters: ReadingState['chapters'] = {};
  for (const key of Object.keys(state.chapters)) {
    chapters[key] = {...state.chapters[key], visitedAt: 0};
  }
  setState({chapters});
};

export const getRecord = (
  reading: ReadingState,
  bookId: number,
  chapterId: number,
): ChapterRecord | undefined => reading.chapters[chapterKey(bookId, chapterId)];

// Chapters of one book that are finished.
export const doneCount = (reading: ReadingState, bookId: number) => {
  let count = 0;
  for (const key of Object.keys(reading.chapters)) {
    const record = reading.chapters[key];
    if (record.bookId === bookId && record.done) {
      count += 1;
    }
  }
  return count;
};

// Visited chapters, most recent first.
export const historyList = (reading: ReadingState): ChapterRecord[] =>
  Object.values(reading.chapters)
    .filter(record => record.visitedAt > 0)
    .sort((a, b) => b.visitedAt - a.visitedAt);

export const lastRead = (reading: ReadingState): ChapterRecord | null =>
  historyList(reading)[0] ?? null;

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';

export const toBengaliNumber = (value: number) =>
  String(value).replace(/\d/g, digit => BENGALI_DIGITS[Number(digit)]);

export const percentLabel = (percent: number) =>
  `${toBengaliNumber(Math.round(percent * 100))}%`;

// A comfortable reading pace for Bengali prose, in characters per minute.
// Only used for a rough "about N minutes left".
const READING_CHARS_PER_MINUTE = 900;

// Minutes of reading left in a chapter, or null when it cannot be told.
export const minutesLeft = (record: ChapterRecord): number | null => {
  if (!record.chars || record.done) {
    return null;
  }
  const remaining = record.chars * (1 - record.percent);
  return Math.max(1, Math.round(remaining / READING_CHARS_PER_MINUTE));
};

// "5 minutes ago", in Bengali.
export const timeAgo = (timestamp: number, now: number = Date.now()) => {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) {
    return 'এইমাত্র';
  }
  if (minutes < 60) {
    return `${toBengaliNumber(minutes)} মিনিট আগে`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${toBengaliNumber(hours)} ঘণ্টা আগে`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'গতকাল';
  }
  return `${toBengaliNumber(days)} দিন আগে`;
};
