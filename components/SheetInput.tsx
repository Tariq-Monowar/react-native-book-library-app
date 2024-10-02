import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';

import {UseAppContext} from '../context/AppContext';
import { useThemeColors } from '../context/ThemeContext';


const SheetInput:  React.FC<any> = ({ onData, onTaskUpdate }) => {
  // console.log(onData.titles)
  const {getDBConnection, createTodo, setIsBottomSheetVisible, updateTodo} =
  UseAppContext();
  const {appBackground,  submitButtonColor, textColor,  submitButtonTetx, TextInputBorderColor} = useThemeColors()
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [postDescHeight, setPostDescHeight] = useState<number>(100);

  const handleTextChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const newHeight = Math.max(100, event.nativeEvent.contentSize.height);
    setPostDescHeight(newHeight);
  };


 
  const handleAddTask = async () => {
    if (description.trim() === '') return;

    const db = await getDBConnection();
    if (db) {  // Null check for db
      await createTodo(db, title, description);
      setIsBottomSheetVisible(false);
      setTitle('');
      setDescription('');
    } else {
      console.error('Database connection failed');
    }
  };

  const handleUpdateTask = async () => {
    const db = await getDBConnection();
    if (db) {  // Null check for db
      await updateTodo(db, onData.id, title, description);
      onTaskUpdate({title, description});
    } else {
      console.error('Database connection failed');
    }
  };

  useEffect(() => {
    if(onData){
      setTitle(onData.titles)
      setDescription(onData.descriptions)
    }
  }, [onData])
  

  return (
    <View>
      <Text style={[styles.headerText, {color: textColor}]}>sherlock's bookmarked</Text>
      <TextInput
        style={{...styles.postTitle, borderColor: TextInputBorderColor, color: textColor}}
        placeholder="Bookmarked title"
        onChangeText={e => setTitle(e)}
        value={title}
        placeholderTextColor="gray"
      />
      <TextInput
        style={[styles.postDesc, {height: postDescHeight, borderColor: TextInputBorderColor, color: textColor}]}
        multiline
        placeholder="Write your bookmark here"
        textAlignVertical="top"
        value={description}
        onContentSizeChange={handleTextChange}
        onChangeText={e => setDescription(e)}
        placeholderTextColor="gray"
      />
      <TouchableOpacity onPress={onData? handleUpdateTask: handleAddTask} style={{...styles.submitButton, backgroundColor:  submitButtonColor}}>
        <Text style={{...styles.submitButtonText, color: submitButtonTetx }}>{onData?'update':'Submit'} </Text>
      </TouchableOpacity>
    </View>
  ); 
};

export default SheetInput;

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'MeriendaBold',
    fontSize: 20,
    marginLeft: 12,
    marginBottom: 10,
    color: '#0a1930',
  },
  postTitle: {
    marginTop: 8,
    borderRadius: 10,
    fontSize: 17,
    lineHeight: 20,
    padding: 8,
    borderColor: '#475468',
    borderWidth: 1.5,
    marginHorizontal: 10,
    color: '#0a1930',
  },
  postDesc: {
    borderColor: '#475468',
    borderWidth: 1.5,
    marginHorizontal: 10,
    borderRadius: 10,
    fontSize: 17,
    padding: 8,
    marginTop: 20,
    color: '#0a1930',
  },
  submitButton: {
    backgroundColor: '#475468',
    borderRadius: 10,
    padding: 10,
    paddingTop: 5,
    marginHorizontal: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'MeriendaBold',
  },
});
