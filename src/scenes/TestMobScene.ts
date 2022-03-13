import Phaser, { Game } from 'phaser'
import { IAnimation } from '~/animation/IAnimation'
import { PlayerCharater } from '~/character/PlayerCharater'
import { AnimationComponent } from '~/components/AnimationComponent'
import ComponentService from '~/components/ComponentService'
import { DataLoader } from '~/dataload/DataStorage'
import { loadMobAnimation, Mob } from '~/mob/Mob'
import { loadBodyAnimation, loadFaceAnimation, Player } from '~/player/Player'

export default class TestMobScene extends Phaser.Scene
{

    sprite?: Mob
    cursors?
    player?: Player

    constructor()
    {
        super("step-one")
    }

    preload()
    {

        this.load.setBaseURL('http://localhost/assert/wz')
        this.load.image("platform", "platform.png")
        this.load.image("mock", "mock.jpg")
        this.load.json("zmap", "zmap.img.xml.json")
        this.load.json('Character/00002000.img', "Character/00002000.img.xml.json")
        this.load.json('Character/Face/00020000.img', 'Character/Face/00020000.img.xml.json')
        this.load.json("Mob/0100100.img", "Mob/0100100.img.xml.json")

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create()
    {
        loadMobAnimation("Mob/0100100.img", this)
        loadBodyAnimation("Character/00002000.img", this)
        loadFaceAnimation("Character/Face/00020000.img", this)
        this.sprite = new Mob(this, "0100100.img", 100, 400)
        this.sprite.play("move")

        this.player = new Player(this)
        this.player.play("walk1").facePlay("default")

        // 设计一个物理的平台
        this.matter.world.setBounds();
        var platforms = this.matter.add.image(400, 600, 'platform', "platform", {isStatic: true, restitution: 0.8})
        platforms.setScale(2, 0.5);
        platforms.setFriction(0);
        this.matter.add.mouseSpring({ length: 1, stiffness: 0.6 });
    }

    update(time: number, delta: number): void {
        this.sprite.update()
        this.player.update()
        let sprite = this.player
        let cursors = this.cursors
        if (cursors.left.isDown)
        {
            sprite.physicalBody.setVelocityX(-1);
            sprite.setFlipX(false)
            // sprite.play("move")
            sprite.anims.setCurrentFrame(sprite.anims.currentFrame)
        }
        else if (cursors.right.isDown)
        {
            // sprite.matter_body.setVelocityX(1);
            sprite.physicalBody.setVelocityX(1)
            sprite.setFlipX(true)
            // sprite.play("move")
            sprite.anims.setCurrentFrame(sprite.anims.currentFrame)
        }
        else
        {
            sprite.physicalBody.setVelocityX(0);
            // sprite.play("stand1")
        }
    }

}