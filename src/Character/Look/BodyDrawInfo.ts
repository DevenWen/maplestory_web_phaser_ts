import Point from "~/Template/Point";
import { Stance, StanceId } from "./Stance";

export class BodyAction {

}

export class BodyDrawInfo {

	private body_positions!: Map<integer, Point>
	private arm_positions!: Map<integer, Point>
	private hand_positions!: Map<integer, Point>
	private head_positions!: Map<integer, Point>
	private hair_positions!: Map<integer, Point>
	private face_positions!: Map<integer, Point>

	private stance_delays!: Map<integer, integer>

	private body_actions!: Map<string, Map<integer, BodyAction>>
	private attack_delays!: Map<string, Array<integer>>

	init() {
		// 加载 bodynode, 00002000.img
		// 加载 headnode, 00012000.img

		// 计算 node 数据，并写入 private 数据域中


	}
	
	get_body_position(stance: StanceId, frame: integer): Point {
		console.warn("todo")
		return Point.null()
	}

	get_arm_position(stance: StanceId, frame: integer): Point {
		console.warn("todo")
		return Point.null()	
	}

	get_hand_position(stance: StanceId, frame: integer): Point {
		console.warn("todo")
		return Point.null()	
	}

	get_head_position(stance: StanceId, frame: integer): Point {
		console.warn("todo")
		return Point.null()	
	}

	get_hair_position(stance: StanceId, frame: integer): Point {
		console.warn("todo")
		return Point.null()	
	}

	get_face_position(stance: StanceId, frame: integer): Point {
		console.warn("todo")
		return Point.null()	
	}

	nextframe(stance: StanceId, frame: integer): integer {
		console.warn("todo")
		return -1
	}

	get_delay(stance: StanceId, frame: integer): integer {
		console.warn("todo")
		return -1
	}

	get_attackdelay(action: string, no: integer): integer {
		console.warn("todo")
		return -1
	}

	next_actionframe(action: string, frame: integer): integer {
		console.warn("todo")
		return -1
	}

	get_action(action: string, frame: integer): BodyAction | null {
		console.warn("todo")
		return null
	}


}