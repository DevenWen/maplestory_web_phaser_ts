import { Scene } from "phaser"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite
import { AvatarPart } from './AvatarConst'
import RPCWzStorage from "~/wzStorage/RPCWzStorge"

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
		
		// 逐步绘制
		this.drawBody()
		// 显示
	}

	/**
	 * 有一些 motion 是通过应用其他 action 来实现的，因此在播放前，需要 reset 一下角色的 action
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
		}
	}

	private drawBody()
	{
		RPCWzStorage.getInstance().listCanvasNode(
			`Character/${this.data.values.body}.img/${this.motion}/${this.motionIndex}`,
			(wznode, img) => {
				// console.debug("2 drawBody callback", this.motion, this.motionIndex)
				// TODO 计算位置
				this.container.add(img)

			}
		)
	}

}


export {Avatar}