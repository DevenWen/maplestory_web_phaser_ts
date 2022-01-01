import { IAnimatedSprite } from "~/character/IAnimatedSprite";

export interface IAnimationOwner
{
	/**
	 * 播放
	 */
	play?: (animationKey: String) => void;

	/**
	 * get set IAnimatedSprite
	 */
	setAnimated?: (animate: IAnimatedSprite) => void
	getAnimated?: () => IAnimatedSprite
}