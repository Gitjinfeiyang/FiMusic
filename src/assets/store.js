import { observable,action} from 'mobx'
import storage from './storage'

let player = observable({
  playingIndex:null,
  playlist:[],
  playingStatus:{}
})

player.updatePlayingIndex = action((playingIndex) => {
  player.playingIndex = playingIndex
})

player.updatePlaylist = action(({playingIndex,playlist}) => {
  player.playingIndex = playingIndex
  player.playlist = playlist
})

player.updatePlayingStatus = action((status) => {
  player.playingStatus = status
})



let config = observable({
  setting:{
    api:''
  }
})

config.updateSetting = action(setting => {
  config.setting = setting
  storage.setItem('config.setting',setting,true)
})

config.initSetting = action(async () => {
  let setting = await storage.getCache('config.setting')
  if(setting){
    config.setting = setting
  }
})

export default {
  player,
  config
}