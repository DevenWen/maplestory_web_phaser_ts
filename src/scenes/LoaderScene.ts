import Phaser from 'phaser'
import game from '~/main'
import DataLoader from '~/dataload/DataStorage'
import Player from '~/object/Player'
import {UOL, resolveUOL} from '~/dataload/dataloader'

export default class LoaderScene extends Phaser.Scene
{

    private dataloader!: DataLoader
    private player!: Player

    constructor()
    {
        super("dataloader")
    }

    preload()
    {
        this.dataloader = new DataLoader(game)
        this.dataloader.getDataNode("Base.wz/zmap.img", (obj) => {
            if (obj === null) {
                console.warn("Object not found")
                return
            }
        })
    }

    create()
    {

        this.player = new Player(this, 100, 100)

        // this.textures.on('addtexture', (key, texture) => {
            // 向 player 注册这个资源，然后再通过 update 方法绘制。妙！
            // this.player.confirm_image()
        // })
        // 获取 zmap 节点
        // TODO 如何可以改变这种调用方式，我们需要顺序调用，或者预先完成加载
        this.dataloader.getDataNode('Character.wz/00002000.img/null', (node) => {
            this.loadNode("00002000", node)
        })

        this.dataloader.getDataNode('Character.wz/00012000.img/null', (node) => {
            this.loadNode("00012000", node)
        })

        // arm


        // heard
        
    }

    loadNode(id, node) {
        console.log("get ", id, node)
        debugger
        node.forEach((stance, stanceName) => {
            if (stanceName == 'info' || stanceName == 'front') return
            stance.forEach((frame, frameName) => {
                frame.forEach((part, partName) => {
                    if (part["path"]) {
                        part = resolveUOL(part)
                    }
                    if (!part["_image"]) return // 非图片，暂时忽略
                    this.player.add_image(id, stanceName, frameName, partName, part)
                    this.textures.addBase64(`${id}-${stanceName}-${frameName}-${partName}`, 'data:image/png;base64,' + part._image.uri)
                })
            })
        })
    }

    

    update(ts: number) {
        this.player.update(ts)
    }
}