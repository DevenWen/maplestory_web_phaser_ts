import Phaser, { Scene } from 'phaser'
import DemoMap from './scenes/DemoMap'
import HelloWorldScene from './scenes/HelloWorldScene'
import LoadTPDemo from './scenes/LoadTPScene'
import TestMobScene from './scenes/TestMobScene'
import TiledMap from './scenes/TiledMap1'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	// backgroundColor: '#4488aa',
	width: 600,
	height: 400,
	fps: {
		// target: 30,
		// forceSetTimeOut: true
	},
	physics: {
		default: 'matter',
		matter: {
				debug: true,
				gravity: {
						y: 0
				},
		}
	},
	scene: [DemoMap],
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: true
	},
	scale: {
		zoom: 2
	}
}

export default new Phaser.Game(config) 
