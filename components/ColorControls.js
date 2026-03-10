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
        <div className="flex gap-3">
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Palette</p>
                <ColorPalette
                    onColorSelect={onColorSelect}
                    currentColor={currentColor}
                />
            </div>

            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">C1</p>
                <LineColorSelector
                    lineColors={frame.lineColors1}
                    onLineColorChange={onLineColorChange}
                    lineNumber={1}
                    getColorHex={getColorHex}
                />
            </div>

            {spriteMode === 'doubleColor' && (
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">C2</p>
                    <LineColorSelector
                        lineColors={frame.lineColors2}
                        onLineColorChange={onLineColorChange}
                        lineNumber={2}
                        getColorHex={getColorHex}
                    />
                </div>
            )}
        </div>
    );
};

export default ColorControls;