import { Game, GameObjects } from "phaser"
import { DataLoader } from "~/dataload/DataStorage"
import Vector = Phaser.Math.Vector2

/**
 * 
 * @param json_key 加载的 key
 * @param scene 场景数据
 */
export function loadMobAnimation(json_key : String, scene : Phaser.Scene) {
	if (! json_key.startsWith("Mob")) return  

	DataLoader.getWzNode(json_key, (node) => {
		// 解析动作库
		// 每一个动作有一个 n 个图片(每一个)
		const name = node['name'] // 0100100.img
		var keys = node['_keys']
		for (let index in keys)
		{
				let action_key = keys[index]
				if (action_key == 'info') continue
				let action_node = node[`${action_key}`]

				let action_name = `Mob/${name}/${action_key}`
				var frames: Phaser.Types.Animations.AnimationFrame[] = []
				for (let i in action_node['_keys'])
				{   
						var frame_index = action_node['_keys'][i]
						if (frame_index == 'zigzag') continue
						const frame = action_node[`${frame_index}`]
						let delay = frame['delay']

						scene.textures.addRenderTexture(
								`Mob/${name}/${action_key}/${frame_index}`,
								new Phaser.GameObjects.RenderTexture(scene)
						)
						DataLoader.getWzSprite(`Mob/${name}/${action_key}/${frame_index}`, ()=>{})
						frames.push(
								{
										key: `Mob/${name}/${action_key}/${frame_index}`,
										duration: delay || 600
								}
						)
				}
				console.debug("add action_name", action_name)
				scene.anims.create({
						// https://blog.ourcade.co/posts/2020/phaser3-load-images-dynamically/
						key: action_name,
						frames: frames,
						repeat: -1
				})
		}
	})
}

export class Mob extends Phaser.GameObjects.Sprite
{
	private img_id: string
	private mob_height: integer
	private container: Phaser.GameObjects.Container
	public matter_body
	private current_frame?

	constructor(scene: Phaser.Scene, img_id: string, x?, y?)
	{
		super(scene, x, y, "")
		this.img_id = `Mob/${img_id}`
		this.container = scene.add.container(x, y)
		this.addedToScene()
		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE, 
			this.animationUpdateCallback
		)
		// 增加物理body
		this.mob_height = 13
		this.matter_body = scene.matter.add.gameObject(this)
	}

	private addPart(texture, pos, z: string, img_size) 
	{
		const flip_ = this.flipX ? 1 : -1
		// +3 是根据观察效果调节出来的
		var sprite = this.scene.add.sprite(pos.x * flip_, pos.y + 2, texture)
			.setFlipX(this.flipX)
			.setOrigin(this.flipX ? 1 : 0, 0)

		this.container.add(sprite)
	}

	animationUpdateCallback(context, frame) 
	{
		this.container.removeAll(true)
		this.current_frame = frame
		DataLoader.getWzSprite(frame.textureKey, (img, textureKey, z) => {
			// 将 textureKey 绘制成 sprite 到 container 中
			if (!this.scene.textures.get(textureKey)) return
			var pos = new Vector(img.origin.X, -img.origin.Y)
			var img_size = {h: img["_image"].height, w: img["_image"].width}
			// 将 TODO head 数据保存起来
			this.addPart(textureKey, pos, z, img_size)
		})
	}

	play(anim)
	{
		let real_anim = `${this.img_id}/${anim}`
		console.debug("play: ", real_anim)
		super.play(real_anim)
		return this
	}

	setFlipX(value: boolean): this {
		super.setFlipX(value)
		// 马上重放当前帧
		this.anims.setCurrentFrame(this.anims.currentFrame)
		return this
	}
	
	update(...args: any[]): void {
		this.container.setX(this.x)
		this.container.setY(this.y + this.mob_height)
	}

}