import { CreateAnimData } from "~/animation/CreateAnimData";
import { IAnimation } from "~/animation/IAnimation";
import { IAnimationData } from "~/animation/IAnimationData";
import { IAnimationFrame } from "~/animation/IAnimationFrame";
import { IAnimatedSprite } from "./IAnimatedSprite";
import { IAnimationPlayConfig } from "./IAnimationPlayerConfig";

export class AnimatedSprite implements IAnimatedSprite
{
	currentAnimation: IAnimation;
	currentFrame: IAnimationFrame;
	animData: IAnimationData = CreateAnimData();
	hasStarted: boolean;
	forward: boolean;
	inReverse: boolean;

	private accumulator: number = 0;
	private nextTick: number = 0;
	private delayCounter: number = 0;
	private repeatCounter: number = 0;
	private pendingRepeat: boolean = false;
	private paused: boolean = false;
	private wasPlaying: boolean = false;
	private pendingStop: number = 0;
	private pendingStopValue: number = 0;

	private setFrameCallback: (frame: IAnimationFrame) => void
	private animationCache: Map<String, IAnimation>

	constructor (animationLoadConfig: Map<String, IAnimation>, setFrameCallback)
	{
		this.animationCache = animationLoadConfig
		this.setFrameCallback = setFrameCallback
	}

	changeAnimaiton(key: string, config: IAnimationPlayConfig): void {
		const {
			speed = 24,
			repeat = 0,
			yoyo = false,
			startFrame = 0,
			delay = 0,
			repeatDelay = 0,
			forceRestart = false,
			forward = true
		} = config;

		if (this.animationCache.has(key))
		{
			const ani = this.animationCache.get(key)
			this.currentAnimation = ani
			this.currentFrame = null

			this.forward = forward 
			this.animData.currentAnim = key
			this.animData.yoyo = yoyo
			this.animData.repeat = repeat
			this.animData.frameRate = speed

			this.play()
		} else {
			console.warn("no animation found, ", key)
		}
	}

	private handleStart (): void
	{
			if (this.animData.showOnStart)
			{
					// this.visible = true;
			}

			if (!this.currentFrame) {
				this.currentFrame = this.currentAnimation.firstFrame
			}

			this.setCurrentFrame(this.currentFrame);

			this.hasStarted = true;

			// this.emitEvents(Events.ANIMATION_START);
	}

	private handleRepeat (): void
	{
			this.pendingRepeat = false;

			// this.emitEvents(Events.ANIMATION_REPEAT);
	}

	private handleStop (): void
	{
			this.pendingStop = 0;

			this.animData.isPlaying = false;

			// this.emitEvents(Events.ANIMATION_STOP);
	}

	private handleComplete (): void
	{
			this.pendingStop = 0;

			this.animData.isPlaying = false;

			if (this.animData.hideOnComplete)
			{
					// this.visible = false;
			}

			// this.emitEvents(Events.ANIMATION_COMPLETE, Events.ANIMATION_COMPLETE_KEY);
	}

	reverse (): this
	{
			if (this.isPlaying)
			{
					this.inReverse = !this.inReverse;

					this.forward = !this.forward;
			}

			return this;
	}

	getProgress (): number
	{
			const frame = this.currentFrame;

			if (!frame)
			{
					return 0;
			}

			let p = frame.progress;

			if (this.inReverse)
			{
					p *= -1;
			}

			return p;
	}

	stop (): this
	{

			this.animData.isPlaying = false;

			if (this.currentAnimation)
			{
					this.handleStop();
			}

			return this;
	}

	update (ts: number, delta: number)
	{
		const data = this.animData;
		const anim = this.currentAnimation;

		if (!anim || !data.isPlaying || anim.paused)
		{
				return;
		}

		this.accumulator += delta * data.timeScale;

		if (this.pendingStop === 1)
		{
				this.pendingStopValue -= delta;

				if (this.pendingStopValue <= 0)
				{
						this.stop();

						return;
				}
		}

		if (!this.hasStarted)
		{
				if (this.accumulator >= this.delayCounter)
				{
						this.accumulator -= this.delayCounter;

						this.handleStart();
				}
		}
		else if (this.accumulator >= this.nextTick)
		{
				//  Process one frame advance as standard

				if (this.forward)
				{
						this.nextFrame();
				}
				else
				{
						this.prevFrame();
				}

				//  And only do more if we're skipping frames and have time left
				if (data.isPlaying && this.pendingStop === 0 && anim.skipMissedFrames && this.accumulator > this.nextTick)
				{
						let safetyNet = 0;

						do
						{
								if (this.forward)
								{
										this.nextFrame();
								}
								else
								{
										this.prevFrame();
								}

								safetyNet++;

						} while (data.isPlaying && this.accumulator > this.nextTick && safetyNet < 60);
				}
		}

	}

