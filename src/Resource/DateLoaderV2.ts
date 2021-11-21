import axios from "axios";
import { Data } from "phaser";
import {getElementFromJSON, reparseTreeAsNodes, getItemDataLocation, Node} from '../dataload/dataloader'

export default class DataLoader 
{
	// 单例模式
	private static instance: DataLoader
	
	url: string = "http://127.0.0.1:8082"
	wz_data_cache: Map<string, Node> = new Map()

	getInstance(): DataLoader
	{
		if (!DataLoader.instance) {
			DataLoader.instance = new DataLoader()
		}
		return DataLoader.instance
	}
	
	getNode(path)
	{
		// path = "xxxx.img"
		if (path in this.wz_data_cache) {
			this.wz_data_cache[path]
		} else {
			// 并发控制，使用回调的方式进行编程？需要进一步思考

		}

	}
} 