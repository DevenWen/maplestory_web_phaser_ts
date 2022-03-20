import Phaser from 'phaser'

export default class DemoMap extends Phaser.Scene
{

		constructor()
		{
			super('hello-world')
		}

		preload()
    {
			this.load.setBaseURL('http://localhost/assert/wz')
			this.load.atlas("grassySoil", 'tilemap/grassySoil.png', 'tilemap/grassySoil.json')
			this.load.tilemapTiledJSON("demomap", "tilemap/demo.tmj")
    }

    create() 
		{
			const map = this.make.tilemap({key: "demomap"})
			const tileset = map.addTilesetImage("grassySoild", )
			// const tileset = map.addTilesetImage("grassySoil", "grassySoil")

			// const ground = map.createLayer('ground', tileset)

			// this.add.image(100, 100, "grassySoil", "-bsc-0-w=90-h=60.jpg")


        
    }
   
}
