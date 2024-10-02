import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {UseAppContext} from '../context/AppContext';
import {useNavigation} from '@react-navigation/native';
import { useThemeColors } from '../context/ThemeContext';

const Bookmarked: React.FC = () => {
  const {getDBConnection, createTable, createTodo, deleteTodo, todos} =
    UseAppContext();
  const {appBackground, textColor,  buttonColor, shadowColor } = useThemeColors()

  const navigation = useNavigation<any>();

  useEffect(() => {
    const setupDB = async () => {
      const db = await getDBConnection();
      if (db) await createTable(db);

      // await loadTasks();
    };
    setupDB();
  }, []);

  const concatData = (x: string) => {
    if (x.length > 50) {
      return x.slice(0, 50) + '...';
    } else return x;
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: appBackground, paddingHorizontal: 8,}}>
      <View style={{...styles.row, paddingBottom: 50}}>
        {todos &&
          todos.map((data: any) => {
            return (
              <TouchableOpacity
                key={data?.id}
                style={{...styles.button, ...styles.shadowProp, shadowColor: shadowColor, backgroundColor: buttonColor}}
                onPress={()=>navigation.navigate("MarkedDetalse",{data})} 
              >
                {data.title ? (
                  <Text style={{...styles.title, color: textColor}}>
                    {concatData(data.title).trim().replace(/\n/g, ' ')}
                  </Text>
                ) : (
                  <Text style={{...styles.title, color: textColor}}>
                    {concatData(data.description).trim().replace(/\n/g, ' ')}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    </ScrollView>
  );
};

export default Bookmarked;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#f9fafc',
    borderRadius: 10,
    marginTop: 15,
    width: '48.5%',
    padding: 8,
    minHeight: 100,
  },
  shadowProp: {
    shadowColor: '#354158',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontFamily: 'kalpurush',
    textAlign: 'left',
    fontSize: 20, // Adjusted font size to fit better
    color: '#0a1930',
  },
});
