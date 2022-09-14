import { Scene } from "phaser"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite

class Avatar extends Sprite
{
	public container: Container
	


	constructor(scene: Scene, x?, y?)
	{
		super(scene, x, y, "")
		this.container = scene.add.container(x, y)

		this.setSize(64, 64)

		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
		)

		this.addedToScene()
	}

	private animationUpdateCallback(context, frame): void
	{
		// {
		// 	"key": "motion/walk1/1",
		// 	"frame": 0,
		// 	"duration": 180,
		// 	"keyframe": false
		// }
		if (!frame) return
		console.log("anim.update.callback", frame)
	}

}


export {Avatar}