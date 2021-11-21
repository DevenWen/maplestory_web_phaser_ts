import { describe } from "mocha";
import { expect } from "chai";
import { Stance, StanceId } from "../../src/Character/Look/Stance"

describe("Stance test", () => {
	it('by_state', () => {
		expect(Stance.by_state(0)).equal(StanceId.WALK1)
	})

	it('by_id', () => {
		expect(Stance.by_id(0)).equal(StanceId.NONE)
		expect(Stance.by_id(1)).equal(StanceId.ALERT)
	})
})