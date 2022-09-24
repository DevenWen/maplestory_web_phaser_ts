import { expect } from 'chai';
import { describe } from "mocha";
import xml_json from "./00002000.img.xml.json"
import xml_json2 from "./00012000.img.xml.json"
import {WzNode, createWzNode, createRootWzNode} from "../../src/wzStorage/WzNode"
import { Queue } from 'queue-typescript';


describe('WzNode', () => {

	it('test WzNode 1', () => {
		var wznode: WzNode = createWzNode(xml_json, null)
		expect(wznode.find("").name).to.equal("00002000.img")
		expect(wznode.find("").getPath()).to.equal("/00002000.img")
		expect(wznode.find("/").name).to.equal("00002000.img")
		expect(wznode.find("/").getPath()).to.equal("/00002000.img")
		expect(wznode.find("/alert").name).to.equal("alert")
		expect(wznode.find("/alert").getPath()).to.equal("/00002000.img/alert")
		expect(wznode.find("/alert/0").name).to.equal("0")
		expect(wznode.find("/alert/0").getPath()).to.equal("/00002000.img/alert/0")

		// uol
		expect(wznode.find("/heal/0/body").getPath()).to.equal("/00002000.img/alert/1/body")
		expect(wznode.find("/heal/0/lHand").getPath()).to.equal("/00002000.img/alert/1/lHand")
	});

	it('test WzNode, callback', () => {
		var wznode: WzNode = createWzNode(xml_json, null)
		expect(wznode.find("/heal/0/lHand", (data) => {
			expect(data["name"]).to.equal("lHand")
		}))
	});

	it('test WzNode merge', () => {
		var wznode: WzNode = createWzNode(xml_json, null)
		var wznode2: WzNode = createWzNode(xml_json2, null)
		var path = "Character/00002000.img"
		var path2 = "Character/00012000.img"
		var root = createRootWzNode(null)
		root.merge(new Queue<string>(...path.split("/")), wznode)
		root.merge(new Queue<string>(...path2.split("/")), wznode2)

		root.find("Character/00002000.img/heal/0/lHand", (data, node) => {
			expect(data["name"]).to.equal("lHand")
			expect(node.getPath()).to.equal("/Character/00002000.img/alert/1/lHand")
		})
		root.find("Character/00012000.img/front/head", (data, node) => {
			expect(data["name"]).to.equal("head")
			expect(node.getPath()).to.equal("/Character/00012000.img/front/head")
		})
		root.find("/Character/00012000.img/front/head", (data, node) => {
			expect(data["name"]).to.equal("head")
			expect(node.getPath()).to.equal("/Character/00012000.img/front/head")
		})
	})

	// it('test WzNode, rpc init Node', () => {
	// 	// 测试 rpc 的方式去初始化 WzNode
	// 	var scene = new Scene("test scene")
	// 	scene.load.setBaseURL('http://localhost/assert/wz/')
	// 	var wznode: WzNode = createWzNode({}, null, scene)
	// 	wznode.find("Character/00002000.img/heal/0/lHand", (data) => {
	// 		console.debug("ok", data)
	// 	})
	// })

});