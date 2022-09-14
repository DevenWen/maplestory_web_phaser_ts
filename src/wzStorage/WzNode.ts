
import { Queue } from 'queue-typescript'

function createWzNode(curnode, parent: WzNode | null): WzNode 
{
	if (typeof curnode !== 'object') return null
	if (curnode === null) return null
	if (curnode['type'] === 'uol') {
		return new UOL(parent, curnode, curnode["path"])
	}

	const result = new WzNode(parent, curnode)
	for (let i in curnode["_keys"])
	{
		let key = curnode["_keys"][i]
		result.children.set(key, createWzNode(curnode[key], result))
	}
	return result
}

/**
 * Wz 节点数据
 */
class WzNode {
	name: string
	parent: WzNode | null
	children: Map<string, WzNode> = new Map<string, WzNode>()
	data: object

	/**
	 * 构建 WzNode
	 * 
	 * @param parent 
	 * @param data 
	 */
	constructor(parent, json_data) {
		this.name = json_data["name"]
		this.parent = parent
		this.data = json_data
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

	find(path: Queue<string> | string, cb: Function): WzNode {
		if (typeof path === "string")
			path = new Queue<string>(...path.split("/"))

		let next = path.removeHead()
		if (next == '..') return this.parent.find(path, cb)
		if (next == '.') return this.find(path, cb)
		if (next == '') return this.find(path, cb)
		if (next == null) {
			cb(this.data)
			return this
		}
		
		if (this.children.has(next)) {
			return this.children.get(next).find(path, cb)
		} else {
			console.warn("children no found: ", this.name, next)
			// 假如找不到，应该执行 RPC 获取数据
			return null
		}
	}
}

/**
 * 引用类节点
 */
class UOL extends WzNode {
	// 引用路径
	path: string
	constructor(parent, json_data, path: string) 
	{
		super(parent, json_data)
		this.path = path // 算法上会比数据多一个向上遍历
	}

	find(path: Queue<string>, cb: Function): WzNode
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
}


export {WzNode, createWzNode}