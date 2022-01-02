import { CreateAnimData } from "~/animation/CreateAnimData";
import { AnimatedSprite } from "~/character/AnimatedSprite";
import { PlayerCharater } from "~/character/PlayerCharater";
import { IComponent } from "./ComponentService";
import { Animation } from "~/animation/Animation";
import { IAnimation } from "~/animation/IAnimation";
import game from '~/main'


export class AnimationComponent implements IComponent
{
    // private sprite!: PlayerCharater
    private actionSprite!: AnimatedSprite
    private faceSprite!: AnimatedSprite

    init(sprite: PlayerCharater)
    {
        // this.sprite = sprite
        // 初始化动画数据
        // 设置动画回调 （修改数据参数）
        // 包括脸部
        const bodyAnimation = game.cache.obj.get('bodyAnimation')
        const faceAnimation = game.cache.obj.get('faceAnimation')

        this.actionSprite = new AnimatedSprite(bodyAnimation, (frame) => {
            // 注意一些引用的写法
            if (!frame.config) {
                return
            }
            if (frame.config.action) {
                // 应用了其他动作
                sprite.motion = frame.config.action
                sprite.motionIndex = frame.config.frame
            } else {
                sprite.motion = frame.key
                sprite.motionIndex = frame.frame
            }
            sprite.updateAnimation()
        })
        this.faceSprite = new AnimatedSprite(faceAnimation, (frame) => {
            sprite.faceAction = frame.key
            sprite.faceIndex = frame.frame
            sprite.updateAnimation()
        })

        sprite.bodyAnima = this.actionSprite
        sprite.faceAnima = this.faceSprite
        sprite.do_animation('stand1', {repeat: -1, yoyo: true})
    }

    update(t: number, ts: number)
    {
        this.actionSprite.update(t, ts)
        this.faceSprite.update(t, ts)
    }

}