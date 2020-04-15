import * as React from 'react'
import { View, TextInput, ToastAndroid, StyleSheet,Image } from 'react-native'
import { Actions,ActionConst } from 'react-native-router-flux'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem, Input } from '@ui-kitten/components'

import storage from '../storage'
import api from '../api'
export default class Login extends React.Component {

  constructor(props) {
    super(props)
  }

  async componentDidMount(){
    let account = await storage.getCache('account')
    if (account) {
      Actions.home({type:ActionConst.REPLACE})
    } else {
      Actions.login({ type: ActionConst.REPLACE })
    }
  }

  render() {
    return (
      <Image style={styles.image} source={require('../assets/logo.png')}></Image>
    )
  }
}

const styles = StyleSheet.create({
  card: { margin: 10, marginTop: 30 },
  button: {
    marginTop: 30
  },
  image:{
    width:'100%',height:'100%'
  }
})