// components/LineColorSelector.js
'use client';

import React from 'react';

const LineColorSelector = ({ lineColors, onLineColorChange, lineNumber, getColorHex }) => {
    return (
        <div className="mr-4">

            {lineColors && lineColors.map((color, index) => (
                <div
                    key={index}
                    className="w-5 h-5 border border-border cursor-pointer mb-[0px]"
                    style={{
                        backgroundColor: color !== undefined ? getColorHex(color) : 'transparent'
                    }}
                    onClick={() => onLineColorChange(index, lineNumber)}
                    title={`Row ${index + 1}, Color ${lineNumber}`}
                />
            ))}
        </div>
    );
};

export default LineColorSelector;