
import { padLeft } from "~/dataload/dataloader"
import { DataLoader, Vector } from "~/dataload/DataStorage"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite
import Scene = Phaser.Scene
import Frame = Phaser.Animations.AnimationFrame

function isNumber(value: string | number): boolean
{
   return ((value != null) &&
           (value !== '') &&
           !isNaN(Number(value.toString())));
}

export function loadFaceAnimation(json_key : String, scene: Phaser.Scene)
{
	DataLoader.getWzNode(json_key, (node) => {
		const name = node['name']
		for (let index in node['_keys'])
		{
			let expresion_key = node['_keys'][index]
			if (expresion_key == 'info') continue	

			let expresion_node = node[`${expresion_key}`]
			let expresion_name = `${name}/${expresion_key}`
			var frames: Phaser.Types.Animations.AnimationFrame[] = []
			for (let i in expresion_node['_keys'])
			{
				let frame_index = expresion_node['_keys'][i]
				let frame = expresion_node[`${frame_index}`]
				let textureKey = 
					isNumber(frame_index) ? `${expresion_name}/${frame_index}` : `${expresion_name}`
				scene.textures.addRenderTexture(
					textureKey,
					new Phaser.GameObjects.RenderTexture(scene)
				)
				frames.push(
					{
						key: textureKey,
						duration: frame['delay']
					}
				)
			}
			console.log("add face_expresion_anim", expresion_name, frames.length)
			scene.anims.create({
				key: expresion_name,
				frames: frames,
				repeat: -1
			})
		}
	})
}

export function loadBodyAnimation(json_key : String, scene: Phaser.Scene)
{
	DataLoader.getWzNode(json_key, (node) => {
		// 解析动作库
		for (let index in node['_keys'])
		{
			let motion_key = node['_keys'][index]
			if (motion_key == 'info') continue

			let motion_node = node[`${motion_key}`]
			let motion_name = `motion/${motion_key}`
			var frames: Phaser.Types.Animations.AnimationFrame[] = []
			for (let i in motion_node['_keys'])
			{
				let frame_index = motion_node['_keys'][i]
				let frame = motion_node[`${frame_index}`]
				let textureKey = `motion/${motion_key}/${frame_index}`
				scene.textures.addRenderTexture(
					textureKey,
					new Phaser.GameObjects.RenderTexture(scene)
				)
				frames.push({
						key: textureKey,
						duration: frame['delay']
				})
			}
			scene.anims.create({
					key: motion_name,
					frames: frames,
					repeat: -1
			})
		}
	})
}

class PlayerFace extends Sprite
{
	private parent: Player
	public container: Container
	private current_frame?: Frame 

	constructor(scene: Scene, parent: Player)
	{
		super(scene, 0, 0, "")
		this.parent = parent
		this.container = scene.add.container()
		this.addedToScene()
		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animation_update_callback
		)
	}

	private addPart(texture, pos, z: string) {
		const flip_ = this.parent.flipX ? -1 : 1
		// 这是用来调整的3个像素点
		const adjx = this.parent.flipX ? -3 : 0

		var sprite = this.scene.add.sprite(pos.x * flip_ + adjx, pos.y+32, texture)
			.setFlipX(this.parent.flipX)
			.setOrigin(this.parent.flipX ? 1 : 0, 0)

		this.container.add(sprite)

	}

	private animation_update_callback(context, frame)
	{
		if (!frame) return
		// 更新 Container
		// console.debug("face frame:", frame.textureKey)
		// this.container.removeAll(true)
		// this.parent.destroyPart('face')
		// this.parent.destroyPart('face')
		// 精准删除 face
		// this.parent.cleanFace()
		this.current_frame = frame

		// DataLoader
		// Flip 选择 parent 的
		DataLoader.listWzSprite(`Character/Face/${frame.textureKey}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this.parent, img)
			// console.debug("face at: ", textureKey, pos)
			// this.addPart(textureKey, pos, z)
			this.parent.addPart(textureKey, pos, z)
		})
	}

	hide()
	{
		this.container.each((sprite) => sprite.setVisible(false))
	}

	update(...args: any[]): void {
		this.setPosition(this.parent.x, this.parent.y)
		this.container.setPosition(this.parent.x, this.parent.y)
	}

	reload() {
		this.animation_update_callback(null, this.current_frame)
	}

	play(anim): this
	{
		var imgStr = padLeft(this.getData("face_img") | 20000, 8, "0")
		let realAnim = `${imgStr}.img/${anim}`
		super.play(realAnim)
		return this
	}

}

export class Player extends Sprite
{

	private container: Container
	private zmap = []
	private current_frame?: Frame
	public mapCache = {}
	private destroyPartKey = new Set<String>()
	private parts: Map<String, Sprite> = new Map()
	public physicalBody

	public face: PlayerFace

	constructor(scene: Scene, x?, y?)
	{
		super(scene, x, y, "")
		this.initMapCache()
		this.face = new PlayerFace(scene, this)
		this.zmap = scene.cache.json.get("zmap")["_keys"]

		this.container = scene.add.container(x, y)

		this.setSize(64, 64)
		this.physicalBody = scene.matter.add.gameObject(this)
		this.addedToScene()

		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animation_update_callback
		)
	}

	private initMapCache() 
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

	private animation_update_callback(context, frame)
	{
		if (!frame) return
		// 更新 Container
		this.container.removeAll(true)
		this.initMapCache()
		this.parts.clear()
		// 从 frame 中获取 motion、index 信息
		var frameKey = frame.textureKey as String
		var motion = frameKey.split('/')[1]
		var index = Number(frameKey.split('/')[2])
		// 渲染各个部位
		// 绘制 body
		this.loadBody(motion, index)
				.loadHead(motion, index)
				.loadFace()
		// 绘制 head
		// 重新绘制面部
	}

	public addPart(texture, pos, z: string) {
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

		this.container.add(sprite)
		this.parts.set(z, sprite)
	}

	public destroyPart(z: string) 
	{
		if (this.parts.has(z)) {
			let sprite = this.parts.get(z) as Phaser.GameObjects.GameObject
			this.container.remove(sprite, true)
		}
		this.destroyPartKey.add(z)
	}

	private loadBody(motion: String, index: integer): this
	{
		var bodyStr = padLeft(this.getData("body_img") | 2000, 8, "0")
		DataLoader.listWzSprite(`Character/${bodyStr}.img/${motion}/${index}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})

		return this
	}

	loadHead(motion: String, index: integer): this
	{
		const headStr = padLeft(this.getData("head_img") | 12000, 8, '0')
		DataLoader.listWzSprite(`Character/${headStr}.img/${motion}/${index}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
			if (z == 'backHead') {
				// this.destroyPart('face')
				this.face.hide()
			}
		})
		return this
	}

	loadFace(): this
	{
		this.face.reload()
		return this
	}

	play(anim): this
	{
		let real_anim = `motion/${anim}`
		// TODO 支持更多的 play 参数
		super.play(real_anim)
		return this
	}

	facePlay(anim): this
	{
		// TODO 支持更多的 play 参数
		this.face.play(anim)
		return this
	}

	update(...args: any[]): void {
			this.container.setPosition(this.x, this.y)
			this.face.update()
	}

}