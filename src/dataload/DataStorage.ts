import axios from 'axios'
import Phaser from 'phaser'
import {getElementFromJSON, reparseTreeAsNodes, getItemDataLocation, Node} from '../dataload/dataloader'
import WzSprite from './WzSprite'
import * as CryptoJS from "crypto-js";

export default class DataLoader {

  private game: Phaser.Game
  private wz_datas: Phaser.Cache.BaseCache
  private textures: Phaser.Textures.TextureManager

  constructor(game : Phaser.Game, textures : Phaser.Textures.TextureManager) {
    this.game = game
    this.wz_datas = game.cache.json
    this.textures = textures
  }

  getDataNode(key, callback) {
    // TODO 在并发环境下，此处并没有做到安全加载。
    var imgpos = key.indexOf('.img')
    if (imgpos == -1) {
      throw 'No img found in ' + key
    }

    var path = key.substr(0, imgpos + 4)
    var subelements = key.substr(imgpos + 5)

    if (this.wz_datas.has(path)) {
      console.log("get from cache:", path)
      var info = this.wz_datas.get(path)
      callback(getElementFromJSON(info, subelements))
    } else {
      console.log("get from server:", path)
      var cache = this.wz_datas
      axios.get(`http://127.0.0.1:8082/${path}.xml`)
      .then(function (response) {
        console.log(`load ${path}, get:`, response)
        var info = reparseTreeAsNodes(response.data) 
        cache.add(path, info)
        callback(getElementFromJSON(info, subelements))
      })
    }
  }

  /**
   * 获取 itemid 的数据
   * 
   * @param itemid 
   * @param subelement 
   * @param callback 
   * @returns 
   */
  getItemDataNode(itemid, subelement, callback) {
    var path = getItemDataLocation(itemid)
    return this.getDataNode(path + subelement, function(obj) {
      if (obj !== null) {
        obj['ITEMID'] = itemid
      }
      callback(obj)
    })
  }

  /**
   * 根据 Node 获取，或构建一个 Sprite
   * @param node 
   */
  getOrCreateSprite(node: Node): WzSprite | null {
    if (!node['_image']) {
      console.error('Got node that is not an image')
      return null
    }

    if (node['wz_sprite']) {
      return node['wz_sprite']
    }

    var origin = {
      x : node['origin'] ? node['origin']['X'] : 0,
      y : node['origin'] ? node['origin']['Y'] : 0
    }

    var uri_base64 = node['_image']['uri']
    var texture_key = CryptoJS.MD5(uri_base64).toString()
    // ensure Texture
    if (!this.textures.exists(texture_key) ) {
      console.log("add new textures", texture_key)
      var image = new Image()
      image.src = 'data:image/png;base64,' + uri_base64
      this.textures.addImage(texture_key, image)
    }

    var sprite = new WzSprite(texture_key, 
      node['_image']['width'], node['_image']['height'], origin.x, origin.y)
    node['wz_sprite'] = sprite

    return node['wz_sprite']
  }

}