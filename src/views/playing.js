import * as React from 'react'
import { View, ScrollView, ToastAndroid, ImageBackground, StyleSheet, ActivityIndicator, Image, TouchableHighlight } from 'react-native'
import storage from '../assets/storage'
import { Button, Card, Layout, Text, Avatar, Icon, ListItem, ViewPager, ButtonGroup } from '@ui-kitten/components'
import api from '../api'
import player from '../assets/player';
import utils from '../assets/utils'
import { observer } from 'mobx-react'
import { autorun, reaction } from 'mobx'

@observer
export default class Playing extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      playingIndex: props.index === undefined ? props.store.player.playingIndex : props.index,
      currentSongDetail: {},
      currentSongUrl: [{
        url: ''
      }],
      playStatus: {
        isMuted: false,
        isPlaying: false
      },
      isLoading: true
    }
    if (!this.state.playingIndex) return
    if (props.index !== undefined) {
      // 如果设置了index，则需要重新指定播放 否则维持当前状态
      this.updatePlaying(props.index)
    }

  }

  componentDidMount() {
    this.playingIndexReaction = reaction(() => this.props.store.player.playingIndex, () => {
      // 如果正在播放曲目变化，重新请求当前曲目信息
      // why?
      setTimeout(() => {
        this.refreshLyric()
      })
    })

    this.playPositionReaction = reaction(() => this.props.store.player.playingStatus, (index) => {
      this.refreshLyricScroll()
    })
  }

  componentWillUnmount() {
    try {
      this.playingIndexReaction()
      this.playPositionReaction()
    } catch (err) {
      console.log(err)
    }
  }

  refreshLyric() {
    this.lyric.initLyric()
  }

  refreshLyricScroll() {
    this.lyric.initLyricScroll()
  }

  onBuffer(e) {

  }

  videoError(e) {

  }

  getCurrentSong() {
    return player.getCurrentSong()
  }

  handleStatus(playStatus) {
    if (!playStatus || !playStatus.uri) return
    this.setState({
      playStatus
    })
    if (playStatus.didJustFinish) {
      // 播放到底了，下一首
      this.nextSong()
    }
  }

  async updatePlaying(index = this.state.playingIndex) {
    this.props.store.player.updatePlayingIndex(index)
    player.loadAndPlay()
  }

  // 目前实现的是循环播放
  prevSong() {
    player.prevSong()
  }

  nextSong() {
    player.nextSong()
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

  pause() {
    player.pause()
  }

  play() {
    player.play()
  }




  render() {
    let currentSong = this.props.store.player.playlist[this.props.store.player.playingIndex]
    return currentSong ? (
      <View style={styles.wrapper}>
        <ImageBackground
          resizeMethod="scale"
          blurRadius={10}
          style={styles.image}
          source={{ uri: currentSong.al.picUrl + '?param=80y80' }} >

          <View
            style={styles.scrollView}
          >

            {currentSong && currentSong.id ?
              <Lyric
                ref={(el) => this.lyric = el}
                currentTime={this.props.store.player.playingStatus.positionMillis}
                songId={currentSong.id}></Lyric>
              : null}


            {/* <Comment songId={currentSong.id} ref={(el) => this.comment = el }></Comment> */}
          </View>

          <View style={styles.playingBar}>
            <View style={styles.durationOutter}>
              <View style={{
                ...styles.durationInner,
                width: (this.props.store.player.playingStatus.positionMillis / this.props.store.player.playingStatus.durationMillis) * 100 + '%'
              }}></View>
            </View>
            <View style={styles.playingBarInner}>
              <Image resizeMethod="scale"
                style={styles.playingImage}
                source={{ uri: currentSong.al.picUrl + '?param=80y80' }} />
              <View style={styles.playingContent}>
                <Text style={styles.songName}>{currentSong.name}</Text>
                <Text style={styles.alName}>{currentSong.al.name}</Text>
              </View>
              <View style={styles.playingActions}>
                <ButtonGroup size="tiny">
                  <Button onPress={() => this.prevSong()}>Prev</Button>
                  {
                    !this.props.store.player.playingStatus.isLoaded ? <Button disabled>Loading...</Button> :
                      (this.props.store.player.playingStatus.isPlaying ? <Button onPress={() => this.pause()}>Pause</Button> : <Button onPress={() => this.play()}>Play</Button>)
                  }
                  <Button onPress={() => this.nextSong()}>Next</Button>
                </ButtonGroup>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    ) : null
  }
}

