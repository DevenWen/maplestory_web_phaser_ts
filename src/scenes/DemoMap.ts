import Phaser from 'phaser'
import { IWzStorage } from '~/wzStorage/IWzStorage';
import RPCWzStorage from '~/wzStorage/RPCWzStorge';

export default class DemoMap extends Phaser.Scene
{
		wzStorage: IWzStorage;

		constructor()
		{
			super('hello-map')
		}

		preload()
    {
			this.wzStorage = new RPCWzStorage(this)
			this.load.setBaseURL('http://localhost/assert/wz/')
    }

    create() 
		{
			this.input.on("pointerdown", (pointer) => {
				console.log(`x: ${pointer.x} y: ${pointer.y}`)
				const scene = this

				this.wzStorage.listCanvasNode("Map/Obj/acc1/grassySoil/nature.img/26", (wzNode, img) => {
					console.log("wzNode", wzNode)
					console.log("img", img)
					img.x = pointer.x
					img.y = pointer.y
					scene.add.existing(img)

				})
			})
			
    }
   
}
