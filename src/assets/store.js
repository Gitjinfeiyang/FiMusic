import { observable,action} from 'mobx'

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

export default {
  player
}