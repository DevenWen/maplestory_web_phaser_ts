## TODO list

- [ ] 理解素材的拼接算法

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
