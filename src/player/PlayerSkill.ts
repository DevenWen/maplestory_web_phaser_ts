import { padLeft } from "~/dataload/dataloader"
import { DataLoader } from "~/dataload/DataStorage"
import Container = Phaser.GameObjects.Container
import Sprite = Phaser.GameObjects.Sprite
import Scene = Phaser.Scene
import Frame = Phaser.Animations.AnimationFrame
import Image = Phaser.GameObjects.Image
import Vector = Phaser.Math.Vector2

enum SkillAnimationType
{
	EFFECT = "effect",
	HIT = "hit"
}

/**
 * 加载子动画
 * @param scene 
 * @param skill_id 
 * @param effect_node 
 * @param prefix 
 * @param type 
 * @returns 
 */
function loadSkillSubAnimation(scene: Phaser.Scene, skill_id, effect_node, prefix, type: SkillAnimationType, level?) {
	if (effect_node == null) return 
	if (!level) level = 0

	let animationName = `skill_${skill_id}_${level}_${type}`
	let frames: Phaser.Types.Animations.AnimationFrame[] = []
	for (let i in effect_node["_keys"])
	{
		let frame_index = effect_node['_keys'][i]
		let frame = effect_node[`${frame_index}`]
		let textureKey = `${prefix}/${type}/${frame_index}`
		scene.textures.addRenderTexture(
			textureKey,
			new Phaser.GameObjects.RenderTexture(scene)
		)
		frames.push({
			key: textureKey,
			duration: frame['delay'] || 80
		})
	}
	console.debug("load skill animation: ", animationName)
	scene.anims.create({
		key: animationName,
		frames: frames,
		repeat: 0
	})
}

function loadCharLevelAnimation(scene: Phaser.Scene, skill_id, node, prefix) {
	if (node == null) return
	for (let index in node["_keys"])
	{
		let level = node["_keys"][index]
		let skill_node = node[`${level}`]
		if ("effect" in skill_node) {
			let effect_node = skill_node["effect"]
			loadSkillSubAnimation(scene, skill_id, effect_node, prefix + `/${level}`, SkillAnimationType.EFFECT, level)
		}
		if ("hit" in skill_node) {
			let hit_node = skill_node["hit"]
			loadSkillSubAnimation(scene, skill_id, hit_node, prefix + `/${level}`, SkillAnimationType.HIT, level)
		}	
	}
}

/**
 * 
 * @param json_key 
 * @param scene 
 */
export function loadSkillAnimation(json_key: String, scene: Phaser.Scene)
{
	// 解析，并注册技能动画
	console.log("try load skill animtion for: ", json_key)
	// 此处还会有 info 数据
	DataLoader.getWzNode(`${json_key}/skill`, (node) => {
		// ['2000000', '2000001', '2001002', '2001003', '2001004', '2001005']
		// effect 表示有游戏动画 $skill_{skill_id}_effect (通过监听 action)
		// hit 表示受击动画 ${skill_id}_hit
		// action 表示需要角色执行的动画 $skill_{skill_id}_action
		let prefix = `${json_key}/skill`
		for (let index in node['_keys'])
		{
			let skill_id = node['_keys'][index]
			let skill_node = node[skill_id]
			if ("effect" in skill_node) {
				let effect_node = skill_node["effect"]
				loadSkillSubAnimation(scene, skill_id, effect_node, `${prefix}/${skill_id}`, SkillAnimationType.EFFECT)
			}
			if ("hit" in skill_node) {
				let hit_node = skill_node["hit"]
				loadSkillSubAnimation(scene, skill_id, hit_node, `${prefix}/${skill_id}`, SkillAnimationType.HIT)
			}
			if ("CharLevel" in skill_node) {
				let charLevel_node = skill_node["CharLevel"]
				loadCharLevelAnimation(scene, skill_id, charLevel_node, `${prefix}/${skill_id}/CharLevel`)
			}
		}
	})
}



/**
 * 技能 Sprite
 */
export class PlayerSkill extends Sprite
{
	public container: Container
	private parent: Sprite

	constructor(parent: Sprite)
	{
		super(parent.scene, parent.x, parent.y, "")
		this.parent = parent
		this.addedToScene()
		this.container = parent.scene.add.container()
		this.addListener(
			Phaser.Animations.Events.ANIMATION_UPDATE,
			this.animationUpdateCallback
		)
	}

	private addPart(texture, pos, z): Image {
		const flip_ = this.parent.flipX ? -1 : 1
		var image = this.scene.add.image(pos.x * flip_, pos.y + 32, texture)
			.setFlipX(this.parent.flipX)
			.setOrigin(this.parent.flipX ? 1 : 0, 0)

		this.container.add(image)
		return image
	}


	private animationUpdateCallback(context, frame)
	{
		// console.log("skill animation callback: ", frame.textureKey)
		this.container.removeAll(true)
		// TODO 根据 frame 的 textrue，渲染
		DataLoader.getWzSprite(frame.textureKey, (img, textureKey, z) => {
			var pos = new Vector(-img.origin.X, - img.origin.Y)
			this.addPart(textureKey, pos, z)
		})

	}

	playEffect(key): this
	{
		this.play(key)
		return this
	}

	update(time): void {
		// this.setPosition(this.parent.x, this.parent.y)
		// this.container.setPosition(this.parent.x, this.parent.y)
		this.setX(this.parent.x)
		this.setY(this.parent.y)

		this.container.setX(this.parent.x)
		this.container.setY(this.parent.y)
	}

}