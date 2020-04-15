import { AsyncStorage } from 'react-native';
import Storage from 'react-native-storage'

const _storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
})

const storage = {
  state:{

  },  
  setItem(key,value,cache=false){
    this.state[key] = value
    if(cache){
      _storage.save({
        key,
        data:value
      })
    }
  },
  getItem(key,cache=false){
    let item = this.state[key]
    // if(!item && cache){
    //   item = this.state[key] = await _storage.load({key})
    // }
    return item
  },
  async getCache(key){
    try{
      this.state[key] = await _storage.load({ key })
    }catch(err){
      this.state[key] = null
    }
    return this.state[key]
  }
}

const keys = ['account','playlist','playing','setting']

// init setters and getters
keys.forEach(item => {
  let firstLetter = item[0]
  let subfix = firstLetter.toUpperCase()+item.replace(firstLetter,'')
  storage[`get${subfix}`] = (cache) => storage.getItem(item,cache)
  storage[`set${subfix}`] = (value,cache) => storage.setItem(item,value,cache)
})

export default storage