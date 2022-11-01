import { Scene } from "phaser"
import RPCWzStorage from "~/wzStorage/RPCWzStorge"
import { textureKeyChanger } from "~/wzStorage/Utils"
import { WzNode } from "~/wzStorage/WzNode"
import Container = Phaser.GameObjects.Container

/**
 * 地图 Object 对象
 */
class MapObject extends Phaser.GameObjects.Sprite
{

	animation_object: boolean = false
	private container: Container
	wznode: WzNode

	constructor(scene, wznode: WzNode) 
	{
		super(scene, 0, 0, "")
		this.wznode = wznode
		this.container = this.scene.add.container()
		if ((wznode.data["_keys"].length) > 1) {
			this.animation_object = true
			this.buildAnimationObject()
			this.addListener(
				Phaser.Animations.Events.ANIMATION_UPDATE,
				this.animationUpdateCallback
			)

		} else {
			this.buildStaticObject()
		}
	}

	setX(value?: number): this {
			super.setX(value)
			this.container.setX(value)
			return this
	}

	setY(value?: number): this {
			super.setY(value)
			this.container.setY(value)
			return this
	}

	private animationUpdateCallback(
		animation: Phaser.Animations.Animation, 
		frame: Phaser.Animations.AnimationFrame) {
			// console.log("mapobject, animation callback:", frame)
			this.container.removeAll(true)
			if (!frame) return

			let frame_node = this.wznode.find(`${frame.textureKey}`)
			// console.log("frame_node: ", frame_node)
			let img = new Phaser.GameObjects.Image(this.scene, 0, 0, this.wznode.texture, textureKeyChanger(frame_node.getPath()))
			img.setX(-frame_node.data["origin"]["X"])
			img.setY(-frame_node.data["origin"]["Y"])
			img.setOrigin(0, 0)
			this.container.add(img)
	}

	private buildStaticObject() {
		let wznode_0 = this.wznode.find("0")
		let data = wznode_0.data
		this.setOrigin(0.5, 0.5)
		if (data["type"] == "canvas") {
			this.setTexture(this.wznode.texture, textureKeyChanger(wznode_0.getPath()))
		}
	}	

	private buildAnimationObject() {
		let data = this.wznode.data
		var frames: Phaser.Types.Animations.AnimationFrame[] = []
		for (let index in data['_keys']) {
			let key = data["_keys"][index]
			let node = data[`${key}`]
			if (!this.scene.textures.exists(key)) {
				this.scene.textures.addRenderTexture(
					key,
					new Phaser.GameObjects.RenderTexture(this.scene)
				)
			}
			frames.push(
				{
					key: key,
					duration: node['delay'] || 600
				}
			)
		}

		this.anims.create({
			key: "animation",
			frames: frames,
			repeat: -1
		})

		this.play("animation")
	}

}

export default MapObject