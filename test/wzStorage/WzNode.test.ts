import { expect } from 'chai';
import { describe } from "mocha";
import xml_json from "./00002000.img.xml.json"
import {WzNode, createWzNode} from "../../src/wzStorage/WzNode"


describe('WzNode', () => {

	it('test WzNode 1', () => {
		var wznode: WzNode = createWzNode(xml_json, null)
		expect(wznode.find("").name).to.equal("00002000.img")
		expect(wznode.find("").getPath()).to.equal("00002000.img")
		expect(wznode.find("/").name).to.equal("00002000.img")
		expect(wznode.find("/").getPath()).to.equal("00002000.img")
		expect(wznode.find("/alert").name).to.equal("alert")
		expect(wznode.find("/alert").getPath()).to.equal("00002000.img/alert")
		expect(wznode.find("/alert/0").name).to.equal("0")
		expect(wznode.find("/alert/0").getPath()).to.equal("00002000.img/alert/0")

		// uol
		expect(wznode.find("/heal/0/body").getPath()).to.equal("00002000.img/alert/1/body")
		expect(wznode.find("/heal/0/lHand").getPath()).to.equal("00002000.img/alert/1/lHand")
	});



});