import React from 'react';
import { Button } from '@/components/ui/button';
import colorPaletteData from '@/data/desaturated-color-palette.json';

const ColorPalette = ({ onColorSelect, currentColor }) => {
    const getColorHex = (code) => {
        const colorObj = colorPaletteData.palette.find(c => c.code === code);
        return colorObj ? colorObj.color : 'transparent';
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(16, auto)',
            gap: '2px',
            marginBottom: '1rem'
        }}>
            {colorPaletteData.palette.map((color) => (
                <Button
                    key={color.code}
                    className={`p-0 ${currentColor === color.code ? 'ring-1 ring-offset-1 ring-black' : ''}`}
                    style={{
                        backgroundColor: getColorHex(color.code),
                        width: '20px',
                        height: '20px',
                        minWidth: 'unset',
                        borderRadius: '2px'
                    }}
                    onClick={() => onColorSelect(color.code)}
                    title={`${color.code} - ${color.color}`}
                />
            ))}
        </div>
    );
};

export default ColorPalette;