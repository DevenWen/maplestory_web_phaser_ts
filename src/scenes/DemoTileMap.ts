import Phaser from 'phaser'
import { Background } from '~/map/Background';
import MapObject from '~/map/MapObject';
import { IWzStorage } from '~/wzStorage/IWzStorage';
import RPCWzStorage from '~/wzStorage/RPCWzStorge';
import { getFromTiledProperties } from '~/wzStorage/Utils';

export default class DemoTileMap extends Phaser.Scene
{
		wzStorage: IWzStorage;
		background: Background
		spirter; 
		cursors: Phaser.Types.Input.Keyboard.CursorKeys


		constructor()
		{
			super('hello-map')
		}

		preload()
    {
			this.wzStorage = new RPCWzStorage(this)
			this.load.setBaseURL('http://localhost/assert/wz/')
			this.load.tilemapTiledJSON("map001", "Map/MapSetting/map001.json")
			this.load.image("grassSoilTileSet", "Map/TileSet/grassSoilTileSet.png")
			this.background = new Background(this, "Map/Map/000010000.img.xml.json")
			this.background.preload()
    }

    create() 
		{
			this.background.create()
			this.background.layer.setDepth(-1)
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

			this.cursors = this.input.keyboard.createCursorKeys();
			this.wzStorage.getMapObjectNode(`Map/Obj/acc1/grassySoil/nature.img/0`, (wznode, obj) =>{
				console.log("load: ", obj)
				const {width, height} = this.scale
				obj.setX(width/2)
				obj.setY(height/2)
				this.add.existing(obj)
				// this.spirter = this.physics.add.image(obj.x, obj.y, obj.texture.key, obj.frame.name)
				this.spirter = obj

				this.cameras.main.startFollow(this.spirter, true)
			})

		}

		update(time: number, delta: number): void {
			
			if (this.cursors.left.isDown)
        {
            this.spirter.setAngle(-90).x -= 1
        }
        else if (this.cursors.right.isDown)
        {
            this.spirter.setAngle(90).x += 1
        }

        if (this.cursors.up.isDown)
        {
            this.spirter.setAngle(0).y -= 3
        }
        else if (this.cursors.down.isDown)
        {
            this.spirter.setAngle(-180).y += 3
        }
		}
   
}
