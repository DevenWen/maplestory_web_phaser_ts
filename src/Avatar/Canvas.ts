class Action 
{
	name;
	level;
	enable;
	order;
}

class Point
{
	x;
	y;
}

class ActionFrame
{
	face?: boolean
	flip?: boolean
	move?: Point
	rotate?: integer
	rotateProp?: integer

	// 忽略骑宠
}

class AvatarPart
{
	node;
	islot?: string
	visible;
	icon
	id

	constructor(wz_node)
	{
		this.node = wz_node
		this.visible = true
		this.loadInfo()
	}

	private loadInfo() {
		var info_node = this.node["info"]
		if (!info_node) {
			return
		}

		// 缺 islot、icon 的info信息获取
	}

}


class Bone
{
	name
	position?: Point
	skins?: [] // Skin
	group = "Character"

	// Tree 状结构的骨骼模型
	parent?: Bone// Bons
	children: Array<Bone> = [] // Bone

	findChild(name: string): Bone | null
	{
		for (let i = 0; i < this.children.length; i++) {
			const element = this.children[i];
			if (element.name == name) return element
			let result = element.findChild(name)
			if (result != null) {
				return result
			}
		}
		return null
	}

	// 设置父节点，同时建立父子双向关系
	set_parent(bone: Bone)
	{
		let old = this.parent
		if (old != bone) 
		{
			if (old != null)
			{
				let index = old.children.indexOf(this)
				if (index != -1)
					delete old.children[index]
			}
			if (bone != null)
			{
				bone.children.push(this)
			}
			this.parent = bone
		}
	}
}

class Entry
{

}

class Skin 
{
	// 蒙皮
	name?: string
	image?
	offset?: Point
	z
	zindex

	set_image(uri)
	{
		let image = new Image()
		image.src = 'data:image/png;base64,' + uri
	}

}

const baseActions: Array<String> = [
	"walk1", "walk2", "stand1", "stand2", "alert",
	"swingO1", "swingO2", "swingO3", "swingOF",
	"swingT1", "swingT2", "swingT3", "swingTF",
	"swingP1", "swingP2", "swingPF",
	"stabO1", "stabO2", "stabOF", "stabT1", "stabT2", "stabTF",
	"shoot1", "shoot2", "shootF",
	"proneStab", "prone",
	"heal", "fly", "jump", "sit", "ladder", "rope"
]

export class AvatarCanvas 
{

	zmap: Array<string> = []
	parts: Array<AvatarPart> = []
	actions: Array<Action> = []
	emotions: Array<string> = []
	actionName
	hairConver?: boolean
	showHairShade?: boolean

	weaponIndex?: integer
	weaponType?: integer =0
	earType?: integer = 0

	body;head;

	loadz(wz_node)
	{
		var l = wz_node['_keys']
		l.forEach(item => {
			this.zmap.push(item)
		});
	}

	// 加载所有的动作名称 00002001.img
	loadActions(wz_node): boolean
	{
		if (!wz_node)
		{
			console.warn("loadactions fail")
			return false
		}
		var bodyNode = wz_node
		this.actions = []

		var ignore = ["name", "_keys", "info"]
		for (var key in bodyNode)
		{
			if (ignore.includes(key))
				continue
			let actionNode = bodyNode[key]
			var action = this.loadAction(actionNode)
			this.actions.push(action)
		}

		// FIXEM 此处源码需要排序，但不理解
		return true
	}

	// 加载表情 00020000.img
	loadEmotions(wz_node): boolean
	{
		this.emotions = []
		for (var key in wz_node) {
			if (!(key in ['name', '_keys', 'info']))
			{
				this.emotions.push(wz_node[key])
			}
		}
		return true
	}

	loadAction(actionNode): Action
	{
		console.log("try to load ", actionNode)
		if ("0" in actionNode)
		{
			var action = this.loadActionFromNode(actionNode)
			return action
		} else
		{
		// FIXME 其他路径加载
		return new Action()
		}
	}

	loadActionFromNode(actionNode): Action
	{
		var act = new Action()
		act.name = actionNode["name"]
		if (act.name in baseActions)
		{
			act.level = 0 // 基础动作
		}
		else
		{
			if ("action" in actionNode && "frame" in actionNode)
			{
				act.level = 2 // 应用动作
			} 
			else
			{
				act.level = 1 // 扩展动作
			}
		}
		return act
	}

	addPart(imgNode): AvatarPart
	{
		var part = new AvatarPart(imgNode)
		


		return part
	}

	

}