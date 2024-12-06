// components/LineColorSelector.js
'use client';

import React from 'react';

const LineColorSelector = ({ lineColors, onLineColorChange, lineNumber, getColorHex }) => {
    return (
        <div className="mr-2">
            {lineColors && lineColors.map((color, index) => (
                <div
                    key={index}
                    className="w-8 h-6 border border-gray-300 cursor-pointer mb-[0px]"
                    style={{
                        backgroundColor: color !== undefined ? getColorHex(color) : 'transparent'
                    }}
                    onClick={() => onLineColorChange(index, lineNumber)}
                    title={color !== undefined ? getColorHex(color) : 'No color'}
                />
            ))}
        </div>
    );
};

export default LineColorSelector;