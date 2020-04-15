import * as React from 'react'
import { View, ScrollView, ToastAndroid, ImageBackground, StyleSheet, ActivityIndicator,Image } from 'react-native'
import storage from '../storage'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem,ViewPager,ButtonGroup } from '@ui-kitten/components'
import api from '../api'
import player from '../player';
import utils from '../assets/utils'

export default class Playing extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      playlist: storage.getPlaylist(),
      playingIndex: props.index === undefined?storage.getPlaying() : props.index,
      currentSongDetail:{},
      currentSongUrl:[{
        url:''
      }],
      playStatus:{
        isMuted:false,
        isPlaying:false
      },
      isLoading:true
    }
    if(!this.state.playingIndex) return 
    if(props.index !== undefined){
      // 如果设置了index，则需要重新指定播放 否则维持当前状态
      this.setToPlayer(props.index)
    }else{
      this.initStatusCb()
    }

  }

  componentDidMount() {
  }

  onBuffer(e){

  }

  videoError(e){

  }

  getCurrentSong(){
    if (this.state.playingIndex === undefined){
      return null
    }else{
      return this.state.playlist[this.state.playingIndex]
    }
  }

  handleStatus(playStatus){
    if(!playStatus || !playStatus.uri) return 
    this.setState({
      playStatus
    })
    if (playStatus.didJustFinish){
      // 播放到底了，下一首
      this.nextSong()
    }
  }

  async setToPlayer(index = this.state.playingIndex){
    storage.setPlaying(index)
    this.pause()
    this.setState({isLoading:true,isPlaying:false})

    // 检查歌曲
    const res = await api.checkSong({id:this.getCurrentSong().id})
    if(res.data.success){
      // 获取url
      const res2 = await api.getSongUrl({id:this.getCurrentSong().id})
      if(res2.data.code == 200){
        // 取码率最好的一首
        this.setState({
          currentSongUrl:res2.data.data.pop()
        })
        try{
          // 设置到播放器
          await player.loadAndPlay(this.state.currentSongUrl.url)
          this.initStatusCb()
          this.setState({ isLoading: false })
        }catch(err){
          ToastAndroid.show(err.message + ' 播放下一首')
          this.nextSong()
          this.setState({ isLoading: false })
        }
      }else{
        ToastAndroid.show(res2.data.message + ' 播放下一首')
        this.nextSong()
        this.setState({ isLoading: false })
      }
    }else{
      ToastAndroid.show(res.data.message+' 播放下一首')
      this.nextSong()
      this.setState({ isLoading: false })
    }
  }

  initStatusCb(){
    player.setCb((playStatus) => {
      this.handleStatus(playStatus)
    })
  }

  // 目前实现的是循环播放
  prevSong(){
    this.state.playingIndex -= 1
    if(this.state.playingIndex <0){
      this.state.playingIndex = this.state.playlist.length-1
    }
    storage.setPlaying(this.state.playingIndex)
    this.setState({
      playingIndex:this.state.playingIndex
    })
    this.getCurrentSong()
    this.setToPlayer()
    this.lyric.initLyric()
  }

  nextSong(){
    this.state.playingIndex += 1
    if(this.state.playingIndex > (this.state.playlist.length -1)){
      this.state.playingIndex = 0
    }
    storage.setPlaying(this.state.playingIndex)
    this.setState({
      playingIndex: this.state.playingIndex
    })
    this.getCurrentSong()
    this.setToPlayer()
    this.lyric.initLyric()
  }

  _contentViewScroll(e) {
    var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
    var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
    var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
    if (offsetY + oriageScrollHeight >= contentSizeHeight) {
      // 下一页
      this.comment.nextPage()
    }
  }

  pause(){
    player.pause()
  }

  play(){
    player.play()
  }




  render() {
    let currentSong = this.getCurrentSong()
    return currentSong?(
      <View style={styles.wrapper}>
        <View
          style={styles.scrollView}
          >
  
            <ImageBackground blurRadius={20} style={styles.image} source={{ uri: currentSong.al.picUrl }} >
              {currentSong && currentSong.id?<Lyric ref={(el) => this.lyric = el} currentTime={this.state.playStatus.positionMillis} songId={currentSong.id}></Lyric>:null}
            </ImageBackground>
  

          {/* <Comment songId={currentSong.id} ref={(el) => this.comment = el }></Comment> */}
        </View>

        <View style={styles.playingBar}>
          <View style={styles.durationOutter}>
            <View style={{
              ...styles.durationInner,
              width: (this.state.playStatus.positionMillis / this.state.playStatus.durationMillis) * 100 + '%'
            }}></View>
          </View>
          <ListItem
            title={currentSong.name}
            description={currentSong.al.name}
            accessoryLeft={(props) => <Image style={styles.playingImage} source={{ uri: currentSong.al.picUrl}} />}
            accessoryRight={(props) => {
              return (
                <View >
                  <ButtonGroup size="small" appearance='outline' status='info'>
                    <Button onPress={() => this.prevSong()}>Prev</Button>
                    {
                      this.state.isLoading ? <Button disabled>Loading...</Button> :
                        (this.state.playStatus.isPlaying ? <Button onPress={() => this.pause()}>Pause</Button> : <Button onPress={() => this.play()}>Play</Button>)
                    }
                    <Button onPress={() => this.nextSong()}>Next</Button>
                  </ButtonGroup>
                </View>
              )
            }}
          />
        </View>

      </View>
    ):null
  }
}

