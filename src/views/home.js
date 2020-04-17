import * as React from 'react'
import { View, StyleSheet, TouchableNativeFeedback, ImageBackground, Image, ToastAndroid, ScrollView} from 'react-native'
import {Actions} from 'react-native-router-flux'
import storage from '../assets/storage'
import { Button, Card, Layout, Text, Avatar, Icon,ListItem} from '@ui-kitten/components'
import api from '../api'
import { observer } from 'mobx-react'
import SongList from './favorite'

@observer
export default class Home extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      playlist:[],
      currentPlaylist:{}
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
    this.setState({
      currentPlaylist:route
    },() => {
        this.songlist.getPlaylistDetail()
    })
    
    // Actions.favorite({playlist:route,title:route.name})
  }

  async getUserPlaylist(){
    const res = await api.getUserPlaylist({uid:this.state.account.account.id})
    if(res.data.code == 200){
      this.setState({
        playlist:res.data.playlist
      })
      if(res.data.playlist.length){
        this.goToTarget(res.data.playlist[0])
      }
    }else{
      ToastAndroid.show('获取歌单失败',ToastAndroid.SHORT)
    }
  }

  render(){
    return this.state.account?(
      <View style={styles.container}>
        <ScrollView style={styles.pageWrapper}>
          <ImageBackground style={styles.userBackgroundImage} 
            source={{ uri: this.state.account.profile.backgroundUrl }}
            blurRadius={10}>
            <Card style={styles.headerCard}>
              <ListItem
                title={this.state.account.profile.nickname}
                accessoryLeft={(props) => <Avatar source={{ uri: this.state.account.profile.avatarUrl }} />}
                accessoryRight={(props) => {
                  return (
                    <React.Fragment>
                      {/* <TouchableNativeFeedback>
                        <Button size="tiny" appearance="ghost" onPress={() => Actions.playing()}>Playing</Button>
                      </TouchableNativeFeedback> */}
                      <TouchableNativeFeedback>
                        <Button size="tiny" appearance="ghost" onPress={() => Actions.login()}>Logout</Button>
                      </TouchableNativeFeedback>
                    </React.Fragment>
                  )
                }}
              />
            </Card>
          </ImageBackground>
          {
            this.state.playlist.map(item => {
              return (
                <TouchableNativeFeedback key={item.id}>
                  <ListItem
                    style={this.state.currentPlaylist == item?{backgroundColor:'#f1f1f1'}:{}}
                    onPress={() => this.goToTarget(item)}
                    key={item.id}
                    title={item.name}
                    accessoryLeft={(props) => <Image style={styles.playlistImage} source={{ uri: item.coverImgUrl }} ></Image>}
                    description={`${item.trackCount}首歌 播放${item.playCount}次`}
                  />
                </TouchableNativeFeedback>
              )
            })
          }
        </ScrollView>

        <View style={styles.rightContent}>
          <SongList ref={(el) => this.songlist = el} store={this.props.store} playlist={this.state.currentPlaylist}></SongList>
        </View>
      </View>
      
    ):null
  }
}

const styles = StyleSheet.create({
  container:{
    display:'flex',
    flexDirection:'row'
  },
  pageWrapper:{
    flex:1,
    borderRightColor:'#f1f1f1',
    borderRightWidth:1
  },
  rightContent:{
    flex:2
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
    width:40,height:40,borderRadius:4
  }
})

