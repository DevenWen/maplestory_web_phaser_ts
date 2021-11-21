我在尝试将 maplestory 的 wz 文件，迁移到 Phaser 框架中，并制作一个冒险岛素材的 Lib。目前的想法如下：

1. 将冒险岛的素材资源，通过一个后端服务开放出来。[这部分的工作](https://github.com/DevenWen/maplestory_wz_resourse_server)已经完成。
2. 编写一个 web 版的资源访问器（DataLoader），用于获取后端的资源，并做格式化处理。
3. 根据资源的设定，编写资源库

## 工具

冒险岛版本：v180
工具：Harepacker

## 工作日志

我将工作日志记录在[这里](./codenote.md)

