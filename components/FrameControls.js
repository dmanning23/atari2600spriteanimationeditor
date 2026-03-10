import React from 'react';
import { Button } from '../components/ui/button';
import AnimationSpeedControl from './AnimationSpeedControl';

const FrameControls = ({
    currentFrame,
    totalFrames,
    onAddFrame,
    onDeleteFrame,
    onCopyFrame,
    onPasteFrame,
    onPreviousFrame,
    onNextFrame,
    copiedFrame,
    animationSpeed,
    onSpeedChange,
    onFlipHorizontal
}) => {
    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frames</p>
            <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={onAddFrame}>Add Frame</Button>
                <Button onClick={onDeleteFrame} disabled={totalFrames <= 1}>Delete Frame</Button>
                <Button onClick={onCopyFrame}>Copy Frame</Button>
                <Button onClick={onPasteFrame} disabled={!copiedFrame}>Paste Frame</Button>
                <Button variant="outline" onClick={onFlipHorizontal}>Flip Horizontal</Button>

                <span className="mx-2 text-sm text-muted-foreground">
                    Frame {currentFrame + 1} of {totalFrames}
                </span>

                <Button variant="outline" onClick={onPreviousFrame} disabled={currentFrame === 0}>&#8592;</Button>
                <Button variant="outline" onClick={onNextFrame} disabled={currentFrame === totalFrames - 1}>&#8594;</Button>
            </div>

            <AnimationSpeedControl
                speed={animationSpeed}
                onChange={onSpeedChange}
            />
        </div>
    );
};

export default FrameControls;