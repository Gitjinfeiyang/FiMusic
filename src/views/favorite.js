import * as React from 'react'
import {View,FlatList,ToastAndroid} from 'react-native'
import storage from '../assets/storage'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem } from '@ui-kitten/components'
import api from '../api'
import {Actions} from 'react-native-router-flux'
import {observer} from 'mobx-react'

@observer
export default class Favorite extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      playlist:props.playlist,
      playlistDetail:{
        playlist:{
          tracks:[]
        }
      },
      loadCount:30,
      renderList:[]
    }
  }

  componentDidMount(){
    this.setState({
      account: storage.getAccount(),
    })
  }

  async getPlaylistDetail(){
    ToastAndroid.show('Loading playlist...',ToastAndroid.SHORT)
    const res = await api.getPlaylistDetail({id:this.props.playlist.id})
    if(res.data.code == 200){
      let arNames = ''

      this.setState({
        playlistDetail:{
          playlist:{
            tracks: res.data.playlist.tracks.map(item => { 
              arNames = item && item.ar && item.ar.map(ar => ar.name).join('、') || ''

              return { ar: item.ar, id: item.id, name: item.name, al: item.al,arNames}
             })
          }
        }
      },() => {
        this.initPage()
      })
    }
  }

  nextPage(){
    this.setState({
      loadCount: this.state.loadCount + 30
    },() => {
        this.refreshPage()
    })
    
  }

  initPage(){
    this.setState({
      loadCount: 30,
      renderList:[]
    },() => {
      this.refreshPage()
    })
  }

  refreshPage(){
    let index = this.state.renderList.length

    for(let i = index; i<this.state.loadCount; i++){
      this.state.renderList.push(this.state.playlistDetail.playlist.tracks[i]) 
    }

    this.setState({
      renderList:this.state.renderList
    })
  }

  toPlaying(index){
    this.props.store.player.updatePlaylist({playlist:this.state.playlistDetail.playlist.tracks,playingIndex:index})
    Actions.playing({index})
  }

  render(){
    let currentSong = this.props.store.player.playingIndex?this.props.store.player.playlist[this.props.store.player.playingIndex]:null
    return (
      this.state.renderList.length?<FlatList
        onEndReached={() => this.nextPage()}
        data={this.state.renderList}
        renderItem={({item,index}) => {
        return <ListItem
          style={currentSong && currentSong.id == item.id ? { backgroundColor: '#f5f5f5' } : {}}
          key={item.id}
          onPress={() => this.toPlaying(index)}
          title={item.name}
          description={`${item.al.name} ${item.arNames}`}
        />}}>
      </FlatList>:null
    )
  }
}