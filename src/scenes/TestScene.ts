import Phaser, { Game } from 'phaser'
import { IAnimation } from '~/animation/IAnimation'
import { PlayerCharater } from '~/character/PlayerCharater'
import { AnimationComponent } from '~/components/AnimationComponent'
import ComponentService from '~/components/ComponentService'
import { DataLoader } from '~/dataload/DataStorage'

export default class TestScene extends Phaser.Scene
{

    player?: PlayerCharater
    
    updated: boolean = false

    sprite?: Phaser.GameObjects.Sprite

    private components!: ComponentService


    constructor()
    {
        super("step-one")
        
    }

    preload()
    {

        this.components = new ComponentService()
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.components.destroy()
        })

        this.load.setBaseURL('http://localhost/assert/wz')
        this.load.image("platform", "platform.png")
        this.load.json("zmap", "zmap.img.xml.json")
        this.load.json('body', "Character/00002000.img.xml.json")
        this.load.json('face', 'Character/Face/00020000.img.xml.json')
    }

    create()
    {
        DataLoader.loadBodyAnimation()
        DataLoader.loadFaceAnimation()
        this.player = new PlayerCharater(this)
        this.player.setPosition(100, 100)
        this.components.addComponent(this.player, new AnimationComponent())

        var player = this.player

        // 设计一个物理的平台
        var platforms = this.matter.add.image(400, 400, 'platform', "platform", {isStatic: true})
        platforms.setScale(2, 0.5);
        platforms.setFriction(0);

        var initaction = "airstrike"

        var debugText = this.add.text(0, 0, `action: ${initaction}`, {fontFamily: 'Arial', fontSize: 64, color: '#00ff00' })
        var debug = this.add.graphics()
        var scene = this
        var animation = scene.game.cache.obj.get('bodyAnimation') as Map<String, IAnimation>
        var actionKeys = []
        animation.forEach((value, key) => {
            actionKeys.push(key)
        })

        player.do_animation(initaction, {repeat: -1, yoyo: false})

        // 位置指针
        this.input.on("pointerup",function (pointer) {
            // 随机获得一个 animation 的动作
            let size = actionKeys.length
            let index = Math.floor(Math.random() * size)
            let action = actionKeys[index]
            player.do_animation(action, {repeat: -1, yoyo: false})
            debugText.text = `action: ${action}`
        }, this)
    }

    getRandomInt(max): number
    {
        return Math.floor(Math.random() * max)
    }

    update(ts: number, delta: number)
    {
        this.components.update(ts, delta)
    }

}