	nextFrame (): this
	{
			const frame = this.currentFrame;
			const data = this.animData;

			if (frame.isLast)
			{
					//  We're at the end of the animation

					//  Yoyo? (happens before repeat)
					if (data.yoyo)
					{
							this.handleYoyoFrame(false);
					}
					else if (this.repeatCounter > 0)
					{
							//  Repeat (happens before complete)
							if (this.inReverse && this.forward)
							{
									this.forward = false;
							}
							else
							{
									this.repeatAnimation();
							}
					}
					else
					{
							this.complete();
					}
			}
			else
			{
					this.setCurrentFrame(this.currentFrame.nextFrame);

					this.getNextTick();
			}

			return this;
    }

		repeatAnimation (): this
    {
        if (this.pendingStop === 2)
        {
            if (this.pendingStopValue === 0)
            {
                return this.stop();
            }
            else
            {
                this.pendingStopValue--;
            }
        }

        const data = this.animData;

        if (data.repeatDelay > 0 && !this.pendingRepeat)
        {
            this.pendingRepeat = true;
            this.accumulator -= this.nextTick;
            this.nextTick += data.repeatDelay;
        }
        else
        {
            this.repeatCounter--;

            if (this.forward)
            {
                this.setCurrentFrame(this.currentFrame.nextFrame);
            }
            else
            {
                this.setCurrentFrame(this.currentFrame.prevFrame);
            }

            if (this.animData.isPlaying)
            {
                this.getNextTick();

                this.handleRepeat();
            }
        }
    }

		setCurrentFrame (animFrame: IAnimationFrame): void
    {
        this.currentFrame = animFrame;

        // this.setTexture(animFrame.texture, animFrame.frame);
				// if (this.animData.onSetFrame)
				// {
				// 	this.animData.onSetFrame(this, animFrame)
				// }
				// this.onSetFrame(this)
				if (this.setFrameCallback) {
					this.setFrameCallback(this.currentFrame)
				}
    }

		getNextTick (): void
    {
        this.accumulator -= this.nextTick;

        this.nextTick = this.currentAnimation.msPerFrame + this.currentFrame.duration;
    }


		handleYoyoFrame (isReverse: boolean = false): void
    {
        const animData = this.animData;

        if (this.inReverse === !isReverse && this.repeatCounter > 0)
        {
            if (animData.repeatDelay === 0 || this.pendingRepeat)
            {
                this.forward = isReverse;
            }

            this.repeatAnimation();

            return;
        }

        if (this.inReverse !== isReverse && this.repeatCounter === 0)
        {
            this.complete();

            return;
        }

        this.forward = isReverse;

        if (isReverse)
        {
            this.setCurrentFrame(this.currentFrame.nextFrame);
        }
        else
        {
            this.setCurrentFrame(this.currentFrame.prevFrame);
        }

        this.getNextTick();
    }

		prevFrame (): this
    {
        const frame = this.currentFrame;
        const animData = this.animData;

        if (frame.isFirst)
        {
            //  We're at the start of the animation
            if (animData.yoyo)
            {
                this.handleYoyoFrame(true);
            }
            else if (this.repeatCounter > 0)
            {
                if (this.inReverse && !this.forward)
                {
                    this.repeatAnimation();
                }
                else
                {
                    //  Repeat (happens before complete)
                    this.forward = true;

                    this.repeatAnimation();
                }
            }
            else
            {
                this.complete();
            }
        }
        else
        {
            this.setCurrentFrame(frame.prevFrame);
            this.getNextTick();
        }

        return this;
    }

    complete (): void
    {
        this.pendingStop = 0;

        this.animData.isPlaying = false;

        if (this.currentAnimation)
        {
            this.handleComplete();
        }
    }

		play (): this
    {
        const data = this.animData;
				this.hasStarted = false

        if (data.repeat === -1)
        {
            //  Should give us 9,007,199,254,740,991 safe repeats
            this.repeatCounter = Number.MAX_VALUE;
        }

        data.isPlaying = true;

        //  If there is no start delay, we set the first frame immediately
        if (data.delay === 0)
        {
            // this.setTexture(this.currentFrame.texture, this.currentFrame.frame);

            if (data.onStart)
            {
                data.onStart(this, this.currentAnimation);
            }
        }
        else
        {
            data.pendingStart = true;
        }

        return this;
    }

		pause (atFrame: IAnimationFrame): this
    {
        if (!this.paused)
        {
            this.paused = true;
            // this.wasPlaying = this.isPlaying;
            this.animData.isPlaying = false;
        }

        if (atFrame)
        {
            this.setCurrentFrame(atFrame);
        }

        return this;
    }

		get isPlaying (): boolean
    {
        return this.animData.isPlaying;
    }

    get isPlayingForward (): boolean
    {
        return (this.animData.isPlaying && this.forward);
    }

    destroy (): void
    {
        // super.destroy(reparentChildren);

        this.animData = null;
    }

}