import { describe } from "mocha";
import { expect } from "chai";
import Point from "../src/Template/Point";

describe("Demoe test", () => {
	it('new point', () => {
		let p = new Point(10, 10)
		console.log(p)

		let p2 =  new Point(1,1)
		p.shift(p2)
		console.log(p)
	})
})