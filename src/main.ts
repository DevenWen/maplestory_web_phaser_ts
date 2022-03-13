import Phaser, { Scene } from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import StepOneScene from './scenes/StepOneScene'
import TestScene from './scenes/TestScene'
import TestMobScene from './scenes/TestMobScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	fps: {
		// target: 30,
		// forceSetTimeOut: true
	},
	physics: {
		default: 'matter',
		arcade: {
			gravity: { y: 200 },
			fps: 1
		},
		matter: {
				debug: true,
				gravity: {
						y: 1
				},
		}
	},
	scene: [TestMobScene],
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: true
	}
}

export default new Phaser.Game(config) 
