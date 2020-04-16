import * as React from 'react'
import { View, TextInput, ToastAndroid, StyleSheet, Image,ScrollView } from 'react-native'
import { Actions, ActionConst } from 'react-native-router-flux'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem, Input } from '@ui-kitten/components'

import storage from '../assets/storage'
import store from '../assets/store'
import api from '../api'
export default class Setting extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      setting:{
        api:''
      }
    }
    this.initLocalSetting()
  }


  initLocalSetting(){
    this.state.setting = Object.assign(this.state.setting,store.config.setting)
    this.setState({
      setting:this.state.setting
    })
  }

  async componentDidMount() {
    let setting = await storage.getCache('setting')
  }

  settingChange(val,key){
    this.state.setting[key] = val
    this.setState({
      setting:this.state.setting
    })
  }

  save(){
    store.config.updateSetting(this.state.setting)

    if(this.state.setting.api !== ''){
      api.instance.defaults.baseURL = this.state.setting.api
    }
    ToastAndroid.show('Success',ToastAndroid.SHORT)
  }

  render() {
    return (  
      <ScrollView>
        <Card>
          <Input value={this.state.setting.api} label="Api" onChangeText={(val) => this.settingChange(val,'api')} />
          <Button onPress={() => this.save()}>Save</Button>
        </Card>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  card: { margin: 10, marginTop: 30 },
  button: {
    marginTop: 30
  },
  image: {
    width: '100%', height: '100%'
  }
})
