import { Scene } from "phaser"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite
import { AvatarPart, depthOf_Z } from './AvatarConst'
import RPCWzStorage from "~/wzStorage/RPCWzStorge"
import Vector = Phaser.Math.Vector2
import { CharacterPart } from "../Player"

const OO = new Vector()

enum AvatarEvent {
	TIMER_ONE_SECOND = "timer",
	POSITION_CHANGE = "position_change",
	FLIP_CHANGE = "flip_change",
	ANIMATION_UPDATE_COMPLETE = "animation_update_complete"

}

class Face extends Sprite
{
	private parent: Avatar
	private container: Container
	private currentFrame: Phaser.Animations.AnimationFrame
	private nextBlink: integer = 0
	private hide: boolean = false

	constructor(scene: Scene, parent: Avatar)
	{
		super(scene, 0, 0, "")
		this.parent = parent
		this.container = scene.add.container(parent.x, parent.y)
		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
		)
		
		this.parent.addListener(
			AvatarEvent.POSITION_CHANGE,
			(self) => {
				this.container.setX(self.x) 
				this.container.setY(self.y)
			}
		)

		// 监听动作变更，变更完成后，需要重新绘制表情
		this.parent.addListener(
			AvatarEvent.ANIMATION_UPDATE_COMPLETE,	
			(self) => {this.animationUpdateCallback(null, this.currentFrame)}
		)

		// auto blink
		this.parent.addListener(
			AvatarEvent.ANIMATION_UPDATE_COMPLETE,
			(self) => {
				if (scene.time.now > this.nextBlink && 
					this.currentFrame && 
					this.currentFrame.textureKey.endsWith("default"))
				{
					this.parent.facePlay("blink")
					this.nextBlink = scene.time.now + Math.floor(Math.random()*7000)
				}
			}
		)
		this.addedToScene()
	}

	private animationUpdateCallback(
		animation: Phaser.Animations.Animation, 
		frame: Phaser.Animations.AnimationFrame)
	{
		this.container.removeAll(true)
		if (!frame || this.hide) return
		this.currentFrame = frame

		RPCWzStorage.getInstance().listCanvasNode(
			`Character/Face/${this.currentFrame.textureKey}`,
			(wznode, img) => {
				let position = this.parent.calOrigin(wznode)
				img = this.parent.calfinallyPosition(wznode, position, img)
				this.container.add(img)
				// TODO 暂时无法处理头发遮挡逻辑
			}
		)
	}

	public setHide(value: boolean) {this.hide = value}

}

/**
 * 纸娃娃对象
 */
class Avatar extends Sprite
{
	/**
	 * 纸娃娃粘贴容器
	 */
	public container: Container
	public face: Face

	/**
	 * 动作
	 */
	public motion: string
	/**
	 * 动作帧
	 */
	public motionIndex: string

	/**
	 * 上一次坐标
	 */
	private lastPosition: Vector = new Vector()

	constructor(scene: Scene, x?, y?)
	{
		super(scene, x, y, "")
		this.container = scene.add.container(x, y)
		this.face = new Face(scene, this)

		this.setSize(64, 64)

		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
		)

		this.addListener(
			AvatarEvent.POSITION_CHANGE,
			(self) => {this.container.setX(self.x), this.container.setY(self.y)}
		)

		this.setData(AvatarPart.Body, "00002000")
		this.setData(AvatarPart.Head, "00012000")
		this.setData(AvatarPart.Face, "00020000")
		this.setData(AvatarPart.Hair, "00030020")
		this.setData(AvatarPart.Cap, "01000001") // 普通帽子
		// this.setData(AvatarPart.Cap, "01000003") // 全覆盖帽子

		this.setData(AvatarPart.Coat, "01040002")
		this.setData(AvatarPart.Pants, "01060003")


