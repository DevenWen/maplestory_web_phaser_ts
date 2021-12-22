import axios from 'axios'
import Phaser, { Game } from 'phaser'
import { Player } from '~/Character/Player'
import { getElementFromJSON, getElementFromJSONAuto, reparseTreeAsNodes, resolveUOL } from '~/dataload/dataloader'
import game from '~/main'

export default class TestScene extends Phaser.Scene
{

    player?: Player
    
    updated: boolean = false

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
        this.load.setBaseURL('http://localhost:8000/remote')
        this.load.image("platform", "platform.png")
        this.load.json("zmap", "zmap.img.xml.json")

    }

    create()
    {

        this.player = new Player(this)

        // 加入一个物理引擎
        this.player.container.setSize(32, 64)
        var phy = this.matter.add.gameObject(this.player.container)
        var platforms = this.matter.add.image(400, 400, 'platform', "platform", {isStatic: true})
        platforms.setScale(2, 0.5);
        platforms.setFriction(0);

        var debugText = this.add.text(0, 0, 'x: 0, y: 0', {fontFamily: 'Arial', fontSize: 64, color: '#00ff00' })
        var debug = this.add.graphics()

        // 位置指针
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

        this.nextFrame = ts + 180
        if (this.nextFrameIndex >= 3) {
            this.nextFrameIndex = 0
        } else {
            this.nextFrameIndex ++
        }

        if (this.player && !this.updated) {
            this.player.motionIndex = this.nextFrameIndex
            this.player.update(ts)
            // this.updated = true
        }
    }



}