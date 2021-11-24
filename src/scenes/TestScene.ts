import Phaser from 'phaser'
import { AvatarCanvas } from '~/Avatar/Canvas'

export default class TestScene extends Phaser.Scene
{


    constructor()
    {
        super("step-one")
    }

    preload()
    {
        // 读取 xml 文件
        // 渲染成 image
        // 并打印

        // 获取 body 数据
        // this.load.xml("2001", "assets/00002001.img.xml")
        // this.load.xml("12001", "assets/00012001.img.xml")

        this.load.json('zmap.img', "assets/zmap.img.xml.json")
        this.load.json("00002001.img", "assets/00002001.img.xml.json")
        this.load.json("00012001.img", "assets/00012001.img.xml.json")
    }

    create()
    {
        var wz_node = this.cache.json.get("00002001.img")
        var zmap = this.cache.json.get("zmap.img")
        // console.log(wz_node)
        // console.log(wz_node["walk1"])

        // 通过 json，Phaser 可以比较容易地就做到获取节点数据
        var canvas = new AvatarCanvas()
        canvas.loadz(zmap)
        canvas.loadActions(wz_node)
        console.log(canvas)

    }



}