import Phaser, { Game } from 'phaser'
import { PlayerCharater } from '~/character/PlayerCharater'
import { AnimationComponent } from '~/components/AnimationComponent'
import ComponentService from '~/components/ComponentService'

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
    }

    create()
    {
        this.player = new PlayerCharater(this)
        this.player.setPosition(100, 100)
        this.components.addComponent(this.player, new AnimationComponent(this.cache.json.get('body')))

        var other = new PlayerCharater(this)
        other.setPosition(200, 100)
        this.components.addComponent(other, new AnimationComponent(this.cache.json.get('body')))


        // 设计一个物理的平台
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

    update(ts: number, delta: number)
    {
        this.components.update(ts, delta)
    }

}