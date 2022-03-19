import axios from 'axios'
import Phaser from 'phaser'
import {getElementFromJSON, reparseTreeAsNodes, getItemDataLocation, Node, getElementFromJSONAuto, UOL} from '../dataload/dataloader'
import game from '~/main'
import Vector = Phaser.Math. Vector2

export class DataLoader extends Phaser.Events.EventEmitter {
 
  /**
   * 获取路径上的节点，并执行回调
   * @param key 
   * @param callback 
   */
  static getWzNode(key, callback, sync?)
  {
    var imgpos = key.indexOf('.img')
    if (imgpos == -1) {
      throw 'No img found in ' + path;
    }

    // 切割路径
    var path = key.substr(0, imgpos + 4);
    var subelements = key.substr(imgpos + 5);

    // 保证 cache 中含有这个 cache，此处有可能是失败的
    // info = {state: loading/loaded, callbacks: []}
    var info = game.cache.obj.get(path)
    if (info && info.state == "loaded") {
      callback(getElementFromJSONAuto(info.img_db, subelements))
      return
    }
    // 假如没有缓存，则发起一次远程资源请求；
    if (info && info.state == "loading") {
      info.callbacks.push([callback, subelements])
      return
    }

    info = {state: "loading", callbacks: [ [callback, subelements] ], img_db: {}}
    game.cache.obj.add(path, info)
    // FIXME 后期需要改用动态配置的形式
    let json = game.cache.json.get(path)
    if (json) {
      this.do_callback(path, json, info)
      return
    }
    var xhttp = new XMLHttpRequest()
    var url = "http://localhost/assert/wz/" + path + ".xml.json"
    xhttp.open("GET", url, sync !== true)
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4) {
        console.log(`remote get ${path} success`)
        let resp = JSON.parse(xhttp.response)
        this.do_callback(path, resp, info)
      }
    }
    xhttp.send()
  }

  static do_callback(path, json, info) 
  {
    let db = reparseTreeAsNodes(json)
    for (var i = 0; i < info.callbacks.length; i++) {
      var callback = info.callbacks[i][0]
      var subelements = info.callbacks[i][1]
      callback(getElementFromJSONAuto(db, subelements))
    }
    game.cache.obj.add(path, 
      {state: "loaded", callback: [], img_db: db}
    )
  }


  /**
   * 获取路径上的图像节点，并执行回调
   * 
   * @param key 
   * @param callback 
   */
  static getWzSprite(key, callback) {
    this.getWzNode(key, (imgNode) => {
      if (!imgNode) {
        console.warn("load wz no found", key, imgNode)
        return 
      }

      if (imgNode["loaded"]) {
        callback(imgNode, imgNode["textureKey"], imgNode["z"])
        return
      }
      var uri = imgNode["_image"]["uri"]
      var textureKey = `textureKey_${imgNode.getPath()}`
      game.textures.addBase64(textureKey, 'data:image/png;base64,' + uri)

      imgNode["loaded"] = true
      imgNode["textureKey"] = textureKey
      callback(imgNode, textureKey, imgNode["z"])
    })
  }

  static listWzSprite(key, callback) {
    this.getWzNode(key, (imgNode) => {
      if (imgNode == null)
      {
        return
      }
      imgNode.forEach(img => {
        if (img instanceof UOL) {
          img = img.node()
        }
        if (!img || !img["_image"]) 
          return

        if (img["loaded"]) {
          callback(img, img["textureKey"], img["z"])
          return
        }

        var uri = img["_image"]["uri"]
        var textureKey = `textureKey_${img.getPath()}`
        game.textures.addBase64(textureKey, 'data:image/png;base64,' + uri)
        img["loaded"] = true
        img["textureKey"] = textureKey
        callback(img, textureKey, img["z"])
      });
    })
  }

  /**
   * 素材偏移计算函数
   */
  static offset(player, node) {
    // 算法来自：https://forum.ragezone.com/f923/looking-render-maplestory-gms-v83-1176964/
    let mapCache = player.mapCache
    let name = node.name
		// let origin = Vector.create(- node.origin.X, - node.origin.Y)
		let origin = new Vector(- node.origin.X, - node.origin.Y)
		let offset = new Vector(0, 0)

		if (node.map['brow']) {
			let brow = new Vector(-node.map['brow']["X"], -node.map['brow']["Y"])

			if (name == 'head') {
				mapCache["head/brow"] = brow.clone()
			}

			offset.x = origin.x + mapCache["head/neck"].x - mapCache["body/neck"].x - mapCache["head/brow"].x + brow.x
			offset.y = origin.y + mapCache["head/neck"].y - mapCache["body/neck"].y - mapCache["head/brow"].y + brow.y
		}

		if (node.map['neck']) {
      let neck = new Vector(-node.map['neck']["X"], -node.map['neck']["Y"])
			if (name == 'body') {
				mapCache["body/neck"] =  neck.clone()
			}
			if (name == 'head') {
				mapCache["head/neck"] = neck.clone()
			}
      offset.x = origin.x + mapCache["head/neck"].x - mapCache["body/neck"].x
			offset.y = origin.y + mapCache["head/neck"].y - mapCache["body/neck"].y
		}

		if (node.map['hand']) {
      let hand = new Vector(-node.map['hand']["X"], -node.map['hand']["Y"])
			if (name == 'arm') {
        mapCache["arm/hand"] = hand.clone()
			}
			if (name == 'body') {
        mapCache["body/hand"] = hand.clone()
			}
			offset.x = origin.x + hand.x + mapCache["arm/navel"].x - mapCache["arm/hand"].x - mapCache["body/navel"].x
			offset.y = origin.y + hand.y + mapCache["arm/navel"].y - mapCache["arm/hand"].y - mapCache["body/navel"].y
		}

		if (node.map['handMove']) {
      let handMove = new Vector(-node.map['handMove']["X"], -node.map['handMove']["Y"])
			if (name == 'lHand') {
        mapCache["lhandMove"] = handMove.clone()
			}

			offset.x = origin.x + handMove.x - mapCache['lhandMove'].x
			offset.y = origin.y + handMove.y - mapCache['lhandMove'].y
		}

		if (node.map['navel']) {
      let navel = new Vector(-node.map['navel']["X"], -node.map['navel']["Y"])
			if (name == 'arm') {
        mapCache["arm/navel"] = navel.clone()
			}
			if (name == 'body') {
        mapCache["body/navel"] = navel.clone()
			}

			offset.x = origin.x + navel.x - mapCache["body/navel"].x
			offset.y = origin.y + navel.y - mapCache["body/navel"].y
		}

		return offset
  }
  
}