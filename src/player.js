import { Audio, Video } from 'expo-av'

const playbackObject = new Audio.Sound()


export default {
  async loadAndPlay(uri,cb){
    playbackObject.unloadAsync()
    const res = await playbackObject.loadAsync({uri})
    if(res.isLoaded){
      playbackObject.playAsync()
    }
    this.setCb(cb)
  },
  setCb(cb){
    playbackObject.setOnPlaybackStatusUpdate(function (e) {
      cb && cb(e)
    })
  },
  pause(){
    playbackObject.pauseAsync()
  },
  play(){
    playbackObject.playAsync()
  },
  stop() {
    playbackObject.stopAsync()
  }
}