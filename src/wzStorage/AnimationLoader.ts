import { Scene } from "phaser";

// 开放的动作
var animaitions = [
	"stand1",
	"walk1",
	"heal", // 测试 UOL
	"homing", // 测试 action
	"savage",
	"alert2"
]

var faceAnimations = [
	"default",
	"blink",
	"hit",
	"smile",
	"troubled",
	"cry",
	"angry",
	"bewildered",
	"stunned",
	"vomit",
	"oops",
	"cheers",
	"chu",
	"wink",
	"pain",
	"glitter",
	"despair",
	"love",
	"shine",
	"blaze",
	"hum",
	"bowing",
	"hot",
	"dam",
	"bangle",
	"setback",
	"wickedness"
]


function loadBodyAnimation(node, scene: Scene) 
{
	// 加载身体动作库
	for (let index in node['_keys'])
	{
		let motion_key = node['_keys'][index]
		if (motion_key == 'info') continue
		if (animaitions.indexOf(motion_key) == -1) continue

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
		scene.anims.emit("motionadd", motion_name)
	}
}


function isNumber(value: string | number): boolean
{
   return ((value != null) &&
           (value !== '') &&
           !isNaN(Number(value.toString())));
}

/**
 * 加载表情库
 * 
 * @param node 
 * @param scene 
 */
function loadFaceAnimation(node, scene: Scene)
{
	// 加载表情动作库
	const name = node['name']
	for (let index in node['_keys'])
	{
		let expresion_key = node['_keys'][index]
		if (expresion_key == 'info') continue	
		if (faceAnimations.indexOf(expresion_key) == -1) continue

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
		scene.anims.create({
			key: expresion_name,
			frames: frames,
			repeat: -1
		})

		scene.anims.emit("faceAnimationsAdd", expresion_name)
	}

}

function loadSkillAnimation(json_key: String, scene: Scene)
{
	// 加载技能动作库

}

function loadModAnimation(json_key: String, scene: Scene)
{
	// 加载 Mod 的动作库
}


function registerAnimationCallback(scene: Scene) {
	scene.load.json("Character/00002000.img.xml.json", "Character/00002000.img.xml.json")
	scene.load.json("Character/00012000.img.xml.json", "Character/00012000.img.xml.json")
	scene.load.json("Character/Face/00020000.img.xml.json", "Character/Face/00020000.img.xml.json")
	scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, (key: string, type, data) => {
		if (key == 'Character/00002000.img.xml.json') {
			loadBodyAnimation(data, scene)
		}

		if (key.startsWith('Character/Face')) {
			loadFaceAnimation(data, scene)
		}

	})
}


export {registerAnimationCallback}