// 评论
class Comment extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      comments:{
        hotComments:[],
        comments:[],
        more:true
      },
      limit:30,
      offset:0,
      songId:props.songId
    }
  }

  componentDidMount(){
    this.initList()
  }

  async getList(){
    const res = await api.getSongComment({id:this.state.songId,limig:this.state.limit,offset:this.state.offset})
    if(res.data.code == 200){
      if(res.data.hotComments){
        this.state.comments.hotComments = res.data.hotComments
      }
      this.state.comments.comments = res.data.comments
      this.state.comments.more = res.data.more
      this.setState({
        comments:this.state.comments
      })
    }
  }

  nextPage(){
    this.state.offset += this.state.limit
    this.setState({
      offset:this.state.offset
    })
    this.getList()
  }

  initList(){
    this.getList()
  }

  render(){
    return (
      <ScrollView>
        {
          this.state.comments.hotComments.map(item => {
            return <ListItem
              key={item.id}
              title={item.user.nickname}
              description={item.content + ' - ' + new Date(item.time).toLocaleDateString()}
              accessoryLeft={(props) => <Avatar source={{ uri: item.user.avatarUrl }} />}
            />
          })
          
        }
        {
          this.state.comments.comments.map(item => {
            return <ListItem
              key={item.id}
              title={item.user.nickname}
              description={item.content + ' - ' + new Date(item.time).toLocaleDateString()}
              accessoryLeft={(props) => <Avatar source={{ uri: item.user.avatarUrl }} />}
            />
          })
        }
      </ScrollView>
    )
  }
}

// 歌词
class Lyric extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      lyricObj:{
        ms:[]
      }
    }
    this.initLyric()
  }

  async initLyric(){
    try{
      const res = await api.getSongLyric({id:this.props.songId})
      if(res.data.code == 200){
        this.setState({
          lyricObj:utils.createLrcObj(res.data.lrc.lyric)
        })
      }
    }catch(err){
      console.log(err)
    }
  }
  
  componentDidMount(){
  }

  scrollTo(position){
    this.scrollView.scrollTo({ y: position*40 -100, animated: true })
  }

  render(){
    return <ScrollView ref={(el) => this.scrollView = el}>
      <View style={styles.lyricWrapper} >
        {
          this.state.lyricObj.ms.map((item,index) => {
            let next = this.state.lyricObj.ms[index+1]
            let activeStyle = {}
            if (this.props.currentTime === undefined || this.props.currentTime === undefined){

            }else{
              if(next){
                if (this.props.currentTime >= item.t && this.props.currentTime < next.t){
                  activeStyle = styles.activeLyricText
                  this.scrollTo(index)
                }
              }else{
                if (this.props.currentTime >= item.t){
                  activeStyle = styles.activeLyricText
                  this.scrollTo(index)
                }
              }
            }
            return <Text style={{...styles.lyricText,...activeStyle}}>{item.c}</Text>
          })
        }
      </View>
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  wrapper:{
    height:"100%",
    display:'flex',
    flexDirection:'column'
  },  
  scrollView:{
    flex:1
  },  
  image:{
    height:"100%"
  },
  durationOutter:{
    height:4,
    backgroundColor:'#f1f1f1'
  },
  durationInner:{
    backgroundColor:'#598BFF',
    height:'100%'
  },
  playingBar:{
    height:80,
    backgroundColor:"#fff"
  },
  playingImage:{
    width:40,height:40,borderRadius:4
  },
  lyricWrapper:{
    margin:20,
    marginTop:60
  },
  lyricText:{
    fontSize:22,
    textShadowRadius:10,
    textShadowColor:'rgba(0,0,0,0.6)',
    color:"rgba(255,255,255,0.6)",
    marginBottom:15
  },
  activeLyricText:{
    fontSize:26,
    fontWeight:"bold",
    color:"#fff"
  }
})