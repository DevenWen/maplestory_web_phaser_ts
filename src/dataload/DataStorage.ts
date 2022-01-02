import axios from 'axios'
import Phaser from 'phaser'
import {getElementFromJSON, reparseTreeAsNodes, getItemDataLocation, Node, getElementFromJSONAuto, UOL} from '../dataload/dataloader'
import game from '~/main'
import { IAnimation } from '~/animation/IAnimation'
import { Animation } from '~/animation/Animation'
import { IAnimationFrame } from '~/animation/IAnimationFrame'
import { PlayerCharater } from '~/character/PlayerCharater'
export class Vector {
  x: number = 0
  y: number = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  static init(): Vector {
    return new Vector(0, 0)
  }

  static create1(src): Vector {
    return new Vector(src["X"], src["Y"])
  }

  static create(x, y): Vector {
    return new Vector(x, y)
  }

  static clone(src: Vector): Vector {
    return new Vector(src.x, src.y)
  }
}



export class DataLoader extends Phaser.Events.EventEmitter {

  static loadAnimation(imgJson)
  {
    if (imgJson == null)
      return

    var result = new Map<String, IAnimation>()
    var keys = imgJson['_keys']
    for (let i in keys) 
    {
      var frames = new Array<IAnimationFrame>()
      const key = keys[i]
      var action = imgJson[key]
      for (let frameIndex in action['_keys'])
      {
        // console.log('load action index', action, frameIndex)
        const frame = action[`${frameIndex}`]
        if (frame) {
          frames.push({
            key: key,
            frame: Number.parseInt(frameIndex),
            duration: Math.abs(frame['delay']) || 180,
            config: frame
          })
        } else {
          // only one frame
          frames.push({
            key: key,
            frame: 0,
            duration: 1000,
            config: frame
          })
          break
        }
      }

      var animation = new Animation({
        key: key,
        frames: frames,
        duration: 180
      })
      result.set(key, animation)
    }
    return result
  }

  static loadBodyAnimation()
  {
    // 加载body的 img 数据
    // 解析数据成为 animation 
    // 写到 game.cache.json 中
    const actionJson = game.cache.json.get('body')
    var result = this.loadAnimation(actionJson)
    console.log('success load animation, ', result)
    game.cache.obj.add("bodyAnimation", result)
  }

  static loadFaceAnimation()
  {
    const actionJson = game.cache.json.get('face')
    var result = this.loadAnimation(actionJson)
    console.log('success load face animation', result)
    game.cache.obj.add("faceAnimation", result)
  }

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

    // 保证 cache 中含有这个 cache，此处有可能是失败的
    var img_db = game.cache.obj.get(path)
    // 假如没有缓存，则发起一次远程资源请求；
    if (img_db == "loading") {
      return
    }
    if (img_db) {
      callback(getElementFromJSONAuto(img_db, subelements))
    } else {
      game.cache.obj.add(path, "loading")
      // FIXME 后期需要改用动态配置的形式
      axios.get("http://localhost/assert/wz/" + path + ".xml.json")
        .then(data => {
                console.log("load finish", path, data.status)
                var db = reparseTreeAsNodes(data.data)
                game.cache.obj.add(path, db)
        })
    }
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
  static offset(player: PlayerCharater, node) {
    // 算法来自：https://forum.ragezone.com/f923/looking-render-maplestory-gms-v83-1176964/
    let mapCache = player.mapCache
    let name = node.name
		let origin = Vector.create(- node.origin.X, - node.origin.Y)
		let offset = new Vector(0, 0)

		if (node.map['brow']) {
			let brow = Vector.create(-node.map['brow']["X"], -node.map['brow']["Y"])

			if (name == 'head') {
				mapCache["head/brow"] = Vector.clone(brow)
			}

			offset.x = origin.x + mapCache["head/neck"].x - mapCache["body/neck"].x - mapCache["head/brow"].x + brow.x
			offset.y = origin.y + mapCache["head/neck"].y - mapCache["body/neck"].y - mapCache["head/brow"].y + brow.y
		}

		if (node.map['neck']) {
      let neck = Vector.create(-node.map['neck']["X"], -node.map['neck']["Y"])
			if (name == 'body') {
				mapCache["body/neck"] = Vector.clone(neck)
			}
			if (name == 'head') {
				mapCache["head/neck"] = Vector.clone(neck)
			}
      offset.x = origin.x + mapCache["head/neck"].x - mapCache["body/neck"].x
			offset.y = origin.y + mapCache["head/neck"].y - mapCache["body/neck"].y
		}

		if (node.map['hand']) {
      let hand = Vector.create(-node.map['hand']["X"], -node.map['hand']["Y"])
			if (name == 'arm') {
        mapCache["arm/hand"] = Vector.clone(hand)
			}
			if (name == 'body') {
        mapCache["body/hand"] = Vector.clone(hand)
			}
			offset.x = origin.x + hand.x + mapCache["arm/navel"].x - mapCache["arm/hand"].x - mapCache["body/navel"].x
			offset.y = origin.y + hand.y + mapCache["arm/navel"].y - mapCache["arm/hand"].y - mapCache["body/navel"].y
		}

		if (node.map['handMove']) {
      let handMove = Vector.create(-node.map['handMove']["X"], -node.map['handMove']["Y"])
			if (name == 'lHand') {
        mapCache["lhandMove"] = Vector.clone(handMove)
			}

			offset.x = origin.x + handMove.x - mapCache['lhandMove'].x
			offset.y = origin.y + handMove.y - mapCache['lhandMove'].y
		}

		if (node.map['navel']) {
      let navel = Vector.create(-node.map['navel']["X"], -node.map['navel']["Y"])
			if (name == 'arm') {
        mapCache["arm/navel"] = Vector.clone(navel)
			}
			if (name == 'body') {
        mapCache["body/navel"] = Vector.clone(navel)
			}

			offset.x = origin.x + navel.x - mapCache["body/navel"].x
			offset.y = origin.y + navel.y - mapCache["body/navel"].y
		}

		return offset
  }
  
}