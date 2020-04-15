import * as React from 'react'
import { View, StyleSheet, TouchableHighlight, ImageBackground, Image, ToastAndroid, ScrollView} from 'react-native'
import {Actions} from 'react-native-router-flux'
import storage from '../assets/storage'
import { Button, Card, Layout, Text, Avatar, Icon,ListItem} from '@ui-kitten/components'
import api from '../api'
import { observer } from 'mobx-react'

@observer
export default class Home extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      playlist:[]
    }
  }

  componentDidMount(){
    let account = storage.getAccount()
    this.setState({
      account
    },() => {
      this.getUserPlaylist()
    })
  }

  goToTarget(route){
    Actions.favorite({playlist:route,title:route.name})
  }

  async getUserPlaylist(){
    const res = await api.getUserPlaylist({uid:this.state.account.account.id})
    if(res.data.code == 200){
      this.setState({
        playlist:res.data.playlist
      })
    }else{
      ToastAndroid.show('获取歌单失败')
    }
  }

  render(){
    return this.state.account?(
      <ScrollView style={styles.pageWrapper}>
        <ImageBackground style={styles.userBackgroundImage} source={{ uri: this.state.account.profile.backgroundUrl}}>
          <Card style={styles.headerCard}>
            <ListItem
              title={this.state.account.profile.nickname}
              description='A set of React Native components'
              accessoryLeft={(props) => <Avatar source={{ uri: this.state.account.profile.avatarUrl }} />}
              accessoryRight={(props) =>{ 
                return (
                  <React.Fragment>
                    <Button size="tiny" appearance="ghost" onPress={() => Actions.playing()}>Playing</Button>
                    <Button size="tiny" appearance="ghost" onPress={() => Actions.login()}>Logout</Button>
                  </React.Fragment>
                )
              }}
            />
          </Card>
        </ImageBackground>
        {
          this.state.playlist.map(item => {
            return (
                <ListItem
                  onPress={() => this.goToTarget(item)}
                  key={item.id}
                  title={item.name}
                  accessoryLeft={(props) => <Image style={styles.playlistImage} source={{ uri:item.coverImgUrl }} ></Image>}
                  description={`${item.trackCount}首歌 播放${item.playCount}次`}
                />
            )
          })
        }
      </ScrollView>
    ):null
  }
}

const styles = StyleSheet.create({
  pageWrapper:{
    backgroundColor:'#f1f1f1'
  },
  actionItem:{
    marginTop:10,
    height:80,
    backgroundColor:'rgba(255,255,255,0.8)',
    textAlign:'center',
    display:'flex'
  },
  userBackgroundImage:{
    width:"100%"
  },
  header:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
  },
  headerCard:{
    margin:10,
    marginTop:30
  },
  name:{
    flex:1
  },
  avatar:{
    flex:1,
  },
  playlistImage:{
    width:60,height:60,borderRadius:4
  }
})

