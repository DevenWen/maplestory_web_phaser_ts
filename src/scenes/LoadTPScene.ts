import Phaser from 'phaser'
import { loadBodyAnimation } from '~/dataload/AnimationLoader'
import { Avatar } from '~/player/v2/Avatar'
import { createWzNode } from '~/wzStorage/WzNode'
import { IWzStorage } from '~/wzStorage/IWzStorage'
import RPCWzStorage from '~/wzStorage/RPCWzStorge'

export default class LoadTPDemo extends Phaser.Scene
{
	avatar: Avatar
	wzStorage: IWzStorage;
	motion_list = []

	constructor()
	{
		super('hello-world')
	}

	preload()
	{
		this.wzStorage = new RPCWzStorage(this)
		this.load.setBaseURL('http://localhost/assert/wz/')

		// 打印所有的动作
		this.anims.addListener("motionadd", (motion_name) => {
			console.log("loaded animation: " + motion_name)
			this.motion_list.push(motion_name)
			this.add.text(400, this.motion_list.length * 15, motion_name)
				.setInteractive()
				.on("pointerdown", () => {
					this.avatar.play({
						key: motion_name,
						repeat: -1,
					})
				})
		})
	}

	create() {
		// 坐标
		this.setIcon()
		
		
		// 人物测试
		this.avatar = new Avatar(this, 200, 200)
		this.avatar.anims.play({
			key: "motion/walk1",
			repeat: -1,
			yoyo: false
		})

	}

	setIcon() {
		this.add.text(10, 200, "FLIP")
			.setInteractive()
			.on("pointerdown", (pointer) => {
				console.log("set flip")
				this.avatar.setFlipX(!this.avatar.flipX)
			})


		var text1 = this.add.text(10, 10, '');
		this.input.on("pointermove", (pointer) => {
			text1.setText(`x: ${pointer.x} y: ${pointer.y}`)
		})
	}
	
	update(time: number, delta: number): void {
			
	}
	
}
