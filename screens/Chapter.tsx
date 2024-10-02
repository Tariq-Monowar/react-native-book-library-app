
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useRoute, RouteProp} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {PlusIcon} from 'react-native-heroicons/outline';
import { UseAppContext } from '../context/AppContext';
import { useThemeColors } from '../context/ThemeContext';

// Define the type for the route parameters
type ChapterRouteParams = {
  description: {
    title: string;
    desc: string;
  }[];
};


const Chapter = () => {
  const {setIsBottomSheetVisible} = UseAppContext();
  const [clipboardContent, setClipboardContent] = useState('');
  const [shouldRender, setshouldRender] = useState(false);
  const [visibleBookmark, setVisibleBookmark] = useState(false);

  const {appBackground, textColor,  plusButtonBg, plusButtonFg} = useThemeColors()

  const route = useRoute<RouteProp<{params: ChapterRouteParams}, 'params'>>();
  const {description} = route.params;

  useEffect(() => {
    if (visibleBookmark) {
      setTimeout(() => {
        setVisibleBookmark(false);
      }, 7000);
    }
  }, [visibleBookmark]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const content = await Clipboard?.getString();
      if (content && content !== clipboardContent) {
        setClipboardContent(content);
        {
          shouldRender && setVisibleBookmark(true)
        }
      }
    }, 1000);
    setshouldRender(true);
    return () => clearInterval(interval);
  }, [clipboardContent]);

  return (
    <>
      <ScrollView  style={{...styles.container, backgroundColor: appBackground}}>
        <View style={{marginTop: 5}}>
          {description?.map((data, index) => {
            return (
              <React.Fragment key={index}>
                {data?.title && (
                  <Text style={{...styles.title, color: textColor}} selectable={true}>
                    {data?.title}
                  </Text>
                )}
                <Text selectable={true} style={{...styles.text, color: textColor}}>
                  {data?.desc}
                </Text>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
      {visibleBookmark && (
        <TouchableOpacity onPress={()=>setIsBottomSheetVisible(true)} style={{...styles.addBookmarked, backgroundColor: plusButtonBg}}>
          <PlusIcon size={32} strokeWidth={2} color={plusButtonFg} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default Chapter;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    height: '100%',
    backgroundColor: '#f9fafc',
  },
  title: {
    fontFamily: 'kalpurush',
    color: '#0a1930',
    fontSize: 27,
    marginTop: 10,
  },
  text: {
    fontSize: 22,
    marginVertical: 10,
    fontFamily: 'kalpurush',
    color: '#0a1930',
  },
  addBookmarked: {
    width: 60,
    height: 60,
    position: 'absolute',
    zIndex: 10,
    bottom: 25,
    right: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#263147',
    elevation: 3,
  },
});
