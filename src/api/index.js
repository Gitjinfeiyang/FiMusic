import axios from 'axios'
import {ToastAndroid } from 'react-native'

let instance = axios.create({
  baseURL:'http://10.10.11.55:3000',
  withCredentials:true,
  headers:{
    "Content-Type": "application/json"
  }
})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  ToastAndroid.show(error.message)
  return Promise.reject(error);
});

export default {
  // 根据手机号登录
  loginByPhone(params){
    return instance.get('/login/cellphone',{params})
  },

  // 刷新登录
  refreshLogin(params){
    return instance.get('/login/refresh',{params})
  },

  // 发送手机验证码
  sendCaptcha(params){
    return instance.get('/captcha/sent',{params})
  },

  // 验证验证码
  verifyCaptcha(params){
    return instance.get('/captcha/verify',{params})
  },

  // 登出
  logout(){
    return instance.get('/logout')
  },

  // 获取用户信息
  getUserInfo(params){
    return instance.get('/user/detail',{params})
  },

  // 获取用户歌单信息
  getUserDetail(params){
    return instance.get('/user/subcount',{params})
  },

  // 获取用户歌单
  getUserPlaylist({uid}){
    return instance.get('/user/playlist',{params:{uid}})
  },

  // 获取歌单详情 即歌曲
  getPlaylistDetail({id}){
    return instance.get('/playlist/detail',{params:{id}})
  },

  // 获取歌曲url
  getSongUrl({id}){
    return instance.get('/song/url',{params:{id}})
  },

  checkSong({id}){
    return instance.get('/check/music', { params: { id } })
  },  

  getSongDetail({id}){
    return instance.get('/song/detail',{params:{id}})
  },

  getSongLyric({id}){
    return instance.get('/lyric',{params:{id}})
  },

  search({keywords,limit}){
    return instance.get('/search',{params:{keywords}})
  },

  getSongComment({id,limit,offset}){
    return instance.get('/comment/music',{params:{id,limit,offset}})
  },

  getArtistSongs({id}){
    return instance.get('/artists',{params:{id}})
  },

  getPersonalFM(){
    return instance.get('/personal_fm')
  }
}

