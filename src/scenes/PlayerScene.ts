import Phaser from 'phaser'
import game from '../main'
import DataLoader from '../dataload/DataStorage'
import Player from '../object/Player'

export default class PlayerScene extends Phaser.Scene
{

	private dataloader: DataLoader
	private player!: Player

	constructor()
	{
		super("player-scene")
		this.dataloader = new DataLoader(game)
	}

	preload()
	{
		// 初始化 Player
		this.player = new Player()
		
	}


	create() 
	{


	}

        

}