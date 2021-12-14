import Phaser, { Game } from 'phaser'
import { Player } from '~/Character/Player'
import { getElementFromJSON, getElementFromJSONAuto, reparseTreeAsNodes, resolveUOL } from '~/dataload/dataloader'
import game from '~/main'

export default class TestScene extends Phaser.Scene
{

    player?: Player
    
    updateOne: boolean = true

    sprite?: Phaser.GameObjects.Sprite

    nextFrame?
    nextFrameIndex = 0


    constructor()
    {
        super("step-one")
        
    }

    preload()
    {
        // 读取 xml 文件
        // 渲染成 image
        // 并打印
        this.load.image("platform", "assets/platform.png")
        this.load.json("00002000.img", "assets/00002000.img.xml.json")
        this.load.json("00012000.img", "assets/00012000.img.xml.json")
        this.load.json("Face/00020000.img", "assets/Face/00020000.img.xml.json")
        this.load.json("Hair/00030000.img", "assets/Hair/00030000.img.xml.json")
        this.load.json("Cap/01002357.img", "assets/Cap/01002357.img.xml.json")
        this.load.json("Shoes/01070003.img", "assets/Shoes/01070003.img.xml.json")
        this.load.json("Longcoat/01050010.img", "assets/Longcoat/01050010.img.xml.json")
        this.load.json("Weapon/01332076.img", "assets/Weapon/01332076.img.xml.json")
        this.load.json("zmap", "assets/zmap.img.xml.json")

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
        this.loadImage("Face/00020000.img")
        this.loadImage("Hair/00030000.img")
        this.loadImage("Cap/01002357.img")
        this.loadImage("Shoes/01070003.img")
        this.loadImage("Longcoat/01050010.img")
        this.loadImage("Weapon/01332076.img")

        this.player = new Player(this)

        // 加入一个物理引擎
        this.player.container.setSize(32, 64)
        var phy = this.matter.add.gameObject(this.player.container)
        var platforms = this.matter.add.image(400, 400, 'platform', "platform", {isStatic: true})
        platforms.setScale(2, 0.5);
        platforms.setFriction(0);

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
       

        if (!this.nextFrame) {
            this.nextFrame = ts + 160
            return
        }
        if (this.nextFrame > ts) {
            return 
        }

        this.nextFrame = ts + 160
        if (this.nextFrameIndex >= 3) {
            this.nextFrameIndex = 0
        } else {
            this.nextFrameIndex ++
        }

        if (this.player) {
            this.player.motionIndex = this.nextFrameIndex
            this.player.update(ts)
        }
    }



}