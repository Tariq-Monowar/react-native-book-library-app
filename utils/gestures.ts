import {createRef} from 'react';

// The bookshelf on the home screen scrolls sideways, and the side menu also
// opens with a sideways swipe. The menu's swipe waits for this list's own
// scrolling (see `gestureHandlerProps` in AppNavigation), so a swipe that
// starts on the shelf scrolls the books and a swipe anywhere else opens the
// menu.
export const shelfScrollRef = createRef<any>();
