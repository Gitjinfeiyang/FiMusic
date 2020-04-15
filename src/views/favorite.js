import * as React from 'react'
import {View,ScrollView} from 'react-native'
import storage from '../assets/storage'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem } from '@ui-kitten/components'
import api from '../api'
import {Actions} from 'react-native-router-flux'

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
    this.getPlaylistDetail()
  }

  async getPlaylistDetail(){
    const res = await api.getPlaylistDetail({id:this.state.playlist.id})
    if(res.data.code == 200){
      this.setState({
        playlistDetail:res.data
      },() => {
        this.initPage()
      })
    }
  }
  _contentViewScroll(e) {
    var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
    var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
    var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
    if (offsetY + oriageScrollHeight >= contentSizeHeight) {
      this.nextPage()
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
      loadCount: 30
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
    let arNames = ''
    let currentSong = this.props.store.player.playingIndex?this.props.store.player.playlist[this.props.store.player.playingIndex]:null
    return (
      <ScrollView
        onMomentumScrollEnd={(e) => this._contentViewScroll(e)}>
        {
          // 这种性能应该不高
          this.state.renderList.map((item,index) => {
            arNames = item && item.ar && item.ar.map(ar => ar.name).join('、') || ''
            return item ? <ListItem
              style={currentSong && currentSong.id == item.id?{backgroundColor:'#f5f5f5'}:{}}
              key={item.id}
              onPress={() => this.toPlaying(index)}
              title={item.name}
              description={`${item.al.name} ${arNames}`}
            />:null
          })
        }
      </ScrollView>
    )
  }
}