import { IAnimationConfig } from "~/animation/IAnimationConfig";
import { IAnimationData } from "~/animation/IAnimationData";
import { IAnimationPlayConfig } from "./IAnimationPlayerConfig";

export function Play (data: IAnimationData, key: string, config: IAnimationPlayConfig = {}): void
{

	const {
		speed = 24,
		repeat = 0,
		yoyo = false,
		startFrame = 0,
		delay = 0,
		repeatDelay = 0,
		forceRestart = false
	} = config

	if (data.isPlaying)
	{
		if (data.currentAnim !== key)
		{
			// stop
			data.isPlaying = false;
			data.currentAnim = '';

			// 考虑设置回调
		}

		
	}

	




}