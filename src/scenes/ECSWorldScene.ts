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
import DataLoader from '~/dataload/DataStorage'
import game from '~/main'

const Position = defineComponent({
	x: Types.f32,
	y: Types.f32
})

const STANCE = [
	"walk1"
]

const Sprite = defineComponent({
	head: Types.ui32,
	body: Types.ui32,
	stance: Types.i8,	 // 动作
	frame: Types.ui8,	 // 动作帧
})

// const spriteById = new Map<number, Phaser.GameObjects.Sprite>()
const groupById = new Map<number, Phaser.GameObjects.Group>() 
const spriteQuery = defineQuery([Sprite, Position])
const spriteQueryEnter = enterQuery(spriteQuery)
const spriteQueryExit = exitQuery(spriteQuery)
const createSpriteSystem = (scene: ECSWorldScene) => { 
	return defineSystem(world => {
		const enterEntity = spriteQueryEnter(world)
		// 新加入的 entity
		for (let i = 0; i < enterEntity.length; ++ i)
		{
			const id = enterEntity[i]
			// 构建一个 group
			const group = new Phaser.GameObjects.Group(scene)
			console.log("create entity, ", id, group)
			groupById.set(id, group)
		}
		
		const entities = spriteQuery(world)
		for (let i = 0; i < entities.length; ++ i)
		{
			const id = entities[i]
			const group = groupById.get(id)

			if (!group)
			{
				continue
			}

			// 清理图层
			group.clear(true)

			const x = Position.x[id]
			const y = Position.y[id]

			// TODO 重新渲染图层
			const stance = STANCE[Sprite.stance[id]]
			const frame = Sprite.frame[id]

			const body_map = {}
			// 1. body
			scene.dataloader.getDataNode(`Character.wz/00002000.img/${stance}/${0}`, (node) => {
				// console.info("load 00002000.img success", node)
				// 绘制
				
			})

			// 2. head
			scene.dataloader.getDataNode(`Character.wz/00012000.img/${stance}/${0}`, (node) => {
				console.info("load 00012000.img success", node)
			})
			
		}

		const exitEntities = spriteQueryExit(world)
		for (let i = 0; i < exitEntities.length; i++)
		{
			const id = exitEntities[i]
			const group = groupById.get(id)

			if (!group)
			{
				continue
			}

			group.destroy(true)
			groupById.delete(id)
		}

		return world
	})
}



export default class ECSWorldScene extends Phaser.Scene 
{
	
	public dataloader!: DataLoader
	private world!: IWorld
	private spriteSystem!: System

	constructor()
	{
		super('ecs-wolrd')
	}

	preload()
	{
		this.dataloader = new DataLoader(game)
		console.log("proload")
	}

	create() 
	{
		console.log("create")
		this.world = createWorld()

		const player = addEntity(this.world)

		addComponent(this.world, Position, player)

		Position.x[player] = 100
		Position.y[player] = 100

		addComponent(this.world, Sprite, player)

		Sprite.head[player] = 2000
		Sprite.body[player] = 12000
		Sprite.stance[player] = 0
		Sprite.frame[player] = 0

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