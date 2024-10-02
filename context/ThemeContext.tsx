
export {useColorScheme} from 'react-native';

import {useColorScheme} from 'react-native';
import {UseAppContext} from './AppContext';

export const useThemeColors = () => {
  const {overTheme} = UseAppContext();
  const theme = overTheme ? overTheme : useColorScheme();

  console.log(7, theme);
  return {
    appBackground: theme === 'light' ? '#f9fafc' : '#303030',
    appHeader: theme === 'light' ? '#f6f8fa' : '#2D2D2D',
    buttonColor: theme === 'light' ? '#f9fafc' : '#373737',
    textColor: theme === 'light' ? '#0a1930' : '#e1e1e1',
    iconColor: theme === 'light' ? '#4e4f53' : '#e1e1e1',
    shadowColor: theme === 'light' ? '#354158' : '#000',
    plusButtonBg: theme === 'light' ? '#263147' : '#e1e1e1',
    plusButtonFg: theme === 'light' ? '#fff' : '#0a1930',

    shitBgColor: theme === 'light' ? '#fff' : '#2b2b2b',
    indicatorBgColor: theme === 'light' ? '#0a1930' : '#e1e1e1',
    TextInputBorderColor: theme === 'light' ? '#475468' : '#e1e1e1',
    submitButtonTetx: theme === 'light' ? '#fff' : '#0a1930',
    submitButtonColor: theme === 'light' ? '#475468' : '#d6d6d6',
  
  };
};
