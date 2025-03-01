import React from 'react';
import { Button } from '../components/ui/button';

const Atari2600CodeExporter = ({ animations, characterName, spriteHeight, withColor, mode }) => {
    const generateCode = () => {
        let code = `;${characterName} Sprite Data (Height: ${spriteHeight}, Mode: ${mode})\n\n`;

        Object.entries(animations).forEach(([animationName, animation]) => {
            code += `;${animationName} Animation Data:\n`;
            animation.frames.forEach((frame, frameIndex) => {
                // For double-width mode, we need to handle 16-column wide sprites
                if (mode === 'doubleWidth') {
                    code += `${characterName}${animationName}${frameIndex + 1}1\n`;
                    for (let i = spriteHeight - 1; i >= 0; i--) {
                        const row = frame.grid[i];
                        // First byte (leftmost 8 pixels)
                        const leftByte = row.slice(0, 8).reduce((acc, cell, index) =>
                            acc | (cell !== 0 ? (1 << (7 - index)) : 0), 0);
                        code += `  .byte %${leftByte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i} (left)\n`;
                    }
                    code += '\n';

                    code += `${characterName}${animationName}${frameIndex + 1}2\n`;
                    for (let i = spriteHeight - 1; i >= 0; i--) {
                        const row = frame.grid[i];
                        // Second byte (rightmost 8 pixels)
                        const rightByte = row.slice(8, 16).reduce((acc, cell, index) =>
                            acc | (cell !== 0 ? (1 << (7 - index)) : 0), 0);
                        code += `  .byte %${rightByte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i} (right)\n`;
                    }
                    code += '\n';

                    if (withColor) {
                        code += `${characterName}${animationName}Color${frameIndex + 1}\n`;
                        for (let i = spriteHeight - 1; i >= 0; i--) {
                            const color = frame.lineColors1[i];
                            code += `  .byte ${color} ; Row ${spriteHeight - i}\n`;
                        }
                        code += '\n';
                    }
                } else {
                    // Original double-color mode
                    code += `${characterName}${animationName}${frameIndex + 1}1\n`;
                    for (let i = spriteHeight - 1; i >= 0; i--) {
                        const row = frame.grid[i];
                        const byte = row.reduce((acc, cell, index) => acc | (cell === 1 ? (1 << (7 - index)) : 0), 0);
                        code += `  .byte %${byte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i}\n`;
                    }
                    code += '\n';

                    code += `${characterName}${animationName}${frameIndex + 1}2\n`;
                    for (let i = spriteHeight - 1; i >= 0; i--) {
                        const row = frame.grid[i];
                        const byte = row.reduce((acc, cell, index) => acc | (cell === 2 ? (1 << (7 - index)) : 0), 0);
                        code += `  .byte %${byte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i}\n`;
                    }
                    code += '\n';

                    if (withColor) {
                        code += `${characterName}${animationName}Color${frameIndex + 1}1\n`;
                        for (let i = spriteHeight - 1; i >= 0; i--) {
                            const color = frame.lineColors1[i];
                            code += `  .byte ${color} ; Row ${spriteHeight - i}\n`;
                        }
                        code += '\n';

                        code += `${characterName}${animationName}Color${frameIndex + 1}2\n`;
                        for (let i = spriteHeight - 1; i >= 0; i--) {
                            const color = frame.lineColors2[i];
                            code += `  .byte ${color} ; Row ${spriteHeight - i}\n`;
                        }
                        code += '\n';
                    }
                }
            });

            code += `${characterName}${animationName}Speed:\n`;
            code += `  .byte ${animation.speed} ; Animation speed\n\n`;

            code += `${characterName}${animationName}Frames:\n`;
            code += `  .byte ${animation.frames.length} ; Number of frames\n\n`;
        });

        return code;
    };

    const downloadCode = () => {
        const code = generateCode();
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${characterName}_sprite.asm`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <Button onClick={downloadCode}>
                Export 6502{mode === 'doubleWidth' ? " (double width)" : (withColor ? "" : " (no colors)")}
            </Button>
        </div>
    );
};

export default Atari2600CodeExporter;