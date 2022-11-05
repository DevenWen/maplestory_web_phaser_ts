import Phaser from 'phaser'
import { Background } from '~/map/Background';
import MapObject from '~/map/MapObject';
import { IWzStorage } from '~/wzStorage/IWzStorage';
import RPCWzStorage from '~/wzStorage/RPCWzStorge';

export default class DemoMap extends Phaser.Scene
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
			this.background = new Background(this, "Map/Map/000010000.img.xml.json")
			this.background.preload()

			// 1. 加载 json 配置
			// this.load.json("mapconfig", "Map/Map/000010000.img.xml.json")
    }

    create() 
		{
			this.background.create()
			this.cursors = this.input.keyboard.createCursorKeys();
			this.wzStorage.getMapObjectNode(`Map/Obj/acc1/grassySoil/nature.img/0`, (wznode, obj) =>{
				console.log("load: ", obj)
				const {width, height} = this.scale
				obj.setX(width/2)
				obj.setY(height/2)
				// this.add.existing(obj)
				this.spirter = this.physics.add.image(obj.x, obj.y, obj.texture.key, obj.frame.name)

				this.cameras.main.startFollow(this.spirter, true)
			})
		
    }

		update(time: number, delta: number): void {
			this.events.emit("update")
			
			if (this.cursors.left.isDown)
        {
            this.spirter.setAngle(-90).x -= 10
        }
        else if (this.cursors.right.isDown)
        {
            this.spirter.setAngle(90).x += 10
        }

        if (this.cursors.up.isDown)
        {
            this.spirter.setAngle(0).y -= 10
        }
        else if (this.cursors.down.isDown)
        {
            this.spirter.setAngle(-180).y += 10
        }
		}
   
}
