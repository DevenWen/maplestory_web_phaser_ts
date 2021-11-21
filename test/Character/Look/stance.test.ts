import { describe } from "mocha";
import { expect } from "chai";
import Stance from "../../../src/Character/Look/Stance"
import { Id } from "../../../src/Character/Look/Stance"

describe("Stance test", () => {
	it('by_state', () => {
		expect(Stance.by_state(0)).equal(Id.WALK1)
	})

	it('by_id', () => {
		expect(Stance.by_id(0)).equal(Id.NONE)
		expect(Stance.by_id(1)).equal(Id.ALERT)
	})
})