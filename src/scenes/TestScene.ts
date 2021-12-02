import Phaser, { Game } from 'phaser'
import { Player } from '~/Character/Player'
import { getElementFromJSON, getElementFromJSONAuto, reparseTreeAsNodes, resolveUOL } from '~/dataload/dataloader'
import game from '~/main'

export default class TestScene extends Phaser.Scene
{

    player?: Player
    
    updateOne: boolean = true

    sprite?: Phaser.GameObjects.Sprite


    constructor()
    {
        super("step-one")
        
    }

    preload()
    {
        // 读取 xml 文件
        // 渲染成 image
        // 并打印
        this.load.image("ground", "assets/platform.png")
        this.load.json("00002000.img", "assets/00002000.img.xml.json")
        this.load.json("00012000.img", "assets/00012000.img.xml.json")

        this.textures.addListener('addtexture', (key) => {
            console.log("loaded texture", key)
        })
    }

    loadImage(img)
    {
        var json = this.cache.json.get(img)
        var db = reparseTreeAsNodes(json)
        game.cache.obj.add(img, db)
        console.log("load success", db)
    }
    

    create()
    {
        this.loadImage("00002000.img")
        this.loadImage("00012000.img")

        this.player = new Player(this)

        // 加入一个物理引擎
        // this.player.container.setSize(32, 32)
        // var phy = this.matter.add.gameObject(this.player.container)
        
        // this.platforms = this.matter.add.image(400, 400, 'platform', "platform", {isStatic: true})
        // this.platforms.setScale(2, 0.5);
        // this.platforms.setFriction(0);

        var debugText = this.add.text(0, 0, 'x: 0, y: 0', {fontFamily: 'Arial', fontSize: 64, color: '#00ff00' })
        var debug = this.add.graphics()
        this.input.on("pointermove",function (pointer) {
            debug.clear().lineStyle(1, 0x00ff00);
            debug.lineBetween(0, pointer.y, 800, pointer.y);
            debug.lineBetween(pointer.x, 0, pointer.x, 600);

            debugText.text = `x: ${pointer.x}, y: ${pointer.y}`
        }, this)
    }

    update(ts: number)
    {
        if (this.updateOne) {
            this.player?.update(ts)
            // this.updateOne = false
        }

        if (this.sprite)
            this.sprite.destroy()

        // this.sprite = this.add.sprite(400, 400, "demo").setOrigin(0)
    }



}