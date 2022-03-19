import { Mob } from '~/mob/Mob'
import { CharacterPart, Player } from '~/player/Player'
import { PlayerSkill } from '~/player/PlayerSkill'
import MapleScene from './MapleScene'

export default class TestMobScene extends MapleScene 
{

    constructor()
    {
        super("000010000", "Map/Map/Map0/000010000.img")
    }

    preload()
    {
        super.preload()

        // 加载怪物
        this.loadMobJson("0100100")
            .loadMobJson("0100101")
            .loadMobJson("0100120")
            .loadSkillJson(200)
        
        // this.textures.once(Phaser.Textures.Events.ADD, (key: string) => {
        //     if (key.startsWith("textureKey_grassySoil.img")) {
        //         console.log("load Map/Tile: ", key)
        //         this.add.tileSprite(0, 0, 100, 100, key)
        //     }

        // })
    }

    create()
    {
        super.create()

        // 构建一个人物
        this.player = new Player(this)
            .putOn(CharacterPart.Hair, 30000)
            .putOn(CharacterPart.Cap, 1000000)
            .putOn(CharacterPart.Shoes, 1070003)
            .putOn(CharacterPart.Coat, 1040000)
            .putOn(CharacterPart.Pants, 1060000)
            .putOn(CharacterPart.Weapon, 1302000)
            .play("stand1").facePlay("default")
            .skillPlay({key: "skill_2001002_0_effect", repeat: -1})

        // 定义一个 PlayerSkill 的 animation
        // var playerSkill = new PlayerSkill(this.add.sprite(300, 300, ""))
        // playerSkill.playEffect({key: "skill_2001002_0_effect", repeat: -1})
        // playerSkill.play({
        //     key: "skill_2001005_effect",
        //     repeat: -1
        // })

        // 设计一个物理的平台
        this.matter.world.setBounds();
        var platforms = this.matter.add.image(400, 600, 'platform', "platform", {isStatic: true, restitution: 0.8})
        platforms.setScale(2, 0.5);
        platforms.setFriction(0);
        this.matter.add.mouseSpring({ length: 1, stiffness: 0.6 });

        // 点击鼠标，随机生成1个 怪物
        this.input.on("pointerup",function (pointer) {
            let r = Math.random()
            if (r < 0.3)
                this.mobs.push(new Mob(this, "0100100.img", Math.random()*400, 100).play("stand"))
            else if (r < 0.6)
                this.mobs.push(new Mob(this, "0100101.img", Math.random()*400, 100).play("move"))
            else 
                this.mobs.push(new Mob(this, "0100120.img", Math.random()*400, 100).play("move"))
        }, this)

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    }

    update(time: number, delta: number): void {
        super.update(time, delta)

        let sprite = this.player
        let cursors = this.cursors
        if (cursors.left.isDown)
        {
            sprite.physicalBody.setVelocityX(-5);
            sprite.setFlipX(false)
        }
        if (cursors.right.isDown)
        {
            sprite.physicalBody.setVelocityX(5)
            sprite.setFlipX(true)
        }
        if (cursors.up.isDown)
        {
            sprite.physicalBody.setVelocityY(-5)
        }
    }

}