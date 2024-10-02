import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import AppNavigation from './navigation/AppNavigation';
import './gesture-handler';
import {AppContextProvider} from './context/AppContext';

const App: FC = () => {
  return (
    <>
      <StatusBar
        translucent={true}
        barStyle="dark-content"
        backgroundColor={'transparent'}
      />
      <AppContextProvider>
        <AppNavigation />
      </AppContextProvider>
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
