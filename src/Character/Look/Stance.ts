
export enum StanceId {
		NONE,
		ALERT,
		DEAD,
		FLY,
		HEAL,
		JUMP,
		LADDER,
		PRONE,
		PRONESTAB,
		ROPE,
		SHOT,
		SHOOT1,
		SHOOT2,
		SHOOTF,
		SIT,
		STABO1,
		STABO2,
		STABOF,
		STABT1,
		STABT2,
		STABTF,
		STAND1,
		STAND2,
		SWINGO1,
		SWINGO2,
		SWINGO3,
		SWINGOF,
		SWINGP1,
		SWINGP2,
		SWINGPF,
		SWINGT1,
		SWINGT2,
		SWINGT3,
		SWINGTF,
		WALK1,
		WALK2,
		LENGTH
}

export class Stance {

	static by_state(state: number): StanceId {
		// FIXME 表示动作的状态机
		let index = (state / 2) - 1
		if (index < 0 || index > 10)
			return StanceId.WALK1

		let array = [
			StanceId.WALK1,
			StanceId.STAND1,
			StanceId.JUMP,
			StanceId.ALERT,
			StanceId.PRONE,
			StanceId.FLY,
			StanceId.LADDER,
			StanceId.ROPE,
			StanceId.DEAD,
			StanceId.SIT
		]
		return array[index]
	}

	static by_id(id: number): StanceId {
		// TODO
		if (id <= StanceId.NONE || id > StanceId.LENGTH) {
			return StanceId.NONE
		}
		return id
	}

	static by_string(name: string): StanceId {
		// TODO
		console.warn("TODO")
		return StanceId.NONE
	}

	static ib_climbing(value: StanceId): boolean {
		// TODO
		console.warn("TODO")
		return false
	}

	static baseof(value: StanceId): StanceId {
		// TODO
		console.warn("TODO")
		return StanceId.NONE
	}

}