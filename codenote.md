## TODO list

- [ ] 理解素材的拼接算法

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