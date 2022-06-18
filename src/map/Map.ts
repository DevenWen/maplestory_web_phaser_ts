import { Tilemaps } from "phaser";
import { DataLoader } from "~/dataload/DataStorage"
import Sprite = Phaser.GameObjects.Sprite
import Camera = Phaser.Cameras.Scene2D.Camera

enum BackGroundType {
	TILED = 3, // 全摄像机
	HMOVEA = 4, // x 轴 滑动
	VMOVEA = 5,
	HMOVEB = 6,
	VMOVEB = 6,
}

class Obj
{
	x;y;z;zm;zid;rx;ry;cx;cy;flow;flip;sprite
	constructor(node, scene: Phaser.Scene) {
		this.x = node.x;
    this.y = node.y;
    this.z = node.z;
    this.zm = node.zM;
    this.zid = parseInt(node.name, 10);
    this.rx = node.rx;
    this.ry = node.ry;
    this.cx = node.cx;
    this.cy = node.cy;
    this.flow = node.flow;
    this.flip = node.f === 1;
    this.sprite = null;

		if ((this.flow & 1) != 0 && !this.cx) {
      this.cx = 1000;
    }

    if ((this.flow & 2) != 0 && !this.cy) {
      this.cy = 1000;
    }

		DataLoader.getWzNode(`Map/Obj/${node.oS}.img/${node.l0}/${node.l1}/${node.l2}`, obj => {
			if (obj == null) {
				console.warn("Map Object not found, path: ", `Map/Obj/${node.oS}.img/${node.l0}/${node.l1}/${node.l2}`)
				return
			}
			console.log("found map obj:", obj)

			// TODO create sprite
			this.sprite = new Sprite(scene, 0, 0, "")
		})
	}
}

class Tile
{
	x;y;texture;depth;draw;sprite
	node
	constructor(node, x, y, texture, depth)
	{
		this.node = node
		this.x = x
		this.y = y
		this.texture = texture
		this.depth = depth
		this.draw = false
	}

	flip(): boolean
	{
		return this.node["f"] == 1
	}
}

class Back
{
	x;y;rx;ry;cx;cy;type;texture;depth;draw;
	gameobject;
	img;
	node;

	constructor(node, img, x, y, texture, depth)
	{
		this.node = node
		this.img = img
		this.x = x
		this.y = y
		this.rx = node['rx']
		this.ry = node['ry']
		this.cx = node['cx']
		this.cy = node['cy']
		this.type = node['type']
		this.texture = texture
		this.depth = depth
		this.draw = false
	}

	flip(): boolean 
	{
		return this.node["f"] == 1
	}
}


/**
 * 冒险岛地图类
 */
export class MapleMap
{
	private path
	private map_id
	private imgNode
	private layers = new Array(8)
	private scene: Phaser.Scene
	private tiles: Tile[] = []
	private backs: Back[] = []

	private WOFFSET: number
	private HOFFSET: number

	constructor(scene: Phaser.Scene, map_id, path) 
	{
		const {width, height} = scene.scale
		this.WOFFSET = width / 2
		this.HOFFSET = height / 2

		this.map_id = map_id
		this.path = path
		this.scene = scene
		this.scene.textures.on(Phaser.Textures.Events.ADD, texture => {
			// texture 加载完成后，进行渲染
			this.tiles.filter(tile => !tile.draw && tile.texture == texture).forEach(tile => {
				tile.sprite = this.scene.add.image(tile.x, tile.y, tile.texture)
					.setOrigin(0, 0)
					.setFlipX(tile.flip())
					.setDepth(tile.depth)
				tile.draw = true
			})

			this.backs.filter(back => !back.draw && back.texture == texture).forEach(back => {
				this.renderback(back)
				back.draw = true
			})
		})
	}

	public load(): void
	{
		DataLoader.getWzNode(this.path, (node) => {
			console.log("MapleMap load callback: ", this.map_id, this.path)
			this.imgNode = node
			this.loadTiles()
			this.loadObjects()
			// this.loadFoothold()
			this.loadBack()
		})
	}

