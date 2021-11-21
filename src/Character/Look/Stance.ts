
export enum Id {
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

export default class Stance {

	static by_state(state: number): Id {
		// FIXME 表示动作的状态机
		let index = (state / 2) - 1
		if (index < 0 || index > 10)
			return Id.WALK1

		let array = [
				Id.WALK1,
				Id.STAND1,
				Id.JUMP,
				Id.ALERT,
				Id.PRONE,
				Id.FLY,
				Id.LADDER,
				Id.ROPE,
				Id.DEAD,
				Id.SIT
		]
		return array[index]
	}

	static by_id(id: number): Id {
		// TODO
		if (id <= Id.NONE || id > Id.LENGTH) {
			return Id.NONE
		}
		return id
	}

	static by_string(name: string): Id {
		// TODO
		console.warn("TODO")
		return Id.NONE
	}

	static ib_climbing(value: Id): boolean {
		// TODO
		console.warn("TODO")
		return false
	}

	static baseof(value: Id): Id {
		// TODO
		console.warn("TODO")
		return Id.NONE
	}

}