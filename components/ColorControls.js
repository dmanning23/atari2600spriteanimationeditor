import React from 'react';
import ColorPalette from './ColorPalette';
import LineColorSelector from './LineColorSelector';

const ColorControls = ({
    currentFrame,
    currentAnimation,
    animations,
    currentColor,
    onColorSelect,
    onLineColorChange,
    getColorHex,
    spriteMode
}) => {
    if (!animations[currentAnimation] || !animations[currentAnimation].frames[currentFrame]) {
        return null;
    }

    const frame = animations[currentAnimation].frames[currentFrame];

    return (
        <div className="flex mb-4 space-x-4">
            <div>
                <ColorPalette
                    onColorSelect={onColorSelect}
                    currentColor={currentColor}
                />
            </div>

            <LineColorSelector
                lineColors={frame.lineColors1}
                onLineColorChange={onLineColorChange}
                lineNumber={1}
                getColorHex={getColorHex}
            />

            {spriteMode === 'doubleColor' && (
                <LineColorSelector
                    lineColors={frame.lineColors2}
                    onLineColorChange={onLineColorChange}
                    lineNumber={2}
                    getColorHex={getColorHex}
                />
            )}
        </div>
    );
};

export default ColorControls;