		this.addedToScene()
		this.facePlay("default")
	}

	private animationUpdateCallback(
		animation: Phaser.Animations.Animation, 
		frame: Phaser.Animations.AnimationFrame)
	{
		if (!frame) return
		var keys = frame.textureKey.split("/")
		this.motion = keys[1] 
		this.motionIndex = keys[2]
		this.drawAvatar()
	}

	public facePlay(anim): this
	{
		this.face.anims.nextAnimsQueue = []
		this.face.chain([
			{key: `${this.data.values.face}.img/${anim}`, repeat: 0, yoyo: true},
			{key: `${this.data.values.face}.img/default`, repeat: -1}
		]).stop()
		return this
	}

	public drawAvatar()
	{
		// 绘制前清空前面的数据
		this.resetAction()
		this.container.removeAll(true)
		if (this.container.data) {this.container.data.reset()}
		this.data.values.avatarMap = {}
		
		// 1. 收集所有的偏移量
		// 2. 按顺序绘制各个模块

		// 逐步绘制
		this.drawBody()
		this.drawHead()
		this.drawHair()
		this.drawCap()
		this.drawCoat()
		this.drawPants()
		// 显示


		this.emit(AvatarEvent.ANIMATION_UPDATE_COMPLETE, this)
	}

	/**
	 * 有一些 motion 是通过应用其他 action 来实现的，因此在绘制前，需要 reset 一下角色的 action
	 */
	private resetAction()
	{
		let result = RPCWzStorage.getInstance().getWzNode(
			`Character/${this.data.values.body}.img/${this.motion}/${this.motionIndex}`,
			() => {}
		)
		if (result) {
			// 根据需要变更动作
			let data = result.getData()
			if (data["action"]) {
				this.motion = data["action"]
				this.motionIndex = data["frame"]
			}
			// TODO 动作还有一些附加的信息，move 之类，这部分信息在这里，需要的时候再进行传递
		}
	}

	/**
	 * 计算数据的偏移量
	 * @param node
	 */
	public calOrigin(node): Vector {
		// 算法来自：https://forum.ragezone.com/f923/looking-render-maplestory-gms-v83-1176964/
		// 素材的粘贴顺序和 map 的计算顺序是相关的，不能先算好 map 的数据，再考虑统一粘贴
		let name = node.name
		let hn = this.data.values.avatarMap["head/neck"] || OO
		let bn = this.data.values.avatarMap["body/neck"] || OO
		let hb = this.data.values.avatarMap["head/brow"] || OO
		let ah = this.data.values.avatarMap["arm/hand"] || OO
		let bh = this.data.values.avatarMap["body/hand"] || OO
		let ana = this.data.values.avatarMap["arm/navel"] || OO
		let bna = this.data.values.avatarMap["body/navel"] || OO
		let lhm = this.data.values.avatarMap["lHand/handMove"] || OO

		let origin = new Vector( - node.origin.X, - node.origin.Y)
		let result = new Vector()
		if (node.map.brow) {
			// 和眼眉相关
			let brow = new Vector(-node.map.brow.X, -node.map.brow.Y)
			if (name == "head") {
				this.data.values.avatarMap["head/brow"] = brow
				hb = brow
			}
			result.x = origin.x + hn.x - bn.x - hb.x + brow.x
			result.y = origin.y + hn.y - bn.y - hb.y + brow.y
		}

		if (node.map.neck) {
			let neck = new Vector(-node.map.neck.X, -node.map.neck.Y)
			if (name == 'body') {
				this.data.values.avatarMap["body/neck"] = neck
				bn = neck
			}
			if (name == 'head') {
				this.data.values.avatarMap["head/neck"] = neck
				hn = neck
			}

			result.x = origin.x + hn.x - bn.x
			result.y = origin.y + hn.y - bn.y
		}

		if (node.map.hand) {
			let hand = new Vector(-node.map.hand.X, -node.map.hand.Y)
			if (name == 'arm') {
				this.data.values.avatarMap["arm/hand"] = hand
				ah = hand
			}
			if (name == 'body') {
				this.data.values.avatarMap["body/hand"] = hand
				bh = hand
			}

			result.x = origin.x + ana.x - ah.x - bna.x + hand.x
			result.y = origin.y + ana.y - ah.y - bna.y + hand.y
		}

		if (node.map.handMove) {
			let handMove = new Vector(-node.map.handMove.X, -node.map.handMove.Y)
			if (name == 'lHand') {
				this.data.values.avatarMap["lHand/handMove"] = handMove
				lhm = handMove
			}
			result.x = origin.x + handMove.x - lhm.x
			result.y = origin.y + handMove.y - lhm.y
		}

		if (node.map.navel) {
			let navel = new Vector(-node.map.navel.X, -node.map.navel.Y)
			if (name == 'arm') {
				this.data.values.avatarMap["arm/navel"] = navel
				ana = navel
			}
			if (name == 'body') {
				this.data.values.avatarMap["body/navel"] = navel
				bna = navel
			}
			result.x = origin.x + navel.x - bna.x
			result.y = origin.y + navel.y - bna.y
		}
		return result
	}

	public calfinallyPosition(wznodeData, position, image: Phaser.GameObjects.Image): Phaser.GameObjects.Image
	{
		let depth = depthOf_Z(wznodeData.z)
		let flip_ = this.flipX ? -1 : 1
		let adjx = this.flipX ? -3 : 0
		image.setX(position.x * flip_ + adjx)
				 .setY(position.y + 32)
				 .setFlipX(this.flipX)
				 .setOrigin(this.flipX ? 1 : 0, 0)
				 .setDepth(depth)
		return image
	}

	/**
	 * 将贴图贴到 container 里
	 * 
	 * @param wznodeData 源数据
	 * @param position 计算出的坐标
	 * @param image
	 */
	public addToContainer(wznodeData, position, image: Phaser.GameObjects.Image) {
		if (this.container.getData(wznodeData.z) === "rm") return

		image = this.calfinallyPosition(wznodeData, position, image)
		this.container.setData(wznodeData.z, "add")
		image.setName(wznodeData.z)
		this.container.add(image)
		this.container.list.sort(
			(a: Phaser.GameObjects.Image, b: Phaser.GameObjects.Image) => b.depth - a.depth
		)
	}

	/**
	 * 移除某一个 z 的 image 数据
	 * @param z 
	 */
	public removeFromContainer(z: string) {
		let image = this.container.getByName(z)
		if (image) {
			this.container.remove(image, true)
		}
		this.container.setData(z, "rm")
	}

	private drawBody()
	{
		RPCWzStorage.getInstance().listCanvasNode(
			`Character/${this.data.values.body}.img/${this.motion}/${this.motionIndex}`,
			(wznode, img) => {
				let position = this.calOrigin(wznode)
				this.addToContainer(wznode, position, img)
			}
		)
	}

	/**
	 * 头型
	 */
	private drawHead()
	{
		RPCWzStorage.getInstance().listCanvasNode(
			`Character/${this.data.values.head}.img/${this.motion}/${this.motionIndex}`,
			(wznode, img) => {
				let position = this.calOrigin(wznode)
				this.addToContainer(wznode, position, img)
				if (wznode["z"] == 'backHead') {
					this.face.setHide(true)
				} else {
					this.face.setHide(false)
				}
			}
		)

	}

		/**
	 * 头发
	 * 
	 * 注意：发型需要根据帽子的类型进行绘制
	 */
	private drawHair()
	{
		this.doDraw("Hair", this.data.values.hair)
	}

	private drawCoat()
	{
		this.doDraw("Coat", this.data.values.coat)
	}

	private drawPants()
	{
		this.doDraw("Pants", this.data.values.pants)
	}

	
	private drawCap() 
	{
		if (!this.data.values.cap) return

		RPCWzStorage.getInstance().getWzNode(
			`Character/Cap/${this.data.values.cap}.img`,
			(wznode) => {
				let overType = wznode["info"]["vslot"]
				switch(overType)
				{
					case "CpH5":
						break
					case "CpH1H5":
						this.removeFromContainer("hairOverHead")
						this.removeFromContainer("backHair")
						break
					default:
						this.removeFromContainer("hair")
						this.removeFromContainer("hairOverHead")
						this.removeFromContainer("backHair")
						this.face.setHide(true)
						break
				}
			}
		)

		this.doDraw("Cap", this.data.values.cap)
	}


	/**
	 * 武器
	 */
	 private drawEquipment()
	 {
 
	 }

	 private doDraw(part: string, path, cb: Function | null = null): this 
	 {
		if (!path) return this

		RPCWzStorage.getInstance().listCanvasNode(
			`Character/${part}/${path}.img/${this.motion}/${this.motionIndex}`,
			(wznode, img) => {
				if (cb) {
					cb(wznode, img)
				} else {
					let position = this.calOrigin(wznode)
					this.addToContainer(wznode, position, img)
				}
			}
		)
		return this
	 }



	private emitPosition() {
		if (this.lastPosition && (this.lastPosition.x != this.x || this.lastPosition.y != this.y)) {
			// 坐标不变
			this.emit(AvatarEvent.POSITION_CHANGE, this)
		}

		this.lastPosition.x = this.x			
		this.lastPosition.y = this.y	
	}

	setFlipX(value: boolean): this {
		super.setFlipX(value)
		this.drawAvatar()
		this.emit(AvatarEvent.FLIP_CHANGE, [this])
		return this
	}


	update(...args: any[]): void {
		this.emitPosition()
	}

}


export {Avatar}