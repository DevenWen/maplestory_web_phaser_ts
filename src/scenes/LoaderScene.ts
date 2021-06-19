import Phaser from 'phaser'
import game from '~/main'
import DataLoader from '~/dataload/DataStorage'

export default class LoaderScene extends Phaser.Scene
{

    private dataloader!: DataLoader

    constructor()
    {
        super("step-one")
    }

    preload()
    {
        this.dataloader = new DataLoader(game, this.textures)
        this.dataloader.getDataNode("Base.wz/zmap.img", (obj) => {
            if (obj === null) {
                console.warn("Object not found")
                return
            }
        })
    }

    create()
    {

        // var item = 2000;
        // this.dataloader.getItemDataNode(2000, null, function(obj){
        //     console.log(`get item data node from 2000: `, obj)
        // })

        // this.dataloader.getItemDataNode(2000, null, function(obj){
        //     console.log(`get item data node from 2000: `, obj)
        // })

        var scene = this
        this.dataloader.getDataNode('UI.wz/StatusBar.img/null', function(obj) {
            console.log(`get UI.wz/StatusBar.img/null`, obj)
            let node = obj['base']['backgrnd']
            let sprite = scene.dataloader.getOrCreateSprite(node)
            console.log(`get wz sprite from dataloader`, sprite)
            if (sprite != null) {
                scene.add.sprite(100, 100, sprite.textures_key)
            }
            
        })
        
    }

}