// 评论 暂时隐藏
class Comment extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      comments: {
        hotComments: [],
        comments: [],
        more: true
      },
      limit: 30,
      offset: 0,
      songId: props.songId
    }
  }

  componentDidMount() {
    this.initList()
  }

  async getList() {
    const res = await api.getSongComment({ id: this.state.songId, limig: this.state.limit, offset: this.state.offset })
    if (res.data.code == 200) {
      if (res.data.hotComments) {
        this.state.comments.hotComments = res.data.hotComments
      }
      this.state.comments.comments = res.data.comments
      this.state.comments.more = res.data.more
      this.setState({
        comments: this.state.comments
      })
    }
  }

  nextPage() {
    this.state.offset += this.state.limit
    this.setState({
      offset: this.state.offset
    })
    this.getList()
  }

  initList() {
    this.getList()
  }

  render() {
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
  constructor(props) {
    super(props)
    this.state = {
      lyricObj: {
        ms: []
      },
      lyricIndex: 0
    }
    this.initLyric()
  }

  async initLyric() {
    try {
      const res = await api.getSongLyric({ id: this.props.songId })
      if (res.data.code == 200) {
        this.setState({
          lyricObj: utils.createLrcObj(res.data.lrc.lyric),
          currentIndex: 0
        }, () => {
          this.initLyricScroll()
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  initLyricScroll() {
    if (this.props.currentTime === undefined || this.props.currentTime === undefined) {

    } else {
      let next = null
      let arr = this.state.lyricObj.ms
      for (let i = this.state.currentIndex; i < arr.length; i++) {
        next = arr[i + 1]
        if (next) {
          if (this.props.currentTime >= arr[i].t && this.props.currentTime < next.t) {
            this.scrollTo(i)
            break
          }
        } else {
          if (this.props.currentTime >= arr[i].t) {
            this.scrollTo(i)
            break
          }
        }
      }
    }
  }

  componentDidMount() {
  }

  scrollTo(position) {
    this.setState({
      currentIndex: position
    })
    this.scrollView.scrollTo({ y: position * 40 - 100, animated: true })
  }

  render() {
    return <ScrollView ref={(el) => this.scrollView = el}>
      <View style={styles.lyricWrapper} >
        {
          this.state.lyricObj.ms.map((item, index) => {
            let activeStyle = {}
            if (this.state.currentIndex === index) {
              activeStyle = styles.activeLyricText
            }
            return <Text key={index} style={{ ...styles.lyricText, ...activeStyle }}>{item.c}</Text>
          })
        }
      </View>
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    display: 'flex',
    flexDirection: 'column'
  },
  scrollView: {
    flex: 1
  },
  image: {
    height: "100%"
  },
  durationOutter: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)'
  },
  durationInner: {
    backgroundColor: '#598BFF',
    height: '100%'
  },
  playingBar: {
    height: 70,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  playingBarInner: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10
  },
  playingImage: {
    width: 40, height: 40, borderRadius: 4
  },
  playingContent: {
    flex: 1,
    paddingLeft: 10
  },
  playingActions: {
  },
  songName: {
    marginBottom: 4
  },
  alName: {
    fontSize: 12,
    color: "#ccc"
  },
  lyricWrapper: {
    margin: 20,
    marginTop: 60
  },
  lyricText: {
    fontSize: 22,
    textShadowRadius: 10,
    textShadowColor: 'rgba(0,0,0,0.6)',
    color: "rgba(255,255,255,0.6)",
    marginBottom: 15
  },
  activeLyricText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff"
  }
})