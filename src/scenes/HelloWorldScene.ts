import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene
{

    starGraphics;lineRectangle;

	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        this.load.setBaseURL('http://labs.phaser.io')

        this.load.image('sky', 'assets/skies/space3.png')
        this.load.image('logo', 'assets/sprites/phaser3-logo.png')
        this.load.image('red', 'assets/particles/red.png')
    }

    create() {
        // this.add.image(400, 300, 'sky')

        var graphics = this.add.graphics()
        graphics.lineStyle(5, 0xFF00FF, 1.0);
        graphics.beginPath();
        graphics.moveTo(100, 100);
        graphics.lineTo(200, 200);
        graphics.closePath();
        graphics.strokePath();

        // this.matter.add.gameObject(graphics)
        
        // dl.
        // dl.strokeRect(100, 100, 200, 200)
        // this.matter.add.gameObject(dl)
        // dl.closePath()
    
        // var starGraphics = this.add.graphics({x: 400, y: 300});
        // this.drawStar(starGraphics, 0, 0, 5, 200, 100, 0xFFFF00, 0xFF0000);
        // starGraphics.rotation = Math.random();
        // var lineRectangle = this.add.graphics({x: 400, y: 300});
        // lineRectangle.lineStyle(5, 0x0000FF, 1.0);
        // lineRectangle.fillStyle(0x0000FF, 1.0);
        // lineRectangle.strokeRect(-100, -100, 200, 200);

        // this.starGraphics = starGraphics
        // this.lineRectangle = lineRectangle
        // this.matter.add.gameObject(this.starGraphics)
        // this.matter.add.gameObject(this.lineRectangle)
    }
    
    // function update() {
    //     lineRectangle.rotation += 0.01;
    //     starGraphics.rotation -= 0.01;
    //     starGraphics.scaleX = 0.8 + Math.abs(Math.sin(starGraphics.rotation));
    //     starGraphics.scaleY = 0.8 + Math.abs(Math.sin(starGraphics.rotation));
    // }
    
    drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color, lineColor) {
        var rot = Math.PI / 2 * 3;
        var x = cx;
        var y = cy;
        var step = Math.PI / spikes;
        graphics.lineStyle(5, lineColor, 1.0);
        graphics.fillStyle(color, 1.0);
        graphics.beginPath();
        graphics.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            graphics.lineTo(x, y);
            rot += step;
    
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            graphics.lineTo(x, y);
            rot += step;
        }
        graphics.lineTo(cx, cy - outerRadius);
        graphics.closePath();
        graphics.strokePath();
        graphics.fillPath();
    }
}
