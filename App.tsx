/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

//import React from 'react';
import React = require('react');
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation/navigation';
import { DbContextProvider } from './src/configuration/context/DbContext'
import type { PropsWithChildren } from 'react';
import Toast from 'react-native-toast-message';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';


function App(): React.JSX.Element {

  return (
    <DbContextProvider>
        <NavigationContainer>
          <Navigation />
          <Toast position="bottom" />
        </NavigationContainer>
    </DbContextProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
