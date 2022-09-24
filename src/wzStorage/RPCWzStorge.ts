import { Scene } from "phaser";
import { Queue } from "queue-typescript";
import {IWzStorage} from "wzStorage/IWzStorage"
import { createRootWzNode, createWzNode, WzNode } from "./WzNode";

const RES_PATHS = [
	"Character/00002000.img",
	"Character/00012000.img"
]


/**
 * 
 * 远程 Wz 资源库
 * 1. 封装资源的获取
 * 
 */
class RPCWzStorage implements IWzStorage {

	private scene: Scene
	private rootWzNode: WzNode
	private aleardyLoaded: string[] = []
	private callbackQueue: Map<string, Array<object>> = new Map(); 

	constructor(scene: Scene) {
		this.scene = scene
		this.rootWzNode = createRootWzNode(scene)
		// 构建一个 json 加载的回调函数
		this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, (key: string, type, data) => {
			console.log(`load complete: ${key}, type: ${type}`, data)
			if (!RES_PATHS.includes(key)) return
			this.scene.load.atlas(`${key}.texutre`, `${key}.tp.png`, `${key}.tp.json`)

			this.aleardyLoaded.push(key)
			var jsonData = this.scene.cache.json.get(key)
			let wznode = createWzNode(jsonData, null, this.scene)
			this.rootWzNode.merge(new Queue<string>(...key.split("/")), wznode)
			var callbackList = this.callbackQueue.get(key)
			this.callbackQueue.delete(key)
			this.execCallbackQueue(callbackList)
			
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

	
	getWzNode(path: string, cb: (wznode: any) => void): void {
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
			return
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
			// this.scene.load.atlas(`${resPath}.texutre`, `${resPath}.tp.png`, `${resPath}.tp.json`)
			this.scene.load.json(resPath, `${resPath}.xml.json`)
			this.scene.load.start()
			var queue = new Array<object>()
			queue.push({path: path, cb: cb})
			this.callbackQueue.set(resPath, queue)
			console.log("try to loading: ", resPath)
			return 
		}
	}
}


export default RPCWzStorage