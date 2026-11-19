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
  const {textColor, subTextColor, softFill, borderColor, plusButtonBg, plusButtonFg} = useThemeColors()
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
      <Text style={[styles.headerText, {color: textColor}]}>{onData ? 'Edit bookmark' : 'New bookmark'}</Text>
      <Text style={[styles.label, {color: subTextColor}]}>Title (optional)</Text>
      <TextInput
        style={[styles.postTitle, {backgroundColor: softFill, borderColor, color: textColor}]}
        placeholder="e.g. Holmes on deduction"
        onChangeText={e => setTitle(e)}
        value={title}
        placeholderTextColor={subTextColor}
      />
      <Text style={[styles.label, {color: subTextColor}]}>Bookmark</Text>
      <TextInput
        style={[styles.postDesc, {height: postDescHeight, backgroundColor: softFill, borderColor, color: textColor}]}
        multiline
        placeholder="Paste the copied line or write a note"
        textAlignVertical="top"
        value={description}
        onContentSizeChange={handleTextChange}
        onChangeText={e => setDescription(e)}
        placeholderTextColor={subTextColor}
      />
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={description.trim() === ''}
        onPress={onData ? handleUpdateTask : handleAddTask}
        style={[
          styles.submitButton,
          {backgroundColor: plusButtonBg},
          description.trim() === '' && styles.submitButtonDisabled,
        ]}>
        <Text style={[styles.submitButtonText, {color: plusButtonFg}]}>{onData ? 'Save changes' : 'Save bookmark'}</Text>
      </TouchableOpacity>
    </View>
  ); 
};

export default SheetInput;

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'MeriendaBold',
    fontSize: 20,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.3,
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 6,
  },
  postTitle: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 17,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 14,
  },
  postDesc: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 14,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    marginHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 50,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'MeriendaBold',
    // MeriendaBold sits low in its line box; lift it to the visual centre.
    marginTop: -4,
  },
});
