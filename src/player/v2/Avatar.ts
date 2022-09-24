import { Scene } from "phaser"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite
import { AvatarPart, depthOf_Z } from './AvatarConst'
import RPCWzStorage from "~/wzStorage/RPCWzStorge"
import Vector = Phaser.Math.Vector2
import { WzNode } from "~/wzStorage/WzNode"

const OO = new Vector()

/**
 * 纸娃娃对象
 */
class Avatar extends Sprite
{
	/**
	 * 纸娃娃粘贴容器
	 */
	public container: Container

	/**
	 * 动作
	 */
	public motion: string
	/**
	 * 动作帧
	 */
	public motionIndex: string

	constructor(scene: Scene, x?, y?)
	{
		super(scene, x, y, "")
		this.container = scene.add.container(x, y)

		this.setSize(64, 64)

		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
		)

		this.setData(AvatarPart.Body, "00002000")
		this.setData(AvatarPart.Head, "00012000")

		this.addedToScene()
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

	public drawAvatar()
	{
		// console.log(`1 draw: motion ${this.motion}, frame: ${this.motionIndex}`)
		// 绘制前清空前面的数据
		this.resetAction()
		this.container.removeAll(true)
		this.data.values.avatarMap = {}
		
		// 1. 收集所有的偏移量
		// 2. 按顺序绘制各个模块

		// 逐步绘制
		this.drawBody()
		this.drawHead()
		// 显示
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
	private calOrigin(node): Vector {
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

	/**
	 * 将贴图贴到 container 里
	 * 
	 * @param wznodeData 源数据
	 * @param position 计算出的坐标
	 * @param image
	 */
	private addToContainer(wznodeData, position, image: Phaser.GameObjects.Image) {
		let depth = depthOf_Z(wznodeData.z)
		let flip_ = this.flipX ? -1 : 1
		let adjx = this.flipX ? -3 : 0
		image.setX(position.x * flip_ + adjx)
				 .setY(position.y)
				 .setFlipX(this.flipX)
				 .setOrigin(this.flipX ? 1 : 0, 0)
				 .setDepth(depth)
		this.container.add(image)
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
			}
		)

	}

	/**
	 * 脸部
	 */
	private drawFace()
	{

	}


	/**
	 * 武器
	 */
	 private drawEquipment()
	 {
 
	 }

	/**
	 * 头发
	 * 
	 * 注意：发型需要根据帽子的类型进行绘制
	 */
	private drawHair()
	{

	}

}


export {Avatar}