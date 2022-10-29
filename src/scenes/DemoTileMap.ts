import Phaser from 'phaser'
import MapObject from '~/map/MapObject';
import { IWzStorage } from '~/wzStorage/IWzStorage';
import RPCWzStorage from '~/wzStorage/RPCWzStorge';

export default class DemoTileMap extends Phaser.Scene
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
			this.load.tilemapTiledJSON("map001", "Map/Map0/map001.json")
			this.load.image("grassSoilTileSet", "Map/TileSet/grassSoilTileSet.png")
    }

    create() 
		{

			this.input.on("pointerdown", (pointer) => {
				console.log(`x: ${pointer.x} y: ${pointer.y}`)
				// this.cameras.main.scrollX = pointer.x
				// this.cameras.main.scrollY = pointer.y

				this.wzStorage.getMapObjectNode("Map/Obj/acc1/grassySoil/artificiality.img/10", (wz, mapobject) => {
					mapobject.x = pointer.x
					mapobject.y = pointer.y
					this.add.existing(mapobject)
					this.matter.add.gameObject(mapobject)
				})
			})

			const map = this.make.tilemap({key: "map001"})
			const tileset = map.addTilesetImage("grassSoilTileSet", "grassSoilTileSet")

			const layer2 = map.createLayer("TileLayer2", tileset)
			const layer1 = map.createLayer("TileLayer1", tileset)
			layer1.setCollisionByProperty({ collides: true })
			layer2.setCollisionByProperty({ collides: true })

			this.matter.world.convertTilemapLayer(layer1)
			this.matter.world.convertTilemapLayer(layer2)
			
    }
   
}
