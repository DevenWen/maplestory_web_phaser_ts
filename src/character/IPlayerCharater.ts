
export interface IPlayerCharater
{

	/**
	 * 执行某个动作
	 * @param action 
	 */
	do_animation(action: String)


	/**
	 * 执行一个面部动作
	 * @param action 
	 */
	do_face_animation(action: String)
}