	public update(time: number, delta: number): void {
		this.backs.forEach(back => {

			switch (back.type) {
				case BackGroundType.HMOVEA:
				case BackGroundType.HMOVEB:
					if (back.draw) {
						var tilesprit = back.gameobject as Phaser.GameObjects.TileSprite
						tilesprit.tilePositionX += back.node["rx"] / 16
					}
					break
				case BackGroundType.VMOVEA:
				case BackGroundType.VMOVEB:
					if (back.draw) {
						var tilesprit = back.gameobject as Phaser.GameObjects.TileSprite
						tilesprit.tilePositionX += back.node["ry"] / 16
					}
					break
			}
		})
	}

	private loadBack()
	{
		// 加载背景
		var backinfo = this.imgNode['back']
		backinfo.forEach((node, index) => {
			console.log("backnode:", node, index)
			// TODO 还有动画类型的资源
			let path = `Map/Back/${node.bS}.img/back/${node.no}`
			DataLoader.getWzSprite(path, (img, textureKey) => {
				console.log(path, textureKey, img)
				let origin = img["origin"]
				this.backs.push(
					new Back(
						node,
						img,
						(node.x - origin.X) + this.WOFFSET, 
						(node.y - origin.Y) + this.HOFFSET,
						textureKey, 
						index - 100)
				)
			})
		})
	}

	private renderback(back: Back) {
		// 渲染背景图, 将层次设置进去
		const {width, height} = this.scene.scale
		console.log("renderback: ", back)

		let scrollX = 0
		let scrollY = 0
		
		scrollX = - back.rx / 100
		scrollY = - back.ry / 100
		
		if (back.type == BackGroundType.TILED) {
			back.gameobject = this.scene.add.tileSprite(0, 0, width, height, back.texture)
				.setOrigin(0,0)
				.setScrollFactor(0, 0)
				.setFlipX(back.flip())
				.setDepth(back.depth)
			return
		}

		if (back.type == BackGroundType.HMOVEA) {
			// 横向移动
			back.gameobject = this.scene.add.tileSprite(0, back.y, width, 0, back.texture)
				.setOrigin(0,0)
				.setScrollFactor(0, scrollY)
				.setFlipX(back.flip())
				.setDepth(back.depth)
			return
		}

		if (back.type == BackGroundType.VMOVEA) {
			back.gameobject = this.scene.add.tileSprite(back.x, 0, 0, height, back.texture)
				.setOrigin(0,0)
				.setScrollFactor(scrollX, 0)
				.setFlipX(back.flip())
				.setDepth(back.depth)
			return
		}

		this.scene.add.image(back.x, back.y, back.texture)
		.setOrigin(0, 0)			
		.setScrollFactor(scrollX, scrollY)
		.setFlipX(back.flip())
		.setDepth(back.depth)
	}

	private loadFoothold()
	{
		// TODO 落脚地，建立物理平台
		this.imgNode['foothold'].forEach((layerNode) => {
			console.log("laynode", layerNode)
			layerNode.forEach(groupNode => {
				console.log("groupnode", groupNode)
				var dl = this.scene.add.graphics()
				dl.lineStyle(5, 0x0000FF, 1.0);
				dl.beginPath()
				groupNode.forEach(holdNode => {
					console.log("holdNode", holdNode)
					
					dl.moveTo(holdNode.x1, holdNode.y1)
					dl.lineTo(holdNode.x2, holdNode.y2)
				})
				dl.closePath()
				dl.strokePath()
			})
		})
	}

	private loadTiles() 
	{
		// 8 层的绘制
		for (var i = 0; i < 8; i++) 
		{
			var input = this.imgNode[i]
			var tileSet = input["info"]["tS"]

			if (tileSet) {
				input["tile"].forEach(node => {
					let tilepath = `Map/Tile/${tileSet}.img/${node.u}/${node.no}`
					DataLoader.getWzSprite(tilepath, (img, textureKey) => {
						let origin = img["origin"]
						this.tiles.push(
							new Tile(node, node.x - origin.X + this.WOFFSET, node.y - origin.Y + this.HOFFSET, textureKey, i - 80)
						)
					})
				})
			}
		}
	}

	private loadObjects() {
		// TODO 加载地图的 object
	}

}