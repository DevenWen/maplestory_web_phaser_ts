import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import LoaderScene from './scenes/LoaderScene'
import StepOneScene from './scenes/StepOneScene'
import ECSWorldScene from './scenes/ECSWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [ECSWorldScene],
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: true
	}
}

export default new Phaser.Game(config) 
