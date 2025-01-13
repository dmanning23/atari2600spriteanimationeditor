import React from 'react';
import { Button } from '@/components/ui/button';

const Atari2600CodeExporter = ({ animations, characterName, spriteHeight }) => {
    const generateCode = () => {
        let code = `;${characterName} Sprite Data (Height: ${spriteHeight})\n\n`;

        Object.entries(animations).forEach(([animationName, animation]) => {
            code += `;${animationName} Animation Data:\n`;
            animation.frames.forEach((frame, frameIndex) => {
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
            <Button onClick={downloadCode}>Export 6502 Assembly Code</Button>
        </div>
    );
};

export default Atari2600CodeExporter;