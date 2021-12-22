import MatterJS from 'matter'
import { Game, GameObjects } from "phaser";
import { padLeft } from "~/dataload/dataloader"
import {Vector, DataLoader} from "~/dataload/DataStorage"


enum Action {
	// TODO 列举所有的 Action
}

enum PlayerPart {
	NONE = -1,
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
	cap = 1000000
	// cap = -1
	shoes = 1070003
	longcoat = 1050010
	weapon = 1302000

	// TODO 此处后期需要模块化眼睛的
	faceAction = "default"

	// TODO 动作帧
	motion: string = "walk1"
	motionIndex: integer = 0

	isPlayerOneTime: boolean = false

	// attackTypes
	flip = false

	// 对各个部位进行索引
	parts: Map<String, Phaser.GameObjects.Sprite> = new Map()

	// gameObject group 用于绘制
	container: Phaser.GameObjects.Container
	scene: Phaser.Scene
	mapCache = {}
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

	initMapCache() 
	{
		this.mapCache = {}
		var vector = Vector.init()
		this.mapCache["head/brow"] = vector
		this.mapCache["head/neck"] = vector
		this.mapCache["body/neck"] = vector
		this.mapCache["body/hand"] = vector
		this.mapCache["body/navel"] = vector
		this.mapCache["arm/navel"] = vector
		this.mapCache["arm/hand"] = vector
		this.mapCache["lhandmove"] = vector
	}

	reloadAll()
	{
		this.isPlayerOneTime = false
		// 清理这个角色的 group 对象
		this.container.removeAll(true)
		this.initMapCache()
		this.loadAll()
		this.container.list.sort((s1, s2) => s2.depth - s1.depth)
	}

	loadAll()
	{
		this.loadBody()
		this.loadHead()
		this.loadFace()
		this.loadHair()
		this.loadCap()
		this.loadLongcoat()
		this.loadShoes()
		this.loadWeapon()
	}

	addPart(texture, pos, z: string) {
		var depth = this.zmap.indexOf(z)
		var sprite = this.scene.add.sprite(pos.x, pos.y+32, texture).setOrigin(0)
		sprite.setDepth(depth)
		this.container.add(sprite)
		this.parts.set(z, sprite)
	}

	destroyPart(z: string) 
	{
		if (this.parts.has(z)) {
			let sprite = this.parts.get(z) as Phaser.GameObjects.GameObject
			this.container.remove(sprite, true)
		}
	}

	loadHead()
	{
		const headStr = padLeft(this.head, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/${headStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadCap()
	{
		// TODO 渲染帽子，同时需要隐藏头发
		if (-1 == this.cap)
		{
			return;
		}
		var capStr = padLeft(this.cap, 8, '0');
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzNode(`Character/Cap/${capStr}.img`, capRoot => {
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
					this.destroyPart("hair")
					this.destroyPart("hairOverHead")
					break
			}
		})
		DataLoader.listWzSprite(`Character/Cap/${capStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadHair()
	{
		var hairStr = padLeft(this.hair, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/Hair/${hairStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadFace()
	{
		const faceStr = padLeft(this.face, 8, '0')
		var faceAction = this.faceAction

		DataLoader.listWzSprite(`Character/Face/${faceStr}.img/${faceAction}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadBody()
	{
		var bodyStr = padLeft(this.body, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/${bodyStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadWeapon()
	{
		if (-1 == this.weapon) 
		{
			return
		}
		var imgStr = padLeft(this.weapon, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/Weapon/${imgStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadLongcoat()
	{
		if (-1 == this.longcoat)
		{
			return
		}
		var imgStr = padLeft(this.longcoat, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/Longcoat/${imgStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadCoat()
	{
		// TODO
	}

	loadPants()
	{
		// TODO
	}

	loadShoes()
	{
		if (this.shoes == -1)
		{
			return;
		}
		var shoesStr = padLeft(this.shoes, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/Shoes/${shoesStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}
}