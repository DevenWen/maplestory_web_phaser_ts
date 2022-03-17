
import { padLeft } from "~/dataload/dataloader"
import { DataLoader, Vector } from "~/dataload/DataStorage"
import { PlayerSkill } from "./PlayerSkill"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite
import Scene = Phaser.Scene
import Frame = Phaser.Animations.AnimationFrame
import Image = Phaser.GameObjects.Image

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
						duration: frame['delay'] || 600
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
	private current_frame?: Frame 
	private next: integer = 0

	constructor(scene: Scene, parent: Player)
	{
		super(scene, 0, 0, "")
		this.parent = parent
		this.addedToScene()
		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
		)
	}

	private animationUpdateCallback(context, frame)
	{
		if (!frame) return
		this.current_frame = frame

		DataLoader.listWzSprite(`Character/Face/${frame.textureKey}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this.parent, img)
			this.parent.addPart(textureKey, pos, z)
		})
	}

	reload() {
		this.animationUpdateCallback(null, this.current_frame)
	}

	play(anim): this
	{
		var imgStr = padLeft(this.getData("face_img") | 20000, 8, "0")
		super.chain([
			{key: `${imgStr}.img/${anim}`, repeat: 0},
			{key: `${imgStr}.img/default`, repeat: -1}
		]).stop()
		return this
	}
	
	update(time): void {
		if (time > this.next && this.current_frame && this.current_frame.textureKey.endsWith("default"))
		{
			var imgStr = padLeft(this.getData("face_img") | 20000, 8, "0")
			super.chain(
				[
					{key: `${imgStr}.img/blink`, repeat: 0, yoyo: true},
					{key: `${imgStr}.img/default`, repeat: -1}
				]
			).stop()
			this.next = time + Math.floor(Math.random()*7000)
		}
	}

}

export enum CharacterPart {
	Head = 'Head',
	Body = 'Body',
	Hair = 'Hair',
	Cap = 'Cap',
	Longcoat = 'Longcoat',
	Coat = 'Coat',
	Pants = 'Pants',
	Shoes = 'Shoes',
	Weapon = 'Weapon'
}

export class Player extends Sprite
{

	public container: Container
	private zmap = []
	private current_frame?: Frame
	public mapCache = {}
	private destroyPartKey = new Set<String>()
	private parts: Map<String, Image> = new Map()
	public physicalBody

	public face: PlayerFace
	public skill: PlayerSkill

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

		this.skill = new PlayerSkill(this)

		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
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

	private animationUpdateCallback(context, frame): void
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
				.loadDefault(CharacterPart.Hair, motion, index)
				.loadCap(motion, index)
				.loadDefault(CharacterPart.Longcoat, motion, index)
				.loadDefault(CharacterPart.Coat, motion, index)
				.loadDefault(CharacterPart.Pants, motion, index)
				.loadDefault(CharacterPart.Shoes, motion, index)
				.loadDefault(CharacterPart.Weapon, motion, index)
		// 绘制 head
		// 重新绘制面部
	}

	public putOn(part: CharacterPart, value): this
	{
		this.setData(part, value)
		return this
	}

	public addPart(texture, pos, z: string): Image {
		if (this.destroyPartKey.has(z)) return

		if (this.parts.has(z)) {
			let image = this.parts.get(z) as Phaser.GameObjects.Image
			this.container.remove(image, true)
		}

		var depth = this.zmap.indexOf(z)
		const flip_ = this.flipX ? -1 : 1
		// 这是用来调整的3个像素点
		const adjx = this.flipX ? -3 : 0

		var image = this.scene.add.image(pos.x * flip_ + adjx, pos.y+32, texture)
			.setFlipX(this.flipX)
			.setOrigin(this.flipX ? 1 : 0, 0)
			.setDepth(depth)

		this.container.add(image)
		this.parts.set(z, image)
		return image
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
		var bodyStr = padLeft(this.getData("Body") | 2000, 8, "0")
		DataLoader.listWzSprite(`Character/${bodyStr}.img/${motion}/${index}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})
		return this
	}

	private loadHead(motion: String, index: integer): this
	{
		const headStr = padLeft(this.getData("Head") | 12000, 8, '0')
		DataLoader.listWzSprite(`Character/${headStr}.img/${motion}/${index}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
			if (z == 'backHead') {
				this.destroyPart('face')
			}
		})
		return this
	}

	private loadCap(motion, index): this
	{
		if (!this.data.has(CharacterPart.Cap)) return this
		// TODO 渲染帽子，同时需要隐藏头发
		
		var capStr = padLeft(this.data.get(CharacterPart.Cap), 8, '0');
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
		this.loadDefault(CharacterPart.Cap, motion, index)
		return this
	}

	private loadDefault(part, motion, index): this {
		if (!this.data.has(part)) return this

		const imgStr = padLeft(this.getData(part), 8, '0')
		DataLoader.listWzSprite(`Character/${part}/${imgStr}.img/${motion}/${index}`, (img, textureKey, z) => {
			var pos = DataLoader.offset(this, img)
			this.addPart(textureKey, pos, z)
		})

		return this
	}

	private loadFace(): this
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

	skillPlay(anim): this
	{
		this.skill.play(anim)
		return this
	}

	update(time): void {
			this.container.setPosition(this.x, this.y)
			this.face.update(time)
			this.skill.update(time)
	}

	setFlipX(value: boolean): this {
		super.setFlipX(value)
		// 重新绘制
		this.anims.setCurrentFrame(this.anims.currentFrame)
		return this
	}


}