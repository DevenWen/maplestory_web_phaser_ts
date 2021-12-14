import { GameObjects } from "phaser";
import { padLeft } from "~/dataload/dataloader"
import DataLoader from "~/dataload/DataStorage"

class Vector {
	x;y;

	static create(wz_vector) {
		var r = new Vector()
		r.x = wz_vector["X"]; r.y = wz_vector["Y"]
		return r
	}
}

enum Action {
	// TODO 列举所有的 Action
}

enum PlayerPart {
	BODY = 0,
	ARM = 1,
	HEAD = 2,
	HAIR1 = 3,
	HAIR2 = 4,
	CAP = 5,
	FACE = 6,
	SHOES = 7,
	LONGCOAT = 8,
	MAILARM = 9,
	WEAPON = 10
}

export class Player
{
	// 玩家类型
	skin = 0
	head = 12000
	body = 2000
	face = 20000
	hair = 30000
	// cap = 1002357
	cap = -1
	shoes = 1070003
	longcoat = 1050010
	weapon = 1332076

	// TODO 此处后期需要模块化眼睛的
	faceAction = "default"

	// TODO 动作帧
	motion: string = "walk1"
	motionIndex: integer = 0

	isPlayerOneTime: boolean = false

	// attackTypes
	flip = false


	// 对各个部位进行索引
	parts = []

	// gameObject group 用于绘制
	container: Phaser.GameObjects.Container
	scene: Phaser.Scene

	zmap = []


	init()
	{

	}

	constructor(scene: Phaser.Scene) {
		this.container = scene.add.container(400,300) // TODO Player localtion, 后面会修改
		this.scene = scene
		this.zmap = scene.cache.json.get("zmap")["_keys"]
	}

	setPos(x, y)
	{
		this.container.setX(x)
		this.container.setY(y)
	}

	update(ts)
	{
		// TODO
		this.changeMotion(this.motion, true)
	}

	changeMotion(motion: string, onetime: boolean)
	{
		this.reloadAll()
	}

	reloadAll()
	{
		this.isPlayerOneTime = false
		// 清理这个角色的 group 对象
		this.container.removeAll(true)
		this.loadAll()
	}

	loadAll()
	{
		// 无武器状态
		this.loadBody()
	}

	addPart(texture, pos, part: PlayerPart, z: string, depth?: number) {
		depth = 200 - this.zmap.indexOf(z)

		var sprite = this.scene.add.sprite(pos.x, pos.y + 32, texture).setOrigin(0)
		if (depth)
			// FIXME depth 并没有生效
			sprite.setDepth(depth)
		this.container.addAt(sprite, part)
	}

	destroyPart(part: PlayerPart) 
	{
		this.container.removeAt(part)
	}

