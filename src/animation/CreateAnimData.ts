import { IAnimationData } from './IAnimationData';

export function CreateAnimData (
    currentAnim: string = '',
    frameRate: number = 0,
    duration: number = 0,
    delay: number = 0,
    repeat: number = 0,
    repeatDelay: number = 0,
    yoyo: boolean = false,
    hold: number = 0,
    showOnStart: boolean = false,
    hideOnComplete: boolean = false
): IAnimationData
{
    return {
        currentAnim,
        frameRate,
        duration,
        delay,
        repeat,
        repeatDelay,
        yoyo,
        hold,
        showOnStart,
        hideOnComplete,
        stopAfter: 0,
        startFrame: 0,
        timeScale: 1,
        onStart: null,
        onRepeat: null,
        onComplete: null,
        nextFrameTime: 0,
        repeatCount: 0,
        isPlaying: false,
        forceRestart: false,
        pendingStart: false,
        playingForward: true
    };
}
