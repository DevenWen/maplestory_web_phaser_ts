// 定义动画配置
// 读取、解析配置，链接 frame 的数据

import { IAnimationFrame } from "./IAnimationFrame";

export interface IAnimation
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

	getTotalFrames(): number;
	destroy(): void;
	
}