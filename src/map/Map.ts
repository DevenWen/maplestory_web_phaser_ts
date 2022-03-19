import { Tilemaps } from "phaser";
import { DataLoader } from "~/dataload/DataStorage"
import Sprite = Phaser.GameObjects.Sprite


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
	x;y;texture;depth;draw;
	constructor(x, y, texture, depth)
	{
		this.x = x
		this.y = y
		this.texture = texture
		this.depth = depth
		this.draw = false
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

	constructor(scene: Phaser.Scene, map_id, path) 
	{
		this.map_id = map_id
		this.path = path
		this.scene = scene
		this.scene.textures.on(Phaser.Textures.Events.ADD, texture => {
			// texture 加载完成后，进行渲染
			this.tiles.filter(tile => !tile.draw && tile.texture == texture).forEach(tile => {
				tile.draw = true
				this.scene.add.image(tile.x, tile.y, tile.texture).setOrigin(0, 0).setDepth(tile.depth)
			})
		})
	}

	public load(): void
	{
		DataLoader.getWzNode(this.path, (node) => {
			console.log("MapleMap load callback: ", this.map_id, this.path)
			this.imgNode = node
			this.loadSprites()
			this.loadFoothold()
			this.loadBack()
		})
	}

	private loadBack()
	{
		// 加载背景

	}

	private loadFoothold()
	{
		// 加载落脚地，建立物理平台
		// console.log("load Foothold", this.imgNode)

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

					// cube.fillStyle(0xffffff, 1);
    			// cube.fillRect(0, 0, 200, 200);
					// this.scene.matter.add.gameObject(dl)
					// var dl = this.scene.add.graphics()
					// this.scene.matter.add.rectangle(0, 0, 0, 0, {})
					// forbidFallDown: 1
					// name: "82"
					// next: 83
					// prev: 81
					// x1: 546
					// x2: 624
					// y1: 425
					// y2: 425
				})
				dl.closePath()
				dl.strokePath()
				// this.scene.matter.add.gameObject(dl)
				// this.scene.matter(dl)
			})


		})
		// this.scene.matter.add.rectangle()

	}

	private loadSprites() 
	{
		// 8 层的绘制
		for (var i = 0; i < 8; i++) 
		{
			var output = this.layers[i] = {}
			var input = this.imgNode[i]
			var tileSet = input["info"]["tS"]

			// output["objects"] = []
			// input['obj'].forEach(obj => {
			// 	output["objects"].push(new Obj(obj, this.scene))
			// })

			// output["objects"].sort((a, b) => {
			// 	if (a.z == b.z) {
			// 		return a.zid - b.zid
			// 	} else {
			// 		return a.z - b.z
			// 	}
			// })

			// output["objects"].forEach((elem) => {
			// 	console.log("绘制 objects: ", elem)
			// 	// var image = this.scene.add.image(
			// 	// 	elem.x - elem.sprite.originX,
			// 	// 	elem.y - elem.sprite.originY,
			// 	// 	elem.sprite.textureKey
			// 	// )

			// 	if (elem.flip)
			// 	{
			// 		// TODO 反转
			// 		console.log("TODO flip elem")
			// 	}
			// })

			if (tileSet) {
				input["tile"].forEach(node => {
					let tilepath = `Map/Tile/${tileSet}.img/${node.u}/${node.no}`
					DataLoader.getWzSprite(tilepath, (img, textureKey) => {
						let origin = img["origin"]
						this.tiles.push(
							new Tile(node.x - origin.X, node.y - origin.Y, textureKey, img.z)
						)
					})
				})
			}
		}
	}






}