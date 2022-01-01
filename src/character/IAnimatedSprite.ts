import { IAnimation } from "~/animation/IAnimation";
import { IAnimationData } from "~/animation/IAnimationData";
import { IAnimationFrame } from "~/animation/IAnimationFrame";
import { IAnimationPlayConfig } from "./IAnimationPlayerConfig";


export interface IAnimatedSprite
{
		currentAnimation: IAnimation;
    currentFrame: IAnimationFrame;

    animData: IAnimationData;

    hasStarted: boolean;
    forward: boolean;
    inReverse: boolean;

    play (): this;

		changeAnimaiton (key: string, config: IAnimationPlayConfig): void
}