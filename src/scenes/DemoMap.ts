import Phaser from 'phaser'
import MapObject from '~/map/MapObject';
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

				
				// this.wzStorage.getMapObjectNode("Map/Obj/acc1/grassySoil/nature.img/0", (wznode, mapobject: MapObject) => {
				// 	console.log("this.wzStorage.getMapObjectNode: ", mapobject)
				// 	mapobject.setX(pointer.x)
				// 	mapobject.setY(pointer.y)
				// 	this.add.existing(mapobject)

				// })


				this.wzStorage.getMapObjectNode("Map/Obj/acc1/grassySoil/artificiality.img/8", (wznode, mapobject) => {
					mapobject.setX(pointer.x)
					mapobject.setY(pointer.y)
					this.add.existing(mapobject)

				})
			})
			
    }
   
}
