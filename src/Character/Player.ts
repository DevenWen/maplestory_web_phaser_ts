import { addComponent } from "bitecs";
import { padLeft } from "~/dataload/dataloader"
import DataLoader from "~/dataload/DataStorage"
import game from '~/main'
import TestScene from "~/scenes/TestScene";

class Vector {
	x;y;

	static create(wz_vector) {
		var r = new Vector()
		r.x = wz_vector["X"]; r.y = wz_vector["Y"]
		return r
	}
}

export class Player
{
	// 玩家类型
	skin = 0
	head = 12000
	body = 2000
	face = 0

	characterModtion = "walk1"
	motion: string = "stand1"
	motionIndex: integer = 0

	isPlayerOneTime: boolean = false

	// attackTypes


	// gameObject group 用于绘制
	container: Phaser.GameObjects.Container
	scene: Phaser.Scene


	init()
	{

	}

	constructor(scene: Phaser.Scene) {
		this.container = scene.add.container(400,300) // TODO Player localtion, 后面会修改
		this.scene = scene
	}

	update(ts)
	{
		// TODO
		this.changeMotion(this.motion, true)
	}

	changeMotion(motion: string, onetime: boolean)
	{
		this.characterModtion = motion
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
		// this.loadHead()
		this.loadBody()
		return

		// 有武器状态

	}

	addPart(texture, pos) {
		console.log(`add texture ${texture} pos`, pos)
		this.container.add(
			this.scene.add.sprite(pos.x, pos.y, texture).setOrigin(0)
		)
	}

	loadHead(bodyNode)
	{
		const headStr = padLeft(this.head, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex

		DataLoader.getWzSprite(`${headStr}.img/${motion}/${motionIndex}/head`, (imageNode, textureKey) => {
		
			var headOrigin = Vector.create(imageNode['origin'])
			var headNeck = Vector.create(imageNode['map']['neck'])
			var bodyNeck = Vector.create(bodyNode['map']['neck'])
			var pos = {
				x: - headOrigin.x - headNeck.x + bodyNeck.x, 
				y: -(headOrigin.y + headNeck.y - bodyNeck.y)
			}

			// FIXME 这种通过大量创建 Sprite，然后销毁的方式会引起比较大的性能消耗，是否可以考虑生成纸娃娃的所有动作数据，然后直接被使用。
			// 这样的好处是生成一次动画，可以被重复使用。Think about it
			// 绘制头型
			this.addPart(textureKey, pos)


		})
		
	}

	loadBody()
	{
		var bodyStr = padLeft(this.body, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`${bodyStr}.img/${motion}/${motionIndex}/body`, (bodyNode, textureKey) => {
			var bodyOrigin = Vector.create(bodyNode['origin'])
			var pos = {
				x: - bodyOrigin.x,
				y: - bodyOrigin.y
			}
			this.addPart(textureKey, pos)

			// 绘制手臂
			this.loadArm(bodyNode)


			// 绘制头部
			this.loadHead(bodyNode)
		})

	}

	loadArm(bodyNode)
	{
		var bodyStr = padLeft(this.body, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`${bodyStr}.img/${motion}/${motionIndex}/arm`, (armNode, textureKey) => {
			var armOrigin = Vector.create(armNode['origin'])
			var armNavel = Vector.create(armNode['map']['navel'])
			var bodyNavel = Vector.create(bodyNode['map']['navel'])
			var pos = {
				x: bodyNavel.x - armNavel.x - armOrigin.x,
				y: bodyNavel.y - armNavel.y - armOrigin.y
			}
			this.addPart(textureKey, pos)
		})

	}



	/**
	 * 
	 * @param headRoot 
	 * @param headOrigin 
	 * @param bodyRoot 
	 */
	playbodyAnimate(headRoot, headOrigin, bodyRoot)
	{
		var bodyStr = padLeft(this.body, 8, '0')
		var motion = this.motion
		var motionIndex = this.motionIndex
		DataLoader.getWzSprite(`${bodyStr}.img/${motion}/${motionIndex}/body`, (bodyNode, textureKey) => {
			// console.log("load body string ", imageNode)
			var bodyOrigin = Vector.create(bodyNode["origin"])
			var headNode = headRoot[motion][`${motionIndex}`]["head"].node()
			// console.log("load body, find headNode", headNode)
			var headNeck = Vector.create(headNode["map"]["neck"])
			var bodyNeck = Vector.create(bodyNode["map"]["neck"])
			console.log("load body: headNeck=", headNeck)
			console.log("load body: bodyNeck=", bodyNeck)
			var pos = {
				x: (headOrigin.x + headNeck.x) - (bodyOrigin.x + bodyNeck.x), 
				y: (headOrigin.y + headNeck.y) - (bodyOrigin.y + bodyNeck.y)
			}
			console.log("body pos: ", pos)

			this.addPart(textureKey, pos)

		})



	}

	loadFace(imageNode, headNode, headOrigin)
	{
		// TODO 
		

	}



	

}