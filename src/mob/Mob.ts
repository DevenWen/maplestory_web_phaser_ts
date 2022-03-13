import { Game, GameObjects } from "phaser"
import { DataLoader, Vector } from "~/dataload/DataStorage"


export class Mob extends Phaser.GameObjects.Sprite
{
	private img_id: string
	private container: Phaser.GameObjects.Container

	constructor(scene: Phaser.Scene, img_id: string, x?, y?)
	{
		super(scene, x, y, "")
		this.img_id = `Mob/${img_id}`
		this.container = scene.add.container(x, y)
		this.addedToScene()
		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE, 
			this.animation_update_callback
		)
	}

	private addPart(texture, pos, z: string) 
	{
		const flip_ = this.flipX ? 1 : -1
		var sprite = this.scene.add.sprite(pos.x * flip_, pos.y, texture)
			.setFlipX(this.flipX)
			.setOrigin(this.flipX ? 1 : 0, 0)

		this.container.add(sprite)
	}

	animation_update_callback(context, frame) 
	{
		this.container.removeAll(true)
		this.container.setPosition(this.x, this.y)
		DataLoader.getWzSprite(frame.textureKey, (img, textureKey, z) => {
			// 将 textureKey 绘制成 sprite 到 container 中
			if (!this.scene.textures.get(textureKey)) return
			var pos = Vector.create(img.origin.X, -img.origin.Y)
			this.addPart(textureKey, pos, z)
		})
	}
	

	play(anim)
	{
		let real_anim = `${this.img_id}/${anim}`
		console.debug("play anim: ", real_anim)
		super.play(real_anim)
		return this
	}


}