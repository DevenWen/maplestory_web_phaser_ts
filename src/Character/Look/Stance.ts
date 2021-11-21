import { NONE } from "phaser";

enum Id {
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
		// TODO
		return Id.NONE
	}

	static by_id(id: number): Id {
		// TODO
		if (id <= Id.NONE || id > Id.LENGTH) {
			return Id.NONE
		}
		let keys = Object.keys(Id).filter(x => Id[x] == id);
		return Id.NONE
	}

	static by_string(name: string): Id {
		// TODO
		return Id.NONE
	}

	static ib_climbing(value: Id): boolean {
		// TODO
		return false
	}

	static baseof(value: Id): Id {
		// TODO
		return Id.NONE
	}

}