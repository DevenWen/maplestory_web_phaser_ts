import { WzNode } from "./WzNode"


/**
 * 
 * WzStorage 资源库接口
 * 
 */
export interface IWzStorage {

	/**
	 * getWzNode
	 * 
	 * @param path: WzNode 资源节点路径;
	 * @param cb: 获取节点后的回调;
	 * 
	 */
	getWzNode(path: string, cb: (wznode) => void, is_canvas: true): WzNode | null 
	
	/**
	 * 根据 path，获取 WzStorage 的图片资源
	 * 要求 callback 的时候一定是已经加载完成的图片
	 * 
	 * @param path 
	 * @param cb 
	 */
	getWzCanvasNode(path: string, cb: (wzNode: WzNode, img: Phaser.GameObjects.Image) => void): WzNode | null

	/**
	 * 列举 path 下所有的 Canvas 节点；
	 * 
	 * 特殊情况：
	 * 1. 假如包含 action、frame 字段，表示它引用了其他的 motion 的一个帧。需要自动将引用的节点注入 wzNode 中
	 * 
	 * @param path 
	 * @param cb 
	 */
	listCanvasNode(path: string, cb: (wzNode: WzNode, img: Phaser.GameObjects.Image) => void): void


	/**
	 * 根据路径，讲获取到的 wzNode 数据，转化为一个 MapObject 信息
	 * 1. 静态 MapObject，只有一个图片;
	 * 2. 动态 MapObject，生成 animation 数据，并通过动画帧回调来进行绘制
	 * 
	 * 获取到的 MapObject 需要假如场景才会被可见
	 * 
	 * @param path 
	 * @param cb 
	 */
	getMapObjectNode(path: string, cb: (wzNode, mapobject: MapObject) => void): void
}

