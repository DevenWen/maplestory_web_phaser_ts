import { IAnimation } from './IAnimation';

export function CalculateDuration (animation: IAnimation, frameRate?: number, duration?: number): IAnimation
{
    const totalFrames = animation.frames.size;

    if (!Number.isFinite(duration) && !Number.isFinite(frameRate))
    {
        //  No duration or frameRate given, use default frameRate of 24fps
        animation.frameRate = 24;
        animation.duration = (24 / totalFrames) * 1000;
    }
    else if (duration && !Number.isFinite(frameRate))
    {
        //  Duration given but no frameRate, so set the frameRate based on duration
        //  I.e. 12 frames in the animation, duration = 4000 ms
        //  So frameRate is 12 / (4000 / 1000) = 3 fps
        animation.duration = duration;
        animation.frameRate = totalFrames / (duration / 1000);
    }
    else
    {
        //  frameRate given, derive duration from it (even if duration also specified)
        //  I.e. 15 frames in the animation, frameRate = 30 fps
        //  So duration is 15 / 30 = 0.5 * 1000 (half a second, or 500ms)
        animation.frameRate = frameRate;
        animation.duration = (totalFrames / frameRate) * 1000;
    }

    animation.msPerFrame = 1000 / animation.frameRate;

    return animation;
}
