import Phaser, { Scene } from 'phaser'
import DemoMap from './scenes/DemoMap'
import HelloWorldScene from './scenes/HelloWorldScene'
import LoadTPDemo from './scenes/LoadTPScene'
import TestMobScene from './scenes/TestMobScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	// backgroundColor: '#4488aa',
	width: 1024,
	height: 768,
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
	scene: [LoadTPDemo],
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: true
	}
}

export default new Phaser.Game(config) 
