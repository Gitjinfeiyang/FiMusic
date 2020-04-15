import * as React from 'react'
import { View, TextInput, ToastAndroid, StyleSheet } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem, Input } from '@ui-kitten/components'

import storage from '../storage'
import api from '../api'


export default class PlayingBar extends React.Component {

  constructor(props) {
    super(props)
  }

  handleUsername(value) {
    this.state.form.username = value
    this.setState({
      form: this.state.form
    })
  }

  handlePassword(value) {
    this.state.form.password = value
    this.setState({
      form: this.state.form
    })
  }

  login() {
    const { username, password } = this.state.form
    // if(username === '' || password === ''){
    //   ToastAndroid.show('Please input your username and password!')
    //   return
    // }
    ToastAndroid.show('login...', ToastAndroid.SHORT)
    api.loginByPhone({ phone: username, password })
      .then(res => {
        storage.setAccount(res.data, true)
        Actions.home()
        // if(res.data.code === 200){
        //   ToastAndroid.show('Success!')
        // }else{
        //   ToastAndroid.show(res.data.message)
        // }
      })
  }

  render() {
    return (
      <Card style={styles.card}>
        <View>
          <Input label="Username" placeholder="Username" value={this.state.form.username} onChangeText={(e) => this.handleUsername(e)} />
          <Input label="Password" placeholder="Password" value={this.state.form.password} onChangeText={(e) => this.handlePassword(e)} />
        </View>
        <View style={styles.button}>
          <Button onPress={() => this.login()}>Login</Button>
        </View>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  card: { margin: 10, marginTop: 30 },
  button: {
    marginTop: 30
  }
})