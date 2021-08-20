import Phaser from 'phaser'
import {
	createWorld,
	addEntity,
	addComponent,
	defineComponent,
	Types,
	defineSystem,
	defineQuery,
	enterQuery,
	exitQuery,
	System,
	IWorld
} from 'bitecs'

const Position = defineComponent({
	x: Types.f32,
	y: Types.f32
})

const Sprite = defineComponent({
	head: Types.ui32,
	body: Types.ui32
})

const spriteById = new Map<number, Phaser.GameObjects.Sprite>()
const spriteQuery = defineQuery([Sprite, Position])
const spriteQueryEnter = enterQuery(spriteQuery)
const spriteQueryExit = exitQuery(spriteQuery)
const createSpriteSystem = (scene: Phaser.Scene) => { 
	return defineSystem(world => {
		const enterEntity = spriteQueryEnter(world)
		for (let i = 0; enterEntity.length; ++ i)
		{
			const id = enterEntity[i]
			// 渲染
		}
		
		const entities = spriteQuery(world)
		for (let i = 0; i < entities.length; ++ i)
		{
			const id = entities[i]
			const sprite = spriteById[id]

			if (!sprite)
			{
				continue
			}

			sprite.x = Position.x[id]
			sprite.y = Position.y[id]
		}

		const exitEntities = spriteQueryExit(world)
		for (let i = 0; i < exitEntities.length; i++)
		{
			const id = exitEntities[i]
			const sprite = spriteById.get(id)

			if (!sprite)
			{
				continue
			}

			sprite.destroy()
			spriteById.delete(id)
		}

		return world
	})
}



export default class ECSWorldScene extends Phaser.Scene 
{

	private world!: IWorld
	private spriteSystem!: System

	constructor()
	{
		super('ecs-wolrd')
	}

	preload()
	{

	}

	create() 
	{

		this.world = createWorld()

		const player = addEntity(this.world)

		addComponent(this.world, Position, player)

		Position.x[player] = 100
		Position.y[player] = 100

		addComponent(this.world, Sprite, player)

		Sprite.head[player] = 2000
		Sprite.body[player] = 12000

		this.spriteSystem = createSpriteSystem(this)
		// TODO: create entity
		// TODO: attach components
		// TODO: create systems



	}

	update(dt: number)
	{
		if (!this.world || !this.spriteSystem)
		{
			return 
		}

		// TODO: run system
		this.spriteSystem(this.world)

	}
}