	loadHead(bodyNode)
	{
		const headStr = padLeft(this.head, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex

		DataLoader.getWzSprite(`${headStr}.img/${motion}/${motionIndex}/head`, (headNode, textureKey, z) => {
		
			var headOrigin = Vector.create(headNode['origin'])
			var headNeck = Vector.create(headNode['map']['neck'])
			var bodyNeck = Vector.create(bodyNode['map']['neck'])
			var pos = {
				x: - headOrigin.x - headNeck.x + bodyNeck.x, 
				y: -(headOrigin.y + headNeck.y - bodyNeck.y)
			}

			// FIXME 这种通过大量创建 Sprite，然后销毁的方式会引起比较大的性能消耗，是否可以考虑生成纸娃娃的所有动作数据，然后直接被使用。
			// 这样的好处是生成一次动画，可以被重复使用。Think about it
			// 绘制头型
			this.addPart(textureKey, pos, PlayerPart.HEAD, z)

			// 判断动作是否是背身，背身不用绘制
			// 绘制脸型
			this.loadFace(bodyNode, headNode)
			this.loadHair1(bodyNode, headNode)
			this.loadHair2(bodyNode, headNode)
			this.loadCap(bodyNode, headNode)
		})
		
	}

	loadCap(bodyNode, headNode)
	{
		// TODO 渲染帽子，同时需要隐藏头发
		if (-1 == this.cap)
		{
			return;
		}
		var capStr = padLeft(this.cap, 8, '0');
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzNode(`Cap/${capStr}.img`, capRoot => {
			let overType = capRoot["info"]["vslot"]
			// TODO 整体的顺序可以参考 zmap
			switch(overType)
			{
				case "CpH5":
					// TODO 在头发最下面，不遮挡头发,层次调整最下面
					break
				case "CpH1H5":
					// TODO 
					break
				default:
					// 删除头发1
					// 删除头发2
					this.destroyPart(PlayerPart.HAIR1)
					this.destroyPart(PlayerPart.HAIR2)
					break
			}
		})

		DataLoader.getWzSprite(`Cap/${capStr}.img/${motion}/${motionIndex}/default`, (capRoot, textureKey, z) => {
			var bodyNeck = Vector.create(bodyNode['map']['neck'])
			var headNeck = Vector.create(headNode['map']['neck'])

			var origin = Vector.create(capRoot['origin'])
			var headBrow = Vector.create(headNode['map']['brow'])
			var brow = Vector.create(capRoot['map']['brow'])
			var pos = {
				x: origin.x + headNeck.x - bodyNeck.x - headBrow.x + brow.x,
				y: origin.y + headNeck.y - bodyNeck.y - headBrow.y + brow.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.CAP, z)
		})
	}

	loadHair2(bodyNode, headNode)
	{
		// TODO 

	}

	loadHair1(bodyNode, headNode)
	{
		var hairStr = padLeft(this.hair, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		// TODO 注意区分背面，正面的差异
		DataLoader.getWzSprite(`Hair/${hairStr}.img/${motion}/${motionIndex}/hair`, (hairNode, textureKey, z) => {
			// TODO 不一定是 hair，还有多种 hair
			// console.log(hairNode)
			// brow 类型的偏移
			var bodyNeck = Vector.create(bodyNode['map']['neck'])
			var headNeck = Vector.create(headNode['map']['neck'])

			var origin = Vector.create(hairNode['origin'])
			var headBrow = Vector.create(headNode['map']['brow'])
			var brow = Vector.create(hairNode['map']['brow'])
			var pos = {
				x: origin.x + headNeck.x - bodyNeck.x - headBrow.x + brow.x,
				y: origin.y + headNeck.y - bodyNeck.y - headBrow.y + brow.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.HAIR1, z)


		})


	}

	loadFace(bodyNode, headNode)
	{
		const faceStr = padLeft(this.face, 8, '0')
		var faceAction = this.faceAction
		// TODO face 动画没处理
		DataLoader.getWzSprite(`Face/${faceStr}.img/${faceAction}/face`, (imageNode, textureKey, z) => {
			var bodyOrigin = Vector.create(bodyNode['origin'])
			var bodyNeck = Vector.create(bodyNode['map']['neck'])
			var headNeck = Vector.create(headNode['map']['neck'])

			var headOrigin = Vector.create(headNode['origin'])
			var faceOrigin = Vector.create(imageNode['origin'])
			var headBrow = Vector.create(headNode['map']['brow'])
			var faceBrow = Vector.create(imageNode['map']['brow'])
			var pos = {
				x: faceOrigin.x + headNeck.x - bodyNeck.x - headBrow.x + faceBrow.x,
				y: faceOrigin.y + headNeck.y - bodyNeck.y - headBrow.y + faceBrow.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.FACE, z)
		})
	}

	loadBody()
	{
		var bodyStr = padLeft(this.body, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`${bodyStr}.img/${motion}/${motionIndex}/body`, (bodyNode, textureKey, z) => {
			var bodyOrigin = Vector.create(bodyNode['origin'])
			var pos = {
				x: - bodyOrigin.x,
				y: - bodyOrigin.y
			}
			this.addPart(textureKey, pos, PlayerPart.BODY, z)

			// 绘制手臂
			this.loadArm(bodyNode)

			// 绘制鞋子
			this.loadShoes(bodyNode)

			// 绘制裤子
			this.loadPants(bodyNode)
			// 绘制上衣
			this.loadCoat(bodyNode)
			// 绘制长 Coat
			this.loadLongcoat(bodyNode)

			

			// 绘制头部
			this.loadHead(bodyNode)
		})

	}

	loadWeapon(bodyNode, armNode)
	{
		if (-1 == this.weapon) 
		{
			return
		}
		var imgStr = padLeft(this.weapon, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`Weapon/${imgStr}.img/${motion}/${motionIndex}/weapon`, (node, textureKey, z) => {
			var origin = Vector.create(node['origin'])
			var bodyNavel = Vector.create(bodyNode['map']['navel'])
			var hand = Vector.create(node['map']['hand'])
			var armHand = Vector.create(armNode['map']['hand'])
			var armNavel = Vector.create(armNode['map']['navel'])
			var pos = {
				x: origin.x + hand.x + armNavel.x - armHand.x - bodyNavel.x,
				y: origin.y + hand.y + armNavel.y - armHand.y - bodyNavel.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.WEAPON, z, 10)
		})

		
	}

	loadLongcoat(bodyNode)
	{
		if (-1 == this.longcoat)
		{
			return
		}
		var imgStr = padLeft(this.longcoat, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`Longcoat/${imgStr}.img/${motion}/${motionIndex}/mail`, (node, textureKey, z) => {
			var origin = Vector.create(node['origin'])
			var bodyNavel = Vector.create(bodyNode['map']['navel'])
			var navel = Vector.create(node['map']['navel'])
			var pos = {
				x: origin.x + navel.x - bodyNavel.x,
				y: origin.y + navel.y - bodyNavel.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.LONGCOAT, z)
		})

		DataLoader.getWzSprite(`Longcoat/${imgStr}.img/${motion}/${motionIndex}/mailArm`, (node, textureKey, z) => {
			var origin = Vector.create(node['origin'])
			var bodyNavel = Vector.create(bodyNode['map']['navel'])
			var navel = Vector.create(node['map']['navel'])
			var pos = {
				x: origin.x + navel.x - bodyNavel.x,
				y: origin.y + navel.y - bodyNavel.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.MAILARM, z)
		})
	}

	loadCoat(bodyNode)
	{
		// TODO
	}

	loadPants(bodyNode)
	{
		// TODO
	}

	loadShoes(bodyNode)
	{
		if (this.shoes == -1)
		{
			return;
		}

		var shoesStr = padLeft(this.shoes, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`Shoes/${shoesStr}.img/${motion}/${motionIndex}/shoes`, (node, textureKey, z) => {
			var origin = Vector.create(node['origin'])
			var bodyNavel = Vector.create(bodyNode['map']['navel'])
			var navel = Vector.create(node['map']['navel'])
			var pos = {
				x: origin.x + navel.x - bodyNavel.x,
				y: origin.y + navel.y - bodyNavel.y
			}
			pos.x = - pos.x
			pos.y = - pos.y
			this.addPart(textureKey, pos, PlayerPart.SHOES, z)

		})

	}

	loadArm(bodyNode)
	{
		var bodyStr = padLeft(this.body, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`${bodyStr}.img/${motion}/${motionIndex}/arm`, (armNode, textureKey, z) => {
			var armOrigin = Vector.create(armNode['origin'])
			var armNavel = Vector.create(armNode['map']['navel'])
			var bodyNavel = Vector.create(bodyNode['map']['navel'])
			// 此处不会有 bodyOrigin，因为 body Origin 就是默认的
			var pos = {
				x: bodyNavel.x - armNavel.x - armOrigin.x,
				y: bodyNavel.y - armNavel.y - armOrigin.y
			}
			this.addPart(textureKey, pos, PlayerPart.ARM, z, 1)

			// TODO 加上 CoatArm

			// 绘制武器
			this.loadWeapon(bodyNode, armNode)
		})

	}





	

}