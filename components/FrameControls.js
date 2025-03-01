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
    onSpeedChange
}) => {
    return (
        <div className="space-y-4 mb-4">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Button onClick={onAddFrame}>Add Frame</Button>
                <Button
                    onClick={onDeleteFrame}
                    disabled={totalFrames <= 1}
                >
                    Delete Frame
                </Button>
                <Button onClick={onCopyFrame}>Copy Frame</Button>
                <Button
                    onClick={onPasteFrame}
                    disabled={!copiedFrame}
                >
                    Paste Frame
                </Button>

                <span className="ml-4">
                    Frame: {currentFrame + 1} of {totalFrames}
                </span>

                <Button
                    onClick={onPreviousFrame}
                    disabled={currentFrame === 0}
                >
                    Previous
                </Button>

                <Button
                    onClick={onNextFrame}
                    disabled={currentFrame === totalFrames - 1}
                >
                    Next
                </Button>
            </div>

            <AnimationSpeedControl
                speed={animationSpeed}
                onChange={onSpeedChange}
            />
        </div>
    );
};

export default FrameControls;