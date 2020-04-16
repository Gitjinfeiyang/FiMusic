import { Audio, Video } from 'expo-av'
import api from '../api'
import store from './store'
import {ToastAndroid} from 'react-native'


class Player {
  constructor(){
    this.playbackObject = new Audio.Sound()
    this.initCb()
  }

  async loadAndPlay(){
    this.playbackObject.unloadAsync()

    // 检查歌曲
    const res = await api.checkSong({ id: this.getCurrentSong().id })
    if(res.data.success){
      // 获取url
      const res2 = await api.getSongUrl({ id: store.player.playlist[store.player.playingIndex].id })
      if (res2.data.code == 200) {
        // 取码率最好的一首
          let currentSongUrl = res2.data.data.pop()
        try {
          // 设置到播放器
          const res1 = await this.playbackObject.loadAsync({ uri: currentSongUrl.url })
          if (res1.isLoaded) {
            this.playbackObject.playAsync()
          }
        } catch (err) {
          ToastAndroid.show(err.message + ' 播放下一首',ToastAndroid.SHORT)
          this.nextSong()
        }
      } else {
        ToastAndroid.show(res2.data.message + ' 播放下一首', ToastAndroid.SHORT)
        this.nextSong()
      }
    }else{
      // 无权限
      // this.nextSong()
    }

    
  }
  initCb(){
    this.playbackObject.setOnPlaybackStatusUpdate( (e) => {
      // set到全局
      store.player.updatePlayingStatus(e)
      if (e.didJustFinish){
        this.nextSong()
      }
    })
  }
  pause(){
    this.playbackObject.pauseAsync()
  }
  play(){
    this.playbackObject.playAsync()
  }
  stop() {
    this.playbackObject.stopAsync()
  }

  // 目前实现的是循环播放
  prevSong() {
    store.player.playingIndex -= 1
    if (store.player.playingIndex < 0) {
      store.player.playingIndex = store.player.playlist.length - 1
    }
    store.player.updatePlayingIndex(store.player.playingIndex)
    this.stop()
    this.loadAndPlay()
  }

  nextSong() {
    store.player.playingIndex += 1
    if (store.player.playingIndex > (store.player.playlist.length - 1)) {
      store.player.playingIndex = 0
    }
    store.player.updatePlayingIndex(store.player.playingIndex)
    this.stop()
    this.loadAndPlay()
  }

  getCurrentSong(){
    return store.player.playlist[store.player.playingIndex]
  }

  
}

export default new Player()