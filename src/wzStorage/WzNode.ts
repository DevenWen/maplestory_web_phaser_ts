import axios from 'axios'
import { Scene } from 'phaser'
import { Queue } from 'queue-typescript'

function createWzNode(curnode, parent: WzNode | null, scene: Scene = null, texture: string | null = null): WzNode 
{
	if (parent == null)
		parent = createRootWzNode(scene)

	if (typeof curnode !== 'object') return null
	if (curnode === null) return null
	if (curnode['type'] === 'uol') {
		return new UOLWzNode(scene, parent, curnode, curnode["path"])
	}

	const result = new WzNode(scene, parent, curnode, texture)
	for (let i in curnode["_keys"])
	{
		let key = curnode["_keys"][i]
		result.children.set(key, createWzNode(curnode[key], result, scene, texture))
	}
	return result
}

function createRootWzNode(scene: Scene | null): WzNode
{
	var wznode = new WzNode(scene, null, {})
	return wznode
}

/**
 * Wz 节点数据结构
 */
class WzNode {
	scene: Scene | null
	name: string
	parent: WzNode | null
	children: Map<string, WzNode> = new Map<string, WzNode>()
	data: object

	texture: string | null

	/**
	 * 构建 WzNode
	 * 
	 * @param parent 
	 * @param data 
	 */
	constructor(scene: Scene | null, parent: WzNode | null, json_data, texture: string | null = null) {
		this.scene = scene
		this.name = json_data["name"] || ""
		this.parent = parent
		this.data = json_data
		this.texture = texture
	}

	/**
	 * 合并一个 WzNode 节点
	 */
	merge(path: Queue<string>, wznode: WzNode) {
		// 假如路径存在，则合并到下一个，否则创建一个节点；
		// 到最后一个，则将 WzNode 节点写到 chilren 里去
		var nodeName = path.removeHead()
		if (nodeName == null || nodeName == wznode['name'])
		{
			wznode.parent = this
			this.children.set(wznode.name, wznode)
			return
		}
		let children = this.children.get(nodeName)
		if (children == null) {
			children = new WzNode(this.scene, this, {name: nodeName})
			this.children.set(nodeName, children)
		}
		children.merge(path, wznode)
	}

	/**
	 * 获取该节点的路径
	 */
	getPath(): string {
		var cur: WzNode = this;
		var path = '';
		while(cur !== null){
			if (path == '')
				path =  cur.name
			else
				path = cur.name + "/" + path
			cur = cur.parent
		}
		return path
	}

	getData(): object {
		return this.data
	}

	find(path: Queue<string> | string, cb: Function = (node) => {}): WzNode {
		if (typeof path === "string")
			path = new Queue<string>(...path.split("/"))

		let next = path.removeHead()
		if (next == '..') return this.parent.find(path, cb)
		if (next == '.') return this.find(path, cb)
		if (next == '') return this.find(path, cb)
		if (next == null) {
			cb(this.data, this)
			return this
		}
		
		if (this.children.has(next)) {
			return this.children.get(next).find(path, cb)
		} else {
			console.warn(
				"children no found, current node:", 
				this.getPath(), ", miss: ", next)
			return null
		}
	}
}

/**
 * 引用类节点
 */
class UOLWzNode extends WzNode {
	// 引用路径
	path: string
	constructor(scene: Scene, parent, json_data, path: string) 
	{
		super(scene, parent, json_data)
		this.path = path // 算法上会比数据多一个向上遍历
	}

	find(path: Queue<string>, cb: Function = (node) => {}): WzNode
	{
		// 引用类节点，先根据自身的 path 查找到源节点，再进行
		let next = path.removeHead()
		if (next == '' || next == null) {
			path = new Queue<string>(...this.path.split("/"))
			return this.parent.find(path, cb)
		}
		if (next == '..') return this.parent.find(path, cb)
		if (next == '.') return super.find(path, cb)
		if (next == '') return this.find(path, cb)
		if (next == null) return super.find(this.path, cb)

		console.error("wznode find error: ", next, path, this)
		return this
	}

	getRef(): WzNode
	{
		let path = new Queue<string>(...this.path.split("/"))
		return this.parent.find(path)
	}
	
}


export {WzNode, UOLWzNode, createWzNode, createRootWzNode}