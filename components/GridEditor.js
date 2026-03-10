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
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Canvas</p>
        <div className="border border-slate-300 inline-block bg-white rounded">
            {frame.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="w-6 h-5 border border-gray-200 cursor-pointer"
                            style={{
                                backgroundColor: cell === 1 ?
                                    getColorHex(frame.lineColors1[rowIndex]) :
                                    cell === 2 ?
                                        getColorHex(frame.lineColors2[rowIndex]) :
                                        'transparent',
                                opacity: cell ? 1 : 0.3
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