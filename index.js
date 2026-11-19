/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {installTapSound} from './utils/themeBridge';
import {name as appName} from './app.json';

installTapSound();

AppRegistry.registerComponent(appName, () => App);
