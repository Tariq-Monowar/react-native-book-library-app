import {Platform, StatusBar} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';

// Where the screen header ends, measured from the top of the screen: the
// status bar plus the header's standard height on this platform (the same
// heights React Navigation draws its headers at). Bottom sheets open up to
// exactly this line, so on every phone they stop just under the header.
export const STATUS_BAR_HEIGHT =
  Platform.OS === 'android'
    ? StatusBar.currentHeight ?? 24
    : initialWindowMetrics?.insets.top ?? 20;

const headerHeight =
  Platform.OS === 'ios' ? (Platform.isPad ? 50 : 44) : 56;

export const HEADER_HEIGHT = headerHeight;
export const HEADER_BOTTOM = STATUS_BAR_HEIGHT + headerHeight;
