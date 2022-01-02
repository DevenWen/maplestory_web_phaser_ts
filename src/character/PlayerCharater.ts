import MatterJS from 'matter'
import { Game, GameObjects } from "phaser";
import { CreateAnimData } from '~/animation/CreateAnimData';
import { padLeft } from "~/dataload/dataloader"
import {Vector, DataLoader} from "~/dataload/DataStorage"
import { AnimatedSprite } from './AnimatedSprite';
import { IAnimatedSprite } from './IAnimatedSprite';
import { IAnimationPlayConfig } from './IAnimationPlayerConfig';
import { IPlayerCharater } from './IPlayerCharater';


export class PlayerCharater 
	extends Phaser.GameObjects.Container 
	implements 
		IPlayerCharater,
		Phaser.GameObjects.Components.Flip
{
	// 玩家类型
	skin = 0
	head = 12000
	body_ = 2000
	face = 20000
	hair = 30000
	cap = 1000000
	shoes = 1070003
	coat = 1040000
	pants = 1060000
	longcoat = -1
	weapon = 1302000

	// face = -1
	// hair = -1
	// cap = -1
	// shoes = -1
	// coat = -1
	// pants = -1
	// longcoat = -1
	// weapon = -1


	// TODO 此处后期需要模块化眼睛的
	faceAction = "default"
	faceIndex = 0

	// TODO 动作帧
	motion: string = "walk1"
	motionIndex: integer = 0

	bodyAnima?: IAnimatedSprite;
	faceAnima?: IAnimatedSprite;

	// 对各个部位进行索引
	private parts: Map<String, Phaser.GameObjects.Sprite> = new Map()
	mapCache = {}
	destroyPartKey = new Set<String>()
	private zmap = []

	constructor(scene: Phaser.Scene) {
		super(scene)
		this.zmap = scene.cache.json.get("zmap")["_keys"]
		this.setSize(32, 64)
		scene.matter.add.gameObject(this)
		scene.add.existing(this)
	}

	do_animation(action: string, animationConfig: IAnimationPlayConfig = {}) {
		if (this.bodyAnima)
		{
			this.bodyAnima.changeAnimaiton(action, animationConfig)
		}
	}

	do_face_animation(action: string, animationConfig: IAnimationPlayConfig = {}) {
		if (this.faceAnima)
		{
			this.faceAnima.changeAnimaiton(action, animationConfig)
		}
	}

	flipX: boolean = true;
	flipY: boolean = false; // no use
	
	toggleFlipX(): this {
		this.flipX = !this.flipX
		return this
	}
	toggleFlipY(): this {
		return this
	}
	setFlipX(value: boolean): this {
		this.flipX = value
		return this	
	}
	setFlipY(value: boolean): this {
		return this
	}
	setFlip(x: boolean, y: boolean): this {
		this.flipX = x
		return this
	}
	resetFlip(): this {
		this.flipX = false
		return this
	}

	initMapCache() 
	{
		this.mapCache = {}
		this.destroyPartKey.clear()
		var vector = Vector.init()
		this.mapCache["head/brow"] = vector
		this.mapCache["head/neck"] = vector
		this.mapCache["body/neck"] = vector
		this.mapCache["body/hand"] = vector
		this.mapCache["body/navel"] = vector
		this.mapCache["arm/navel"] = vector
		this.mapCache["arm/hand"] = vector
		this.mapCache["lhandMove"] = vector
	}

	updateAnimation()
	{
		// 清理这个角色的 group 对象
		this.removeAll(true)
		this.initMapCache()
		this.loadAll()
		this.list.sort((s1, s2) => s2.depth - s1.depth)
	}

	loadAll()
	{
		this.loadBody()
		this.loadHead()
		this.loadFace()
		this.loadDefault('Hair', this.hair)
		this.loadCap()
		this.loadDefault('Longcoat', this.longcoat)
		this.loadDefault('Coat', this.coat)
		this.loadDefault('Pants', this.pants)
		this.loadDefault('Shoes', this.shoes)
		this.loadDefault('Weapon', this.weapon)
	}

	private addPart(texture, pos, z: string) {
		if (this.destroyPartKey.has(z))
		{
			return
		}

		var depth = this.zmap.indexOf(z)
		const flip_ = this.flipX ? -1 : 1
		// 这是用来调整的3个像素点
		const adjx = this.flipX ? -3 : 0

		var sprite = this.scene.add.sprite(pos.x * flip_ + adjx, pos.y+32, texture)
			.setFlipX(this.flipX)
			.setOrigin(this.flipX ? 1 : 0, 0)
			.setDepth(depth)

		this.add(sprite)
		this.parts.set(z, sprite)
	}

	destroyPart(z: string) 
	{
		if (this.parts.has(z)) {
			let sprite = this.parts.get(z) as Phaser.GameObjects.GameObject
			this.remove(sprite, true)
		}
		this.destroyPartKey.add(z)
	}

	loadHead()
	{
		const headStr = padLeft(this.head, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/${headStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
			if (z == 'backHead') {
				this.destroyPart('face')
				// 后面也需要去除脸饰
			}
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
		this.loadDefault('Cap', this.cap)
	}

	loadFace()
	{
		const faceStr = padLeft(this.face, 8, '0')
		var faceAction = this.faceAction

		if (faceAction === 'default') {
			DataLoader.listWzSprite(`Character/Face/${faceStr}.img/${faceAction}`, (img, textureKey, z) => {
				var pos = DataLoader.offset(this, img)
				this.addPart(textureKey, pos, z)
			})
		} else {
			var faceIndex = this.faceIndex
			DataLoader.listWzSprite(`Character/Face/${faceStr}.img/${faceAction}/${faceIndex}`, (img, textureKey, z) => {
				var pos = DataLoader.offset(this, img)
				this.addPart(textureKey, pos, z)
			})
		}
	}

	loadBody()
	{
		var bodyStr = padLeft(this.body_, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.listWzSprite(`Character/${bodyStr}.img/${motion}/${motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}

	loadDefault(part: String, img: number)
	{
		if (img == -1) 
			return

		var imgStr = padLeft(img, 8, '0')
		DataLoader.listWzSprite(`Character/${part}/${imgStr}.img/${this.motion}/${this.motionIndex}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
	}
}