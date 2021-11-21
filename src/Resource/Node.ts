// TODO 重写文件读取

class UOL 
{
	name: string
	parent: Node | undefined
	path: string

	constructor(name: string, parent: Node, path: string) 
	{
		this.name = name
		this.parent = parent
		this.path = path
	}

	getPath(): string
	{
		var cur: UOL | Node | undefined
		cur = this

		var path = '';
		do {
			path = cur.name + '/' + path;
			cur = cur.parent
		} while (cur !== undefined)
		
		return path
	}
}


export class Node 
{
	// TODO 重写数据节点
	name: string
	parent: Node
	_keys: []

	constructor(name: string, parent: Node)
	{
		this.name = name
		this.parent = parent
		this._keys = []
	}

	forEach(callback: Function) {
		for (var i = 0; i < this._keys.length; i++)
		{
			var key = this._keys[i]
			callback(this[key], key, i)
		}
	}
	

}