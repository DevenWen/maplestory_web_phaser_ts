import { loadMobAnimation, Mob } from "~/mob/Mob";
import { loadBodyAnimation, loadFaceAnimation, Player } from "~/player/Player";
import { loadSkillAnimation } from "~/player/PlayerSkill";


/**
 * 冒险岛底层场景
 */
export default class MapleScene extends Phaser.Scene
{
	sceneId: String = "base_scene"
	mobs: Mob[] = []
	cursors?
	player?: Player

	constructor()
	{
		super("maple base")
	}

	preload()
	{
		this.cursors = this.input.keyboard.createCursorKeys()
		this.load.on(Phaser.Loader.Events.ADD, (key: string) => {
			if (key.startsWith("Mob"))
			{
				console.debug("load mob animation for: ", key)
				loadMobAnimation(key, this)
			}

			if (key == "Character/00002000.img")
			{
				console.debug("load character animation")
				loadBodyAnimation(key, this)
			}

			if (key == "Character/Face/00020000.img")
			{
				console.debug("load face animation")
				loadFaceAnimation(key, this)
			}

			if (key.startsWith("Skill"))
			{
				console.debug("load skill animtion")
				loadSkillAnimation(key, this)
			}
		})

		this.load.setBaseURL('http://localhost/assert/wz')
		this.load.image("platform", "platform.png")
		this.load.json("zmap", "zmap.img.xml.json")
		this.load.json('Character/00002000.img', "Character/00002000.img.xml.json")
		this.load.json('Character/Face/00020000.img', 'Character/Face/00020000.img.xml.json')

	}

	protected loadMobJson(mobStr): this
	{
		this.load.json(`Mob/${mobStr}.img`, `Mob/${mobStr}.img.xml.json`)
		return this
	}

	protected loadSkillJson(skillStr): this
	{
		this.load.json(`Skill/${skillStr}.img`, `Skill/${skillStr}.img.xml.json`)
		return this
	}

	create()
	{

	}

	update(time: number, delta: number): void {
		this.mobs.forEach(mob => mob.update())
		if (this.player)
			this.player.update(time)
	}



}