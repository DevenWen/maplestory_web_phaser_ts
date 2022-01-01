import { CalculateDuration } from "./CalculateDuration";
import { IAnimation } from "./IAnimation";
import { IAnimationConfig } from "./IAnimationConfig";
import { IAnimationFrame } from "./IAnimationFrame";
import { LinkFrames } from "./LinkFrames";

export class Animation implements IAnimation
{
	key: string;
	frames: Set<IAnimationFrame>;
	firstFrame: IAnimationFrame;
	msPerFrame: number;
	frameRate: number;
	duration: number;
	skipMissedFrames: boolean;
	delay: number;
	hold: number;
	repeat: number;
	repeatDelay: number;
	yoyo: boolean;
	showOnStart: boolean;
	hideOnComplete: boolean;
	paused: boolean;

	constructor (config: IAnimationConfig)
	{
		const {
			key,
			frames = [],
			frameRate = null,
			duration = null,
			skipMissedFrames = true,
			delay = 0,
			repeat = 0,
			repeatDelay = 0,
			yoyo = false,
			showOnStart = false,
			hideOnComplete = false,
			paused = false
		} = config;

		this.key = key;
		this.skipMissedFrames = skipMissedFrames;
		this.delay = delay;
		this.repeat = repeat;
		this.repeatDelay = repeatDelay;
		this.yoyo = yoyo;
		this.showOnStart = showOnStart;
		this.hideOnComplete = hideOnComplete;
		this.paused = paused;

		this.frames = new Set(frames);

		CalculateDuration(this, this.frameRate, this.duration)
		LinkFrames(this)
	}

	getTotalFrames(): number {
		return this.frames.size;
	}
	destroy(): void {
		this.frames.clear()
	}
	
}