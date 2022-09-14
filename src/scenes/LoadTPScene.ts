import Phaser from 'phaser'
import { loadBodyAnimation } from '~/dataload/AnimationLoader'
import { Avatar } from '~/player/v2/Avatar'

export default class LoadTPDemo extends Phaser.Scene
{

	constructor()
	{
		super('hello-world')
	}

	preload()
	{
			this.load.setBaseURL('http://localhost/assert/wz/')
			this.load.atlas("Character/00002000", "Character/00002000.img.tp.png", "Character/00002000.img.tp.json")
			this.load.json("00002000.img", "Character/00002000.img.xml.json")
	}

	create() {
		var bodynode = this.cache.json.get("00002000.img")
		// 加载动作
		loadBodyAnimation(bodynode, this)

		this.add.sprite(100, 100, "Character/00002000", "-alert-0-arm.jpg")
		var avatar = new Avatar(this, 100, 100)
		avatar.anims.play("motion/walk1")

	}
	
	update(time: number, delta: number): void {
			
	}
	
}
