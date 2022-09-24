import Phaser from 'phaser'
import { loadBodyAnimation } from '~/dataload/AnimationLoader'
import { Avatar } from '~/player/v2/Avatar'
import { createWzNode } from '~/wzStorage/WzNode'
import { IWzStorage } from '~/wzStorage/IWzStorage'
import RPCWzStorage from '~/wzStorage/RPCWzStorge'

export default class LoadTPDemo extends Phaser.Scene
{
	// wznode = createWzNode({}, null, this)
	wzStorage: IWzStorage;

	constructor()
	{
		super('hello-world')
	}

	preload()
	{
			this.wzStorage = new RPCWzStorage(this)
			this.load.setBaseURL('http://localhost/assert/wz/')
			this.load.json("Character/00002000.img", "Character/00002000.img.xml.json")
			// this.load.atlas("Character/00002000.img", "Character/00002000.img.tp.png", "Character/00002000.img.tp.json")
	}

	create() {
		var bodynode = this.cache.json.get("Character/00002000.img")
		// 加载动作
		loadBodyAnimation(bodynode, this)
		console.log("create")
		// this.load.atlas("Character/00002000.img", "Character/00002000.img.tp.png", "Character/00002000.img.tp.json")
		// this.load.json("Character/00002000.img", "Character/00002000.img.xml.json")
		// this.load.start()

		this.input.on('pointerup', () => {
			this.wzStorage.getWzNode("Character/00002000.img/alert/0/arm", (data) => {
				// console.debug("callback: data")
				this.add.sprite(
					Phaser.Math.Between(0, 800), 
					Phaser.Math.Between(0, 600), 
					"Character/00002000.img.texutre", 
					"-alert-0-arm.jpg"
				)
			})
		})


		// this.add.sprite(100, 100, "Character/00002000", "-alert-0-arm.jpg")
		var avatar = new Avatar(this, 100, 100)
		avatar.anims.play("motion/walk1")

	}
	
	update(time: number, delta: number): void {
			
	}
	
}