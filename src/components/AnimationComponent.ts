import { CreateAnimData } from "~/animation/CreateAnimData";
import { AnimatedSprite } from "~/character/AnimatedSprite";
import { PlayerCharater } from "~/character/PlayerCharater";
import { IComponent } from "./ComponentService";
import { Animation } from "~/animation/Animation";
import { IAnimation } from "~/animation/IAnimation";


export class AnimationComponent implements IComponent
{
    // private sprite!: PlayerCharater
    private actionSprite!: AnimatedSprite
    private faceSprite!: AnimatedSprite

    constructor (bodyjson) 
    {
        // 初始化动画
        console.log("construct animation component: ", bodyjson)
    }

    init(sprite: PlayerCharater)
    {
        // this.sprite = sprite
        // 初始化动画数据
        // 设置动画回调 （修改数据参数）
        // 包括脸部
        
        var walk_animation = new Animation(
            {
                key: "walk1",
                repeat: -1,
                frames: [
                    {
                        bodyAction: "walk1",
                        frame: 0,
                        isFirst: true,
                        isLast: false,
                        isKeyFrame: false,
                        duration: 180,
                        nextFrame: null,
                        prevFrame: null,
                        progress: 0,
                        config: {}
                    },
                    {
                        bodyAction: "walk1",
                        frame: 1,
                        isFirst: true,
                        isLast: false,
                        isKeyFrame: false,
                        duration: 180,
                        nextFrame: null,
                        prevFrame: null,
                        progress: 0,
                        config: {}
                    },
                    {
                        bodyAction: "walk1",
                        frame: 2,
                        isFirst: true,
                        isLast: false,
                        isKeyFrame: false,
                        duration: 180,
                        nextFrame: null,
                        prevFrame: null,
                        progress: 0,
                        config: {}
                    },
                    {
                        bodyAction: "walk1",
                        frame: 3,
                        isFirst: true,
                        isLast: false,
                        isKeyFrame: false,
                        duration: 180,
                        nextFrame: null,
                        prevFrame: null,
                        progress: 0,
                        config: {}
                    }
                ]
            }
        )

        let animationMockMap = new Map<String, IAnimation>();
        animationMockMap.set('walk1', walk_animation)

        this.actionSprite = new AnimatedSprite(animationMockMap, (frame) => {
            sprite.motion = frame.bodyAction
            sprite.motionIndex = frame.frame
            sprite.updateAnimation()
        })
        this.faceSprite = new AnimatedSprite(new Map<String, IAnimation>(), (frame) => {
            console.log("set face frame for sprite", frame, sprite)
        })

        sprite.bodyAnima = this.actionSprite
        sprite.faceAnima = this.faceSprite
        sprite.do_animation('walk1', {repeat: -1})
    }

    update(t: number, ts: number)
    {
        this.actionSprite.update(t, ts)
        this.faceSprite.update(t, ts)
    }

}