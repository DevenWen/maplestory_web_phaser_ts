
/**
 * 
 * WzStorage 资源库接口
 * 
 */
export interface IWzStorage {


	/**
	 * getWzNode
	 * 
	 * path: WzNode 资源节点路径;
	 * callback: 获取节点后的回调;
	 * 
	 */
	getWzNode(path :string, cb: (wznode) => void): void 
	


}

