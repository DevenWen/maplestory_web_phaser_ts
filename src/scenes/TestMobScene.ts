import Phaser, { Game } from 'phaser'
import { IAnimation } from '~/animation/IAnimation'
import { PlayerCharater } from '~/character/PlayerCharater'
import { AnimationComponent } from '~/components/AnimationComponent'
import ComponentService from '~/components/ComponentService'
import { DataLoader } from '~/dataload/DataStorage'
import { Mob } from '~/mob/Mob'

export default class TestMobScene extends Phaser.Scene
{

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
        this.load.image("mock", "mock.jpg")
        this.load.json("zmap", "zmap.img.xml.json")
        this.load.json('body', "Character/00002000.img.xml.json")
        this.load.json('face', 'Character/Face/00020000.img.xml.json')
        this.load.json("Mob/0100100.img", "Mob/0100100.img.xml.json")
        
    }

    create()
    {
        const scene = this
        DataLoader.getWzNode("Mob/0100100.img", (node) => {
            console.log(node)
            // 解析动作库
            // 每一个动作有一个 n 个图片(每一个)
            const name = node['name'] // 0100100.img
            var keys = node['_keys']
            for (let index in keys)
            {
                let action_key = keys[index]
                if (action_key == 'info') continue
                let action_node = node[`${action_key}`]

                let action_name = `Mob/${name}/${action_key}`
                var frames: Phaser.Types.Animations.AnimationFrame[] = []
                for (let i in action_node['_keys'])
                {   
                    var frame_index = action_node['_keys'][i]
                    if (frame_index == 'zigzag') continue
                    const frame = action_node[`${frame_index}`]
                    // console.log(frame)
                    let delay = frame['delay']

                    this.textures.addRenderTexture(
                        `Mob/${name}/${action_key}/${frame_index}`,
                        new Phaser.GameObjects.RenderTexture(this) 
                    )
                    frames.push(
                        {
                            key: `Mob/${name}/${action_key}/${frame_index}`,
                            duration: delay
                        }
                    )
                }
                console.log("add action_name", action_name)
                this.anims.create({
                    // FIXME 创建 animation 时，texture 并没加载，useBase64，导致内部的 frame 没准备好
                    // https://blog.ourcade.co/posts/2020/phaser3-load-images-dynamically/
                    key: action_name,
                    frames: frames,
                    repeat: -1
                })
            }
        })

        this.sprite = new Mob(scene, "0100100.img", 100, 400)

        this.sprite.play("move")
        this.sprite.setFlipX(true)

        this.input.on("pointerup", (pointer) => {
            this.sprite.setFlipX(!this.sprite.flipX)
        })
        var debugText = this.add.text(0, 0, 'x: 0, y: 0', {fontFamily: 'Arial', fontSize: 64, color: '#00ff00' })
        var debug = this.add.graphics()
        // 位置指针

        debug.clear().lineStyle(1, 0x00ff00);
        debug.lineBetween(0, 400, 800, 400)
        debug.lineBetween(100, 0, 100, 600)
    }

}