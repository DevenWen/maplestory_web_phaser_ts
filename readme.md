
我在尝试将 maplestory 的 wz 文件，迁移到 Phaser 框架中，并制作一个冒险岛素材的 Lib。目前的想法如下：

1. 将冒险岛的素材资源，通过一个后端服务开放出来,已经完成。
2. 编写一个 web 版的资源访问器（DataLoader），用于获取后端的资源，并做格式化处理。
3. 根据资源的拼接规则，将资源利用起来；
4. 根据资源的设定，编写资源库；

这个仓库暂时会降低维护的频率，会响应 issue ，现在在尝试将 maplestroy 的客户端解析工作迁移到 godot 上，[链接](https://github.com/DevenWen/maplestory_in_godot)。godot 我调研过后，对其中的 Node 的编程模型非常感兴趣，欢迎大家关注。

## 截图

![image](https://user-images.githubusercontent.com/11524318/174450492-188bd592-f96c-4718-a8a8-7dfe2389c72d.png)


![image](https://user-images.githubusercontent.com/11524318/159130137-c0afdca4-2871-4060-9244-de783b693814.png)


## 进度
1. 暂时没有明确的工作量规划，详细开发过程您可以查看我的工作日志，里面记录了目前的初步成果。

## 工具

冒险岛版本：v079
工具：Harepacker

## 工作日志

我将工作日志记录在[这里](./CHANGELOG.md)

