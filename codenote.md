## TODO list

- [ ] 理解素材的拼接算法

## 2021-12-4
周末起来，进行了眼睛和头发的渲染，整体来说还算顺利。但是整个拼接逻辑依然没有很清楚。主要是直接采用了[这个仓库的算法](https://github.com/Elem8100/MapleStory-GM-Client/blob/ab96724341093b620b6c803cc1437c32d4441f59/Src/MapleCharacter.pas#L1352)。

<div align="center">
	<img src="./doc/img/eye_and_hair.jpg" alt="Editor" width="500">
</div>

## 2021-12-2
阅读了一下 Phaser3 的 [Example](https://phaser.io/examples/v3)，联想了一下关于 Mapestory 的资源，顾有以下笔记

### Scene
1. Scene 模块中，里面设计了一个 UI Scene 的设计。这个 UI Scene 可以用于注册和相应 Game Scene 的事件，例如获得经验，扣血等。
2. Scene 的生命周期，假如我将 MapleStory 的 Map 定义一个 Scene，那么 Scene 的生命周期应该可以被 create、change、**destroy**，Game 是可以[动态加载](https://phaser.io/examples/v3/view/scenes/add-scene-after-gam) scene 的。
3. 所以我们需要可以做到，根据一个 sceneId 构建一个 Scene 对象，初始化的时候，可以加在并渲染一个地图。这是一个封装的工作。

### GameObject
1. Blitter 设计是用于加快渲染速度的，加入担心渲染速度会产生性能问题，可以考虑使用这组件；
2. Container 

## 2021-11-28

利用周末开始研究了一下素材拼接的代码。

1. 每个部位都有自己的公式，取决于 wz_node 的数据，两份代码的实现，暂时都是硬编码这些公式。
2. 目前使用刷新 Sprite 的方法比粗暴，后面有需要得优化一下。初步的方案是，通过动画生成器，创建角色所有的动画素材，而不是不断地生成 Sprite。因为加载所有的资源后，所有的动作也可以被生成了。这样的坏处是：每更改一件装备，都需要等待所有动作被重新生成，带来的体感会非常差。
3. 基本上重写了 DataLoader 部分，目前来看，使用应该容易了
4. zmap 看起来是渲染层次的代码，但可以通过按一定的顺序渲染部位
5. 虽然自己调试好了部分位置，但和朋友给的算法并不一致，（但和网上有其他代码是一致的），需要清楚为什么出现不一致。
6. Phaser Container 作为容器渲染角色，需要进一步阅读这部分的文档。
7. 截图是周末的工作结果，暂时粘贴了三个位置【body、arm、head】

<div align="center">
	<img src="./doc/img/初始化角色.jpg" alt="Editor" width="500">
</div>

## 2021-11-24

今天得到一个 B 站复刻冒险岛的同学帮助，得到了素材拼接算法的代码，[CharacterLoader.cs](./CharacterLoader.cs) 和 [CreatPlayer.cs](./CreatPlayer.cs)。后面会花时间阅读清楚整个绘制过程。然后写一下 wiki 。


## 2021-11-23

今晚继续调研了一下关于冒险岛角色绘制的问题。从 B 站找到了一个非常惊艳的 [demo](https://www.bilibili.com/video/BV1Nf4y1M7F6?spm_id_from=333.999.0.0)。然后稍微深入了解了一下游戏动画的制作，大概可以分为：[帧动画和骨骼动画](https://www.zhihu.com/question/50976782)。

冒险岛属于通过一定的公示，将素材拼接成每一帧，然后再进行自由的动画组合。属于帧动画，但也具备了部分骨骼动画的好处，可以非常容易地扩展角色的外貌。cool!

同时从这个 [github 的仓库中找到了冒险岛骨骼动画的代码](https://github.com/Kagamia/WzComparerR2)，暂时没深入阅读。暂时决定还是先深入了解清楚整个骨骼动画的原理再考虑深入写代码。



## 2021-11-22

今晚在尝试重写资源加载部分。这是前置于游戏资源逻辑的工作。遇到以下问题，及思考。

我参照 HeavenClient 的客户端代码，发现它的代码大多数基于文件加载的同步方式进行的。这是因为它的资源都在本地。如果要将资源运行在 web 上，则需要考虑加载问题。

1. 在 TS + Web 中，异步和同步应该如何抉择？
2. HeavenClient 使用的数据大量都是同步获得的，所以进行比较简单。
3. 同步获得的过程是不是应该在游戏运行前的资源加载部分先完成？需要思考一下。

* 比较大的问题，对于资源的使用，在 web 上一定要通过回调的方式进行使用么？这里会有一个回调地狱的陷阱。 HeavenClient 主要都是通过同步的方式进行的。
* 这里也可以考虑到一个问题：大部分的游戏都是先加载好资源，然后再运行的，这样有利于代码的简单。（同步代码总是比异步代码简单）
* 假如决定使用异步方式使用资源，应该如何写呢？异步方式可能也很优雅？
* 有没有可能使用同步的方式去使用这些资源？


## 2021-11-21 
* 阅读 HeavenClient 关于 Character 的逻辑
* 阅读了部分代码，发现其需要先实现 BodyDrawInfo ，再用于计算其他素材的。
* 实现 BodyDrawInfo 前，需要先实现 Stance 枚举及其接口
* 由于不熟悉 TS 的语法，所以代码需要 Unit Test 进行编写。
* 在编写 Unit test 发现了如下错误
```
SyntaxError: Cannot use import statement outside a module
```
最后在 github 上的这个 issue 上找到解决方法。https://github.com/TypeStrong/ts-node/issues/922#issuecomment-667076602

## 2021-11-21 重启此项目
