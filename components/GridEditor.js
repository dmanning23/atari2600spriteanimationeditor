import React from 'react';

const GridEditor = ({
    currentFrame,
    currentAnimation,
    animations,
    getColorHex,
    onCellClick
}) => {
    if (!animations[currentAnimation] || !animations[currentAnimation].frames[currentFrame]) {
        return null;
    }

    const frame = animations[currentAnimation].frames[currentFrame];

    // We don't need to compute gridWidth here - we should use exactly what's in the frame
    return (
        <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Canvas</p>
        <div className="border border-border inline-block rounded overflow-hidden" style={{ background: '#0A0700' }}>
            {frame.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="w-6 h-5 cursor-pointer"
                            style={{
                                backgroundColor: cell === 1 ?
                                    getColorHex(frame.lineColors1[rowIndex]) :
                                    cell === 2 ?
                                        getColorHex(frame.lineColors2[rowIndex]) :
                                        'transparent',
                                opacity: cell ? 1 : 1,
                                boxShadow: cell ? `inset 0 0 0 1px rgba(0,0,0,0.3)` : `inset 0 0 0 1px rgba(255,168,0,0.08)`,
                                filter: cell ? 'brightness(1.05)' : 'none',
                            }}
                            onClick={() => onCellClick(rowIndex, colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
        </div>
    );
};

export default GridEditor;