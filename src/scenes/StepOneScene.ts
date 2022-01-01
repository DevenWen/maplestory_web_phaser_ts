import Phaser from 'phaser'
export default class StepOneScene extends Phaser.Scene
{

    // private dataloader: DataLoader

    constructor()
    {
        super("step-one")
    }

    preload()
    {
        this.load.image("platform", "assets/platform.png")
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
    }
    

    create()
    {

        // var s1 = this.add.sprite(0, 0, "platform")
        // var s2 = this.add.sprite(50, 50, "penguin")
        // var s1 = new Phaser.GameObjects.Sprite(this, 0, 0, "platform")
        // var s2 = new Phaser.GameObjects.Sprite(this, 50, 50, "penguin")
        var s1 = this.add.text(100, 100, "Hello")
        var s2 = this.add.text(100, 150, "Word")
        // var c1 = this.add.container(0, 0).setVisible(false).add(s1).add(s2)
        var c1 = new Phaser.GameObjects.Container(this)
        c1.add(s1).add(s2)

        this.add.sprite(1, 1, 'platform')

        var demo = this.add.sprite(400, 300, 's')
        demo.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: demo.anims.generateFrameNames('penguin', {
                start: 1,
                end: 4,
                prefix: 'penguin_walk0',
                suffix: '.png'
            }),
            repeat: -1
        })
        demo.play("player-walk")
        c1.add(demo)

        // this.add.existing(c1)

        // var rt = this.add.renderTexture(300, 100, 100, 100)
        // var rt = this.make.renderTexture({width: 800, height: 600}, false)
        var rt = new Phaser.GameObjects.RenderTexture(this)
        rt.draw(c1)
        rt.saveTexture('rt_platform')

        var body = this.add.sprite(100, 200, "body")
        body.anims.create({
            key: 'player-jump',
            frameRate: 20,
            frames: [
                {key: "rt_platform"},
                {key: "platform", duration: 50}
            ],
            repeat: -1
        })
        body.play("player-jump")

    
        // var scene = this
        // // 修改 texture
        // this.input.on('pointerdown', (pointer) => {
        //     c1.add(scene.add.text(100, 160, "!"))
        //     rt.draw(c1)
        // })
        
        // animations 可以通过指引引用 render text
    }

}