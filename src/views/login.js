import * as React from 'react'
import { View, TextInput, ToastAndroid,StyleSheet,Image,TouchableHighlight} from 'react-native'
import { Actions } from 'react-native-router-flux'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem,Input } from '@ui-kitten/components'

import storage from '../assets/storage'
import api from '../api'
export default class Login extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      form:{
        username:'',
        password:''
      }
    }
  }

  handleUsername(value){
    this.state.form.username = value
    this.setState({
      form:this.state.form
    })
  }

  handlePassword(value){
    this.state.form.password = value
    this.setState({
      form: this.state.form
    })
  }

  login(){
    const {username,password} = this.state.form
    if(username === '' || password === ''){
      ToastAndroid.show('Please input your username and password!',ToastAndroid.SHORT)
      return
    }
    ToastAndroid.show('Login...',ToastAndroid.SHORT)
    api.loginByPhone({phone:username,password})
      .then(res => {
        
        if(res.data.code === 200){
          storage.setAccount(res.data, true)
          Actions.home()
          ToastAndroid.show('Success!',ToastAndroid.SHORT)
        }else{
          ToastAndroid.show(res.data.message,ToastAndroid.SHORT)
        }
      })
  }

  render() {
    return (
      <View style={styles.wrapper}>

        <Card style={styles.card}>
            <Image source={require('../assets/logo.png')} style={styles.bg}></Image>
            <View>
              <TouchableHighlight>
                <Input label="Username" placeholder="Username" value={this.state.form.username} onChangeText={(e) => this.handleUsername(e)} />
              </TouchableHighlight>
              <TouchableHighlight>
                <Input label="Password" placeholder="Password" value={this.state.form.password} onChangeText={(e) => this.handlePassword(e)} />
              </TouchableHighlight>
            </View>
            <View style={styles.button}>
              <TouchableHighlight>
                <Button onPress={() => this.login()}>Login</Button>
              </TouchableHighlight>
              <TouchableHighlight>
                <Button appearance="ghost" size="tiny" onPress={() => Actions.setting()}></Button>
              </TouchableHighlight>
            </View>
        </Card>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper:{
    backgroundColor:'#f5f5f5',
    height:"100%"
  },  
  card:{width:400,alignSelf:'center',marginTop:50},
  button:{
    marginTop:30
  },
  bg:{width:40,height:40,alignSelf:'center',borderRadius:6}
})