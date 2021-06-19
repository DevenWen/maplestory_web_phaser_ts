import Phaser from 'phaser'
import game from 'main'
import DataLoader from '~/dataload/DataStorage'

export default class StepOneScene extends Phaser.Scene
{

    private dataloader: DataLoader

    constructor()
    {
        super("step-one")
    }

    preload()
    {
        // 读取 xml 文件
        // 渲染成 image
        // 并打印

        // this.textures.addBase64("body", dataUri)

        // var data = new Image()
        // data.src = dataUri
        
        // game.cache.obj.add("first_image", data)
        // this.load.image("first_image", data)
        // this.textures.once('addtexture', function () {

        //     this.add.image(400, 300, 'brain');
    
        // }, this);
    
        // this.textures.addBase64('brain', imageData);
        // this.load.image("penguin", "assets/penguin.png")
        // this.load.xml("2001", "assets/00002001.img.xml")
        // this.load.xml("12001", "assets/00012001.img.xml")
        this.dataloader.getDataNode("Base.wz/zmap.img.xml", () => {})
    }

    create()
    {
        var data = this.cache.xml.get("2001")
        

        // var dataUri = "iVBORw0KGgoAAAANSUhEUgAAAAwAAAARCAYAAADpPU2iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACqSURBVDhPjZJREcQgDEQRh4WzUAu1cBZqAQtYqAUsYCGXDcmRfqSwMzsMZV+atCQWOa9FJROVjxhbdSxqhej+DteDvQblcICXrihwvULQAHtT3wLq81dNsNVtCBrQRmum2d7uPPAKmCEMbdYvp+cPaUhbkfAYnOoZAS78B05/Ex6awc5BWKrj6uQAkL/NQWsF1QWI3iAhhmS16jEAuRBucqYetONlAW9WSj+CuyTqN3dW+QAAAABJRU5ErkJggg=="
        // dataUri = 'data:image/png;base64,' + dataUri
        // this.textures.addBase64('body', dataUri)

        var dataNode = this.getbodyDataNode()
        var bodyNode = dataNode["body"]
        var armNode = dataNode["arm"]
        var headNode = dataNode["head"]
        var arm = this.addImage("arm", armNode)
        var body = this.addImage("body", bodyNode)
        var head = this.addImage("head", headNode)

        this.add.image(300, 300, "head")
        this.add.image(300, 400, "body")
        this.add.image(300, 500, "arm")


        this.add.image(100-16, 100-31, "body").setOrigin(0)
        this.add.image(100-1, 100-29, "arm").setOrigin(0)
        
        // var sprite = new Phaser.GameObjects.Sprite(this, 300, 400, "body")

        // var renderTexture = new Phaser.GameObjects.RenderTexture(this, 0, 0, bodyNode["_image"]["width"], bodyNode["_image"]["height"])

        var group = this.add.group()
        group.create(0, 0, "body")
        group.create(0, 0, "arm")
        // group.create(-23, -64, "head")

        // group.setXY(0, 0)

        // var penguin = this.add.image(0, 0, "penguin")
        // penguin.setDisplayOrigin(0,0)
        // console.log("display OriginX", penguin.displayOriginX)
        // console.log("display OriginY", penguin.displayOriginY)

        // var X = 100
        // var Y = 100
        // var renderTexture = this.add.renderTexture(100, 100, X, Y)
        // renderTexture.draw("body", 50 - 16, 50 + 31) // 为身体绘制在 body navel position
        // renderTexture.draw("arm", 50 + 0, 50 - 29)
        // renderTexture.draw("head", 19, 17)

        // var sprite = this.add.sprite(300, 400, "body")
        // sprite.displayWidth = bodyNode["_image"]["width"]
        // sprite.displayHeight = bodyNode["_image"]["height"]
        // sprite.setData("origin", {"X": bodyNode["origin"]["X"], "Y": bodyNode["origin"]["Y"]})
        

        // console.log(sprite.getData("origin"))

        
     
        // this.testPlayer()
    }

