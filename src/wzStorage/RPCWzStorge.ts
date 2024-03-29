import { Scene } from "phaser";
import { Queue } from "queue-typescript";
import {IWzStorage} from "wzStorage/IWzStorage"
import MapObject from "~/map/MapObject";
import { registerAnimationCallback } from "./AnimationLoader";
import { RES_PATHS, textureKeyChanger} from "./Utils";
import { createRootWzNode, createWzNode, WzNode, UOLWzNode } from "./WzNode";



/**
 * 
 * 远程 Wz 资源库
 * 1. 封装资源的获取
 */
class RPCWzStorage implements IWzStorage {
	private static instance: IWzStorage	

	private scene: Scene
	private rootWzNode: WzNode
	private aleardyLoaded: string[] = []
	private callbackQueue: Map<string, Array<object>> = new Map(); 

	constructor(scene: Scene) {
		RPCWzStorage.instance = this
		this.scene = scene
		this.rootWzNode = createRootWzNode(scene)
		// 构建一个 json 加载的回调函数
		this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, (key: string, type, data) => {
			console.log(`load complete: ${key}, type: ${type}`, data)
			if (!key.endsWith(".xml.json")) return

			key = key.replace(".xml.json", "")
			if (!RES_PATHS.includes(key)) return

			const textureKey = `${key}`
			this.scene.load.atlas(textureKey, `${key}.tp.png`, `${key}.tp.json`)

			this.aleardyLoaded.push(key)
			let wznode = createWzNode(data, null, this.scene, textureKey)
			this.rootWzNode.merge(new Queue<string>(...key.split("/")), wznode)
		})

		this.scene.textures.on(Phaser.Textures.Events.ADD, (loaded_texture) => {
			var callbackList = this.callbackQueue.get(loaded_texture)
			this.callbackQueue.delete(loaded_texture)
			this.execCallbackQueue(callbackList)
		})

		registerAnimationCallback(this.scene)
	}
	getMapObjectNode(path: string, cb: (wzNode: any, mapobject: MapObject) => void): void {
		this.getWzNode(path, (data, wznode) => {
			console.log("get map object node: ", data, wznode)
			// 构建一个 MapObject
			let mapobject = new MapObject(this.scene, wznode)
			cb(wznode, mapobject)
		})
	}

	public static getInstance(): IWzStorage {
		if (!RPCWzStorage.instance) {
			throw new Error("RPCWzStorage Singleton is null")
		}
		return RPCWzStorage.instance
	}

	listCanvasNode(path: string, cb: (data, img: Phaser.GameObjects.Image, imgData: object) => void): void {
		// 假如包含 action、frame 字段，表示它引用了其他的 motion 的一个帧。需要自动将引用的节点注入 wzNode 中
		this.getWzNode(path, (data, wznode) => {
			// console.log("listCanvasNode: ", wznode)
			wznode.children.forEach((wznode, key) => {
				if (!wznode) return

				if (wznode instanceof UOLWzNode) {
					// UOL 在此处会自动切换
					wznode = wznode.getRef()
				}
				// 假如不是 canvas 的 wznode, 就不显示了
				let wzdata = wznode.getData()
				if (wzdata["type"] == "canvas") {
					let imgobject = new Phaser.GameObjects.Image(this.scene, 0, 0, wznode.texture, textureKeyChanger(wznode.getPath()))
					let o_w =  wznode.getData()["_image"]["width"]
					let cur_w = imgobject.width
					let scalr = Math.floor(o_w / cur_w)
					imgobject.setScale(scalr)
					cb(data, imgobject, wzdata)
					return
				}
			})

		})
	}

	getWzCanvasNode(path: string, cb: (wzNode: WzNode, img: Phaser.GameObjects.Image) => void): void {
		this.getWzNode(path, (data, wznode) =>{
			if (!wznode) {
				console.warn("canvas wznode no found, path: " + path)
				return
			}

			if (wznode instanceof UOLWzNode) {
				wznode = wznode.getRef()
			}

			let wzdata = wznode.getData()
			if (data["type"] != "canvas") {
				console.warn("canvas wznode type error, expect canvas, but get:  " + wzdata["type"])
				return 
			}
			let imgobject = new Phaser.GameObjects.Image(this.scene, 0, 0, wznode.texture, textureKeyChanger(wznode.getPath()))
			// set scale
			let o_w =  wznode.getData()["_image"]["width"]
			let cur_w = imgobject.width
			let scalr = Math.floor(o_w / cur_w)
			imgobject.setScale(scalr)
			cb(wznode, imgobject)
			return
		})
	}

	private execCallbackQueue(list: Array<object>) {
		if(list == null) return
		list.forEach((item) => {
			this.getWzNode(item['path'], item['cb'])
		})
	}

	private isLoading(path: string, cb): boolean {
		// loadingPath 中是否有该 path
		// 假如有，构建一个回调函数，保存到队列中
		// this.loadingPath.forEach
		let iter = this.callbackQueue.keys()
		let item = iter.next()

		while(!item.done) {
			let loadingPath: string = item.value
			if (path.startsWith(loadingPath)) {
				// 正在加载中
				console.log(`add callback loading path: ${loadingPath}, path:${path}`)
				this.callbackQueue.get(loadingPath).push({path: path, cb: cb})
				return true
			}
			item = iter.next()
		}
		return false
	}

	
	getWzNode(path: string, cb: (data, wznode: WzNode) => void): WzNode {
		// TODO 
		// 好处：可以拆分 img 甚至更细的路径
		// 1. 先尝试查找
		// 2. 找不到后发起一个资源加载的请求，并将 callback 放在回调中
		//  2.2 并标识该路径正在加载中
		// 	2.3 有其他类似路径的请求，加入发现路径正在加载中，img => queue(path, callback) 写到队列中
		// 3. 向 scene 注册一个 json 加载回调
		//  3.1 回调中将 json 转为 WzNode
		//  3.2 处理 img => queue 中的所有回调
		// throw new Error("Method not implemented.");
		if (this.isLoading(path, cb)) {
			return null
		}
		let result = this.rootWzNode.find(path, cb)
		if (result == null) {
			// 执行加载
			let resPath = RES_PATHS.find((res) => path.startsWith(res))
			if (resPath == null) {
				console.warn("resouces not in RES_PATHS: ", path, "RES_PATHS: ", RES_PATHS)
				return
			}
			if (this.aleardyLoaded.includes(resPath)) {
				console.warn(`${resPath} aleardy loaded, bug ${path} no found`)
				return
			}
			console.log("is load ready: ", this.scene.load.isReady())
			this.scene.load.json(`${resPath}.xml.json`, `${resPath}.xml.json`)
			this.scene.load.start()
			var queue = new Array<object>()
			queue.push({path: path, cb: cb})
			this.callbackQueue.set(resPath, queue)
			console.log("try to loading: ", resPath)
			return 
		}
		return result
	}
}


export default RPCWzStorage