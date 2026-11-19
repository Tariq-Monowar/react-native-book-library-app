export {useColorScheme} from 'react-native';

import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {UseAppContext} from './AppContext';

// Dark theme: the app's original soft charcoal greys, a shade darker.
const buildColors = (theme: string | null | undefined) => ({
  isDark: theme !== 'light',

  appBackground: theme === 'light' ? '#f9fafc' : '#2a2a2a',
  appHeader: theme === 'light' ? '#f6f8fa' : '#272727',
  buttonColor: theme === 'light' ? '#f9fafc' : '#313131',
  textColor: theme === 'light' ? '#0a1930' : '#e1e1e1',
  iconColor: theme === 'light' ? '#4e4f53' : '#e1e1e1',
  shadowColor: theme === 'light' ? '#354158' : '#000',
  plusButtonBg: theme === 'light' ? '#263147' : '#e1e1e1',
  plusButtonFg: theme === 'light' ? '#fff' : '#0a1930',

  shitBgColor: theme === 'light' ? '#fff' : '#252525',
  indicatorBgColor: theme === 'light' ? '#0a1930' : '#e1e1e1',
  TextInputBorderColor: theme === 'light' ? '#475468' : '#e1e1e1',
  submitButtonTetx: theme === 'light' ? '#fff' : '#0a1930',
  submitButtonColor: theme === 'light' ? '#475468' : '#d6d6d6',

  // Secondary text, hairline borders and soft fills (cards, search, badges).
  subTextColor: theme === 'light' ? '#5b6577' : '#a8a8a8',
  borderColor: theme === 'light' ? '#e4e8ef' : '#3f3f3f',
  softFill: theme === 'light' ? '#eceff5' : '#383838',
  cardColor: theme === 'light' ? '#ffffff' : '#323232',
  // Background behind the part of a bookmark that matches the search.
  highlightColor: theme === 'light' ? '#ffe08a' : '#7a6420',
});

export const useThemeColors = () => {
  const {overTheme} = UseAppContext();
  // Hooks must run on every render, so read the system scheme unconditionally.
  const systemTheme = useColorScheme();
  // The reader's own choice if they made one, otherwise the phone's setting
  // (light when the phone does not report one).
  const theme = overTheme || systemTheme || 'light';

  return useMemo(() => buildColors(theme), [theme]);
};
