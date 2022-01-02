export interface IAnimationFrame
{
	key: string;
	frame: number;
	isFirst?: boolean;
	isLast?: boolean;
	isKeyFrame?: boolean;
	nextFrame?: IAnimationFrame;
	prevFrame?: IAnimationFrame;
	duration: number;
	progress?: number;
	config;
}