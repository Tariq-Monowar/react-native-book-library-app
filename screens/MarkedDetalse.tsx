import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {BoltIcon} from 'react-native-heroicons/outline';
import {UseAppContext} from '../context/AppContext';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import SheetInput from '../components/SheetInput';
import { useThemeColors } from '../context/ThemeContext';
 

const MarkedDetalse = ({route}: any) => {

  const {appBackground, textColor,  buttonColor, shadowColor,  shitBgColor, indicatorBgColor } = useThemeColors()
 

  const navigation = useNavigation();
  const {ctlBookeMarked, setCtlBookeMarked,  deleteTodo, getDBConnection} =
    UseAppContext();
  const {id, title, description} = route.params.data;
  console.log(id, title, description)

  const [titles, setTitle] = useState(title);
  const [descriptions, setDescription] = useState(description);

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Bookmarked?',
      'Are you sure you want to delete this Bookmarked?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            handleDeleteBookMarked();
            navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleDeleteBookMarked = async () => {
    const db = await getDBConnection();
    if(db) deleteTodo(db, id);

    // setReRanderMark(!reRanderMark);
  };

  useEffect(() => {
    if (ctlBookeMarked === 1) {
      setIsBottomSheetVisible(true);
    }
    if (ctlBookeMarked === 2) {
      console.log('delete');
      handleDelete();
    }
    setCtlBookeMarked(0);
  }, [ctlBookeMarked]);

  const handleTaskUpdate = (data: { title: string; description: string; }) => {
    setTitle(data.title);
    setDescription(data.description);
    setIsBottomSheetVisible(false)
  };

  return (
   <>
      <ScrollView style={{...styles.container, backgroundColor: appBackground}}>
        {title && (
          <Text selectable={true} style={{...styles.title, color: textColor}}>
            {titles}
          </Text>
        )}

        {description && (
          <Text selectable={true} style={{...styles.desc, color: textColor}}>
            {descriptions}
          </Text>
        )}
     </ScrollView>


      {isBottomSheetVisible && (
        <BottomSheet
          snapPoints={['100%']}
          enablePanDownToClose={true}
          onClose={() => {
            setCtlBookeMarked(0);
            setIsBottomSheetVisible(false);
          }}
          handleIndicatorStyle={{
            backgroundColor: indicatorBgColor,
            width: 100,
          }}
          backgroundStyle={{backgroundColor: shitBgColor}}>
          <BottomSheetScrollView>
           
            <SheetInput
              onData={{titles, descriptions, id}}
              onTaskUpdate={handleTaskUpdate}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      )}
      
 </>
  );
};

export default MarkedDetalse;

const styles = StyleSheet.create({
  safeArea: {
    
  },
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
    flex: 1,
   
  },
  title: {
    color: '#0a1930',
    fontSize: 27,
    fontFamily: 'kalpurush',
    marginBottom: 10,
    textAlign: 'left',
  },
  desc: {
    color: '#0a1930',
    fontSize: 22,
    fontFamily: 'kalpurush',
    textAlign: 'justify',
  },
});
