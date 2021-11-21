import { describe } from "mocha";
import { expect } from "chai";
import Point from "../../src/Template/Point";

describe("Point test", () => {
	it('new point & shift', () => {
		let p = new Point(10, 10)
		let p2 =  new Point(1,1)
		p.shift(p2)
		expect(p.a).equal(11)
		expect(p.b).equal(11)
	})
})