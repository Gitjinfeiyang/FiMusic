import * as React from 'react';
import { Platform, StyleSheet, Text, View,SafeAreaView } from 'react-native';
import { Router, Stack, Scene, Actions, Lightbox} from 'react-native-router-flux'
import { ApplicationProvider, IconRegistry,Layout,Icon,Button} from '@ui-kitten/components'
import * as eva from '@eva-design/eva'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import storage from './src/storage'
import { Provider,connect } from 'react-redux'

import Home from './src/views/home'
import Favorite from './src/views/favorite'
import Login from './src/views/login'
import Landing from './src/views/landing'
import Playing from './src/views/playing'

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android: `Double tap R on your keyboard to reload,\nShake or press menu button for dev menu`,
});

export default function App() {
  return (
    <React.Fragment >
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
          <Router>
            <Stack key="root">
            <Scene key="landing" component={Landing} hideNavBar={true}></Scene>
            <Scene key="login" component={Login} title="Login" navTransparent={true}></Scene>
            <Scene key="home" component={Home} navTransparent={true}></Scene>
            <Scene key="favorite" component={Favorite} title="Favorite" renderRightButton={PlayingIcon}></Scene>
            <Scene key="playing" component={Playing} navTransparent={true} title=""></Scene>
            </Stack>
          </Router>
      </ApplicationProvider>
    </React.Fragment>
  );
}

function PlayingIcon(props){
  return (
    <React.Fragment>
      <Button appearance='ghost' size="small" onPress={toPlaying}>
        Playing
      </Button>
        <Button appearance='ghost' size="small" onPress={() => Actions.login()}>Logout</Button>
    </React.Fragment>
  )
}

function toPlaying(){
  Actions.playing()
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
