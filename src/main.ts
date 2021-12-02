import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import LoaderScene from './scenes/LoaderScene'
import StepOneScene from './scenes/StepOneScene'
import ECSWorldScene from './scenes/ECSWorldScene'
import TestScene from './scenes/TestScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	fps: {
		target: 1,
		forceSetTimeOut: true
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
	scene: [TestScene],
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: true
	}
}

export default new Phaser.Game(config) 
