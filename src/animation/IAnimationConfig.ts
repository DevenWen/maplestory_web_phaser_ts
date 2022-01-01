import { IAnimationFrame } from "./IAnimationFrame";

export interface IAnimationConfig
{

	key: string;
	frames?: IAnimationFrame[];
	frameRate?: number;
	duration?: number;
	skipMissedFrames?: boolean;
	delay?: number;
	repeat?: number;
	repeatDelay?: number;
	yoyo?: boolean;
	showOnStart?: boolean;
	hideOnComplete?: boolean;
	paused?: boolean;
	
}