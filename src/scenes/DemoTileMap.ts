import Phaser from 'phaser'
import MapObject from '~/map/MapObject';
import { IWzStorage } from '~/wzStorage/IWzStorage';
import RPCWzStorage from '~/wzStorage/RPCWzStorge';
import { getFromTiledProperties } from '~/wzStorage/Utils';

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

			

			const map = this.make.tilemap({key: "map001"})
			const tileset = map.addTilesetImage("grassSoilTileSet", "grassSoilTileSet")

			const layer2 = map.createLayer("TileLayer2", tileset)
			const layer1 = map.createLayer("TileLayer1", tileset)
			// const layer3 = map.createLayer("MapObject", {})
			layer1.setCollisionByProperty({ collides: true })
			layer2.setCollisionByProperty({ collides: true })

			this.matter.world.convertTilemapLayer(layer1)
			this.matter.world.convertTilemapLayer(layer2)

			const mapobjects = map.createFromObjects("MapObject", {})
			const mapobjectLayer = map.getObjectLayer("MapObject")
			const basePath = getFromTiledProperties(mapobjectLayer.properties, "basePath")

			mapobjects.forEach(obj => {
				let wzId = obj.getData("wzId")
				console.log("wzId: ", wzId)
				if (wzId) {
					this.wzStorage.getMapObjectNode(basePath + "/" + wzId, (wznode, mapobject) => {
						console.log("mapobject got: ", mapobject)
						mapobject.setX(obj.x)
						mapobject.setY(obj.y)
						this.add.existing(mapobject)
						obj.destroy()
					})
				}
			})

			const mapobject = mapobjects[0]

			console.log("mapobject layer: ", mapobjectLayer)
			console.log("mapobject layer properties: ", getFromTiledProperties(mapobjectLayer.properties, "basePath"))


			this.input.on("pointerdown", (pointer) => {
				console.log(`x: ${pointer.x} y: ${pointer.y}`)
				// this.cameras.main.scrollX = pointer.x
				// this.cameras.main.scrollY = pointer.y

				this.wzStorage.getMapObjectNode("Map/Obj/acc1/grassySoil/market.img/53", (wz, mapobject) => {
					mapobject.setX(pointer.x)
					mapobject.setY(pointer.y)
					this.add.existing(mapobject)
					// this.matter.add.gameObject(mapobject)
				})

				var tileX = map.worldToTileX(pointer.x)
				var tileY = map.worldToTileX(pointer.y)

				var tile = map.getTileAt(tileX, tileY)
				if (tile) {
					console.log("got tile:", tile)
				}

			})
    }
   
}
