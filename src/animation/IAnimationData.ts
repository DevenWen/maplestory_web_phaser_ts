import { IAnimatedSprite } from '~/character/IAnimatedSprite';
import { IAnimation } from './IAnimation';
import { IAnimationFrame } from './IAnimationFrame';

export interface IAnimationData
{
    currentAnim: string;
    frameRate: number;
    duration: number;
    delay: number;
    repeat: number;
    repeatDelay: number;
    yoyo: boolean;
    hold: number;
    showOnStart: boolean;
    hideOnComplete: boolean;
    stopAfter: number;
    startFrame: number;
    timeScale: number;
    nextFrameTime: number;
    repeatCount: number;
    isPlaying: boolean;
    forceRestart: boolean;
    pendingStart: boolean;
    playingForward: boolean;

    onStart?: (sprite: IAnimatedSprite, animation: IAnimation) => void;
    onRepeat?: (sprite: IAnimatedSprite, animation: IAnimation) => void;
    onComplete?: (sprite: IAnimatedSprite, animation: IAnimation) => void;
    onSetFrame?: (sprite: IAnimatedSprite, frame: IAnimationFrame) => void;
}