    testAnimation1() {
        var sprite = this.add.sprite(400, 200, "body")
        // var animationConfig = {
        //     key: "player-body",
        //     frames: [
        //         {
        //             key: "body",
        //             fream: 0,
        //             duration: 100
        //         }
        //     ]
        // }
        // var animation = new Phaser.Animations.Animation(game.anims, "anis-unique-key", animationConfig)
        sprite.anims.create({
            key: "player-body",
            frames: [
                {
                    key: "body",
                    frame: 0,
                    duration: 100
                },
                {
                    key: "arm",
                    frame: 1,
                    duration: 100
                }
            ],
            repeat: -1
        })

        // sprite.anims.remove("player-body")  重新渲染 sprite 动画时，使用这个

        sprite.anims.play("player-body")

    }

    addFrame() {

    }

    addImage(key, node)
    {
        var uri = node["_image"]["uri"]
        // var width = node["_image"]["width"]
        // var height = node["_image"]["height"]
        var image = new Image()
        image.src = this.getdataUri(uri)
        this.textures.addImage(key, image)
    }

    getdataUri(base64Str)
    {
        return 'data:image/png;base64,' + base64Str
    }

    getbodyDataNode() {

        return {
            "name": "0",
            "_keys": [
                "body",
                "arm",
                "face",
                "delay"
            ],
            "body": {
                "name": "body",
                "_keys": [
                    "origin",
                    "map",
                    "z",
                    "group"
                ],
                "type": "canvas",
                "_image": {
                    "width": 21,
                    "height": 31,
                    "uri": "iVBORw0KGgoAAAANSUhEUgAAABUAAAAfCAYAAAAIjIbwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAG0SURBVEhLrZQBlYMwDIan5SychVmYhVmYhbOABSxgAQtYwEIv/5+kbViBjru85fGaJR9/05TbBUtpHhKeurxuDqGn+SesxT8yhaxzcVEJaBq/Uxq++NTUPktCkd8SobUvk7ei2wj15z40t+LUIvC/oHBu/Qi4aH8t/9QUSmCrpwCOBn1dgW6B4lQp0OlFt/xTk+I9ldegxyrhDpWtEyzzanVNy43fn0/vJ6ByCeAHUC3KUAMEoHgNtO3brXqD6nZty1zbDCqkUkegwQh+NqEBiG0z5qpwx1HMO2/3nkDz8dHcvgKhhtCpQOEC4Zofj3tRmFVKrKmUhwKobVMKGfcWWBEB9qIC3eunq8INgTvUAVKMdcjly+5pHdpQWAXULTHGYonZmpk5rlCsNdw2T8heoEGNxtmmZ1o7wLWV4pbSrHZ/+y2rFGF0dtR+qBRWFbegOh1Ya7jPKrV5AmAah3ceWG1BUVMtDnJ6XIB68UELeg+sADP0YApie7J5MDiLqCZA4//47/2lG1Xb7ygPSvtWYsgR503U0dq2oCRniMwm51M+bZLsBfl/U+awOodEMw/80W+3X9LnmklILP08AAAAAElFTkSuQmCC"
                },
                "origin": {
                    "name": "origin",
                    "type": "vector",
                    "X": 16,
                    "Y": 31
                },
                "map": {
                    "name": "map",
                    "_keys": [
                        "neck",
                        "navel"
                    ],
                    "neck": {
                        "name": "neck",
                        "type": "vector",
                        "X": -4,
                        "Y": -32
                    },
                    "navel": {
                        "name": "navel",
                        "type": "vector",
                        "X": -8,
                        "Y": -21
                    }
                },
                "z": "body",
                "group": "skin"
            },
            "arm": {
                "name": "arm",
                "_keys": [
                    "origin",
                    "map",
                    "z",
                    "group"
                ],
                "type": "canvas",
                "_image": {
                    "width": 10,
                    "height": 19,
                    "uri": "iVBORw0KGgoAAAANSUhEUgAAAAoAAAATCAYAAACp65zuAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACzSURBVDhPjZFREcQgDETRchZqoRaqpRbOAhawgIVawAIW9naBTDmmB5eZ/SFvlk3iWqFpXkgBiOcaRr6AHP+CCRJOfu3KIkjXaw1XUHn9awo3UK7zrISUU7Cn67aAy1CE47FyJST4x1D2iBz2Br6B8O2KrGw5daqO41C1MUoDDZe6cxVpakpfS91O2eCSy1o6FfAcwLDxkV/pO8ncNNhwpbtpYr6nU3bAUYAnyMoavVo59wEcUTERvEYP3QAAAABJRU5ErkJggg=="
                },
                "origin": {
                    "name": "origin",
                    "type": "vector",
                    "X": 5,
                    "Y": 9
                },
                "map": {
                    "name": "map",
                    "_keys": [
                        "navel",
                        "hand"
                    ],
                    "navel": {
                        "name": "navel",
                        "type": "vector",
                        "X": -13,
                        "Y": -1
                    },
                    "hand": {
                        "name": "hand",
                        "type": "vector",
                        "X": -1,
                        "Y": 5
                    }
                },
                "z": "arm",
                "group": "skin"
            },
            "head": {
                "name": "head",
                "_keys": [
                    "origin",
                    "map",
                    "z",
                    "group"
                ],
                "type": "canvas",
                "_image": {
                    "width": 39,
                    "height": 35,
                    "uri": "iVBORw0KGgoAAAANSUhEUgAAACcAAAAjCAYAAAAXMhMjAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJtSURBVFhHzZeBdaswDEUzS1foCl2hK3SFrNAVskJWyAqswApZwdUTkiwbAQacnPqceyDG6F2MTf+/HGxpB29pFpjSc53nKAxeEnRvbUKGimXBNN4ZrYWiPVoQ7igkNhDBHpJ8M1WNicKbyLOYhtshwVhICUN3MD5MLg2/uwRjIRAFHcVm71/KyeyN7bMXS4Eo4Awm1z57sRiIAs5QybUIxmIgCjiM27GNcrEUCANO4GftlFxU/CyFGDbEtCnWBF8vxdSvNIu1yYVFexGvt/S4Ej8bcmHBnizJfad0/1qRC4u9gONyfifROX7XxVehmSkIxhRysuYgd/tYkStuIHwRFl0IQz9/HvyD1VT3az+L0XqjWduWG2ggT7UeCQsQNGRJptqB4YPaWLpOcs/8SmeCvBn4yMUgJshaSHc6cl8dhADq43GfAo3H70LQgT/2ep/0cba9ibEQbJADCJZQE6NzWS8GxqGPPg0aPgf16ah1fL1K0H7kp/GCFAIpnhEJ9MXQr1IYtykmaI0sMtWAQy2HgXyONcEFnCDgYArVooBfqci3SgG/7nRiZEOwy0yOFjqf800QhBSKqaCslRq3djaZ3U85Tk5nTV0gh5YH4aI+WVRUbrajv+ZFmIUHclimUYqh2UU791MPTCiikmxB5X0Nfgvx/8p4kB6PEzyU/w1YTJeNLAt8jGXdsU3QOshVzMR0DV+nrBvt0Cy1KKYtDtlNtB6zlIDWJOVbDmDq4CVkfL1e3WtE7SniXHMB2PK1pIoHMsDNlJPqIqaNC4bhhrumQu5jrDVQ7FVtkpR/TucZcUi/jnW8rUXhNZ3a5fIHrxekrAidqe8AAAAASUVORK5CYII="
                },
                "origin": {
                    "name": "origin",
                    "type": "vector",
                    "X": 19,
                    "Y": 17
                },
                "map": {
                    "name": "map",
                    "_keys": [
                        "neck",
                        "earOverHead",
                        "earBelowHead",
                        "brow"
                    ],
                    "neck": {
                        "name": "neck",
                        "type": "vector",
                        "X": 0,
                        "Y": 15
                    },
                    "earOverHead": {
                        "name": "earOverHead",
                        "type": "vector",
                        "X": 15,
                        "Y": 10
                    },
                    "earBelowHead": {
                        "name": "earBelowHead",
                        "type": "vector",
                        "X": -17,
                        "Y": 9
                    },
                    "brow": {
                        "name": "brow",
                        "type": "vector",
                        "X": -4,
                        "Y": -5
                    }
                },
                "z": "head",
                "group": "skin"
            },
            "face": 1,
            "delay": 500
        }

    }

    getheadDataNode() {

    }

}