import { GameObjects, Scene } from "phaser"
import RPCWzStorage from "~/wzStorage/RPCWzStorge"

enum BackGroundType {
	NORMAL = 0,
	HTILED = 1,
	VTILED = 2,
	TILED = 3, // 全摄像机
	HMOVEA = 4, // x 轴 滑动
	VMOVEA = 5,
	HMOVEB = 6,
	VMOVEB = 7,
}

/**
 * 背景层
 * 1. 主动渲染相关的素材
 * 2. 拥有定时器
 * 
 */
class Background
{
	scene: Scene
	url: string 
	backgroup = []

	// 窗口大小
	view_w
	view_h
	offset_w
	offset_h

	layer: Phaser.GameObjects.Layer

	constructor(scene: Scene, url) {
		this.scene = scene
		this.url = url
		const {width, height} = scene.scale
		this.view_w = width
		this.view_h = height
		this.offset_w, this.offset_h = this.view_w / 2, this.view_h /2
		this.layer = this.scene.add.layer()
	}

	preload() {
		this.scene.load.json("mapconfig", this.url)
	}

	create() {
		const mapconfig = this.scene.cache.json.get("mapconfig")
		if (!mapconfig) {
			console.warn("bacdgroup create fail, mapconfig no found")
			return
		}

		for (let i in mapconfig.back._keys) {
			const key = mapconfig.back._keys[i]
			const node = mapconfig.back[key]
			console.log("load node: ", node)
			// FIXME 有点需要加载动画
			RPCWzStorage.getInstance().getWzCanvasNode(`Map/Back/${node.bS}.img/back/${node.no}`, (wznode, img) =>{
				console.log("back node: ", node, wznode)
				let scrollX = 0
				let scrollY = 0
				
				scrollX = - node.rx / 100
				scrollY = - node.ry / 100
				var vspeed = 0
				var hspeed = 0
				var sprite = null;
				switch(node.type) {
					case BackGroundType.NORMAL:
						// console.log("TODO: normal background")
						img
						.setScale(2)
						.setOrigin(0, 0)
						.setFlipX(node.f == 1)
						.setX(node.x - wznode.data.origin.X)
						.setY(node.y - wznode.data.origin.Y + this.offset_h)
						.setScrollFactor(scrollX, scrollY)
						sprite = img
						this.layer.add(img)
						break

					case BackGroundType.VMOVEB:
						vspeed = node.ry
					case BackGroundType.HMOVEB:
						hspeed = node.rx
					case BackGroundType.TILED:
						// 满屏铺贴 
						sprite = 
							this.scene.add.tileSprite(0, 0, this.view_w, this.view_h, img.texture.key, img.frame.name)
							.setScale(2)
							.setOrigin(0, 0)
							.setFlipX((node.f == 1))
							.setScrollFactor(scrollX, scrollY)
							img.destroy(true)
						this.layer.add(sprite)
						break

					case BackGroundType.HMOVEA:
						vspeed = node.ry
					case BackGroundType.HTILED:
						// 横轴铺贴
						sprite = 
							this.scene.add.tileSprite(0, 0, this.view_w, img.height, img.texture.key, img.frame.name)
							.setScale(2)
							.setOrigin(0, 0.5)
							.setFlipX((node.f == 1))
							.setScrollFactor(0, scrollY)
							.setY(- node.y - wznode.data.origin.Y + this.offset_h)
						this.layer.add(sprite)
						break

					case BackGroundType.VMOVEA:
						hspeed = node.rx
					case BackGroundType.VTILED:
						// 纵轴铺贴
						sprite = 
							this.scene.add.tileSprite(0, 0, img.width, this.view_h, img.texture.key, img.frame.name)
							.setScale(2)
							.setOrigin(0, 0)
							.setScrollFactor(scrollX, 0)
							.setFlipX((node.f == 1))
							.setX(- node.x - wznode.data.origin.X + this.offset_w)
						this.layer.add(sprite)
						break
				}
				if (sprite) {
					sprite
						.setData("vspeed", vspeed)
						.setData("hspeed", hspeed)
					console.log("add background type: ", node.type)
					console.log("add background sprite: ", sprite)
					this.scene.events.addListener("update", () => {
						let hspeed = sprite.getData("hspeed")
						let vspeed = sprite.getData("vspeed")
						if (hspeed != 0) {
							sprite.tilePositionY += Math.floor(hspeed / 64)
						}
						if (vspeed != 0) {
							sprite.tilePositionX += Math.floor(vspeed / 64)
						}
					})
				}
			})
		}
	}

	update(time: number, delta: number): void {
		// this.scene.events.emit("update")
		// this.layer.getAll().forEach((obj, index) => {
		// 	// if obj instanceof 
		// 	// console.log("obj: ", obj)
		// })
		debugger
	}

}


export {Background}