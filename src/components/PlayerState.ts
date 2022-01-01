import StateMachine from "~/statemachine/StateMachine";
import { IComponent } from "./ComponentService";

export class PlayerState implements IComponent{

	private sprite!: Phaser.Physics.Matter.Sprite
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private stateMachine: StateMachine


	constructor(cursors: Phaser.Types.Input.Keyboard.CursorKeys)
	{
		this.cursors = cursors
		this.stateMachine = new StateMachine(this, "player")
	}

	init(go: Phaser.Physics.Matter.Sprite) {
		console.log(`init player statement, ${go.name}`)
		this.sprite = go
		// 增加玩家的状态
		this.stateMachine
		.addState('idle', {
			onEnter: this.idleOnEnter,
			onUpdate: this.idleOnUpdate
		})
		.addState('walk', {
			onEnter: this.walkEnter,
			onUpdate: this.walkOnUpdate
		})
		.setState('idle')

		// TODO 增加玩家更多的状态
	}

	private idleOnEnter() {
		// TODO 执行动画播放
	}

	private idleOnUpdate() {
		
	}

	private walkEnter() {

	}

	private walkOnUpdate() {

	}

	awake?: (() => void) | undefined;
	start?: (() => void) | undefined;
	update(dt: number)
	{
			this.stateMachine.update(dt)
	}
	destroy?: (() => void) | undefined;
	
}