import Phaser, { Scene } from 'phaser'
import DemoMap from './scenes/DemoMap'
import DemoTileMap from './scenes/DemoTileMap'
import HelloWorldScene from './scenes/HelloWorldScene'
import LoadTPDemo from './scenes/LoadTPScene'
import TestMobScene from './scenes/TestMobScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	// backgroundColor: '#4488aa',
	width: 1024,
	height: 800,
	fps: {
		// target: 30,
		// forceSetTimeOut: true
	},
	physics: {
		default: 'matter',
		// default: 'arcade',
		matter: {
				debug: true
		}
	},
	scene: [DemoTileMap],
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: true
	},
	scale: {
		zoom: 1
	}
}

export default new Phaser.Game(config) 
