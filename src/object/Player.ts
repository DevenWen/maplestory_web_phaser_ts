
class TPoint {
	public x: number = 0
	public y: number = 0
}

function copy(c: TPoint) {
	let r = new TPoint()
	r.x = c.x
	r.y = c.y
	return r
}

export default class Player 
{

	private scene: Phaser.Scene;

	public name = "unknown_player"
	public emotion = 'hot'
	public emotion_frame = 0;
	public stance = 'walk1';		// 某一个动作
	public stance_frame = '1';		// 某一帧
	public stance_delay = 0;
	public stance_max_frames = 3;
	public stance_walk_type = 1;
	public stance_stand_type = 1;
	public elven_ears = false;
	public weapongroup = -1
	public showface = true;

	public x = 0;
	public y = 0;
	public flip = false;

	public skin = 0
	public hair = 0
	public face = 0
	public data_buffer = new Map()		// TODO 设计一个更加好用的数据缓存器
	public itemset: (number)[] = [];

	// 坐标
	public Neck: TPoint = new TPoint
	public Navel: TPoint = new TPoint
	public Hand: TPoint = new TPoint
	public Brow: TPoint = new TPoint 
	public HandMove: TPoint = new TPoint

	public ArmHand = new TPoint
	public ArmNavel = new TPoint 
	public BodyNeck = new TPoint 
	public BodyNavel = new TPoint 
	public BodyHand = new TPoint 
	public lHandMove = new TPoint 
	public HeadBrow = new TPoint
	public HeadNeck = new TPoint

	private drawGroup: Phaser.GameObjects.Group
	
	constructor(scene: Phaser.Scene, x: number, y: number)
	{
		this.scene = scene
		this.drawGroup = new Phaser.GameObjects.Group(scene)
		this.x = x
		this.y = y
	}

	/**
	 * add_image
	 */
	public add_image(id, stance, frame, name, node) {
		// this.data_buffer.set(key, node)
		// TODO 应定制一个素材资源缓存器
		if (!this.data_buffer.has(stance)) this.data_buffer.set(stance, new Map)
		let stanceMap = this.data_buffer.get(stance)
		if (!stanceMap.has(frame)) stanceMap.set(frame, new Map)
		let frameMap = stanceMap.get(frame)
		let key = `${id}-${stance}-${frame}-${name}`  // id-动作-帧数-部位
		frameMap.set(key, node)
	}

	// public confirm_image(id, stance, frame, name) {
		// this.data_buffer.get(stance).get(frame).get(`${id}-${stance}-${frame}-${name}`)['ok'] = true
	// }

	// TODO 未来要迁移到 component 组件上
	public update(ts: number) {
		// 需要先擦出，再渲染。还需要看 action 的延迟，选择性擦除
		if (ts < this.stance_delay) {
			return
		}

		this.drawGroup.getChildren().forEach(child => {
			child.destroy()
		})

		this.stance_delay = ts + 1000

		let stance = this.stance
		let frame = this.stance_frame
		if (this.data_buffer.has(stance)) {
			let stanceMap = this.data_buffer.get(stance)
			if (stanceMap.has(frame)) {
				let frameMap = stanceMap.get(frame)
				frameMap.forEach((value, key) => {
					if (this.scene.textures.exists(key)) {
						let offset = this.calOffset(value)
						this.drawGroup.add(this.scene.add.image(this.x + offset.x, this.y + offset.y, key).setOrigin(0))
					}
				})
			}
		}
	}

	/**
     * 计算偏移量
     * @param node 
     */
	calOffset(node) {
		// 这里的算法有点迷，但是可行。
		// 参考：https://forum.ragezone.com/f923/looking-render-maplestory-gms-v83-1176964/
		let name = node.name
		let originx = - node.origin.X
		let originy = - node.origin.Y

		let offset = new TPoint()

		if (node.map['brow']) {
			let brow = node.map['brow']
			this.Brow.x = -brow.X
			this.Brow.y = -brow.Y

			if (name == 'head') {
				this.HeadBrow = copy(this.Brow)
			}

			offset.x = originx + this.HeadNeck.x - this.BodyNeck.x - this.HeadBrow.x + this.Brow.x
			offset.y = originy + this.HeadNeck.y - this.BodyNeck.y - this.HeadBrow.y + this.Brow.y
		}

		if (node.map['neck']) {
			let neck = node.map['neck']
			this.Neck.x = -neck.X
			this.Neck.y = -neck.Y
			if (name == 'body') {
				this.BodyNeck = copy(this.Neck)
			}
			if (name == 'head') {
				this.HeadNeck = copy(this.Neck)
			}
		}

		if (node.map['hand']) {
			let hand = node.map['hand']
			this.Hand.x = -hand.X
			this.Hand.y = -hand.Y
			if (name == 'arm') {
				this.ArmHand = copy(this.Hand)
			}
			if (name == 'body') {
				this.BodyHand = copy(this.Hand)
			}

			offset.x = originx + this.Hand.x + this.ArmNavel.x - this.ArmHand.x - this.BodyNavel.x
			offset.y = originy + this.Hand.y + this.ArmNavel.y - this.ArmHand.y - this.BodyNavel.y
		}

		if (node.map['handMove']) {
			let handMove = node.map['handMove']
			this.HandMove.x = -handMove.X
			this.HandMove.y = -handMove.Y
			if (name == 'lhand') {
				this.lHandMove = copy(this.HandMove)
			}

			offset.x = originx + this.HandMove.x - this.lHandMove.x
			offset.y = originy + this.HandMove.y - this.lHandMove.y
		}

		if (node.map['navel']) {
			let navel = node.map['navel']
			this.Navel.x = -navel.X
			this.Navel.y = -navel.Y

			if (name == 'arm') {
				this.ArmNavel = copy(this.Navel)
			}
			if (name == 'body') {
				this.BodyNavel = copy(this.Navel)
			}

			offset.x = originx + this.Navel.x - this.BodyNavel.x
			offset.y = originy + this.Navel.y - this.BodyNavel.y
		}



		return offset
	}





}