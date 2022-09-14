
/**
 * 
 * 远程 Wz 资源库
 * 1. 封装资源的获取
 * 
 */
class RPCWzStorage implements IWzStorage {
	
	getWzNode(path: string, cb: (wznode: any) => void): void {
		throw new Error("Method not implemented.");
	}


}


export default RPCWzStorage