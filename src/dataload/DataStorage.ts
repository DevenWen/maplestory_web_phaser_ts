import axios from 'axios'
import Phaser from 'phaser'
import {getElementFromJSON, reparseTreeAsNodes, getItemDataLocation, Node, getElementFromJSONAuto} from '../dataload/dataloader'
import game from '~/main'

export default class DataLoader {

  /**
   * 获取路径上的节点，并执行回调
   * @param key 
   * @param callback 
   */
  static getWzNode(key, callback)
  {
    var imgpos = key.indexOf('.img')
    if (imgpos == -1) {
      throw 'No img found in ' + path;
    }

    // 切割路径
    var path = key.substr(0, imgpos + 4);
    var subelements = key.substr(imgpos + 5);

    // FIXME 保证 cache 中含有这个 cache，此处有可能是失败的
    var img_db = game.cache.obj.get(path)
    callback(getElementFromJSONAuto(img_db, subelements))
  }


  /**
   * 获取路径上的图像节点，并执行回调
   * 
   * @param key 
   * @param callback 
   */
  static getWzSprite(key, callback) {
    this.getWzNode(key, (imgNode) => {
      if (!imgNode) return 

      if (imgNode["loaded"]) {
        callback(imgNode, imgNode["textureKey"], imgNode["z"])
        return
      }
      var uri = imgNode["_image"]["uri"]
      var textureKey = `textureKey_${imgNode.getPath()}`
      game.textures.addBase64(textureKey, 'data:image/png;base64,' + uri)
      imgNode["loaded"] = true
      imgNode["textureKey"] = textureKey
      callback(imgNode, textureKey)
    })
  }
  
}