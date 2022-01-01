export interface IAnimationFrame
{
	bodyAction: string;
	frame: number;
	isFirst: boolean;
	isLast: boolean;
	isKeyFrame: boolean;
	nextFrame: IAnimationFrame;
	prevFrame: IAnimationFrame;
	duration: number;
	progress: number;
	config;
}