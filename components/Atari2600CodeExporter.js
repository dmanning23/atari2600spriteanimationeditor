import React from 'react';
import { Button } from '@/components/ui/button';

const Atari2600CodeExporter = ({ animations, characterName, spriteHeight }) => {
    const generateCode = () => {
        let code = `;${characterName} Sprite Data (Height: ${spriteHeight})\n\n`;

        Object.entries(animations).forEach(([animationName, animation]) => {
            code += `${animationName}_Data:\n`;
            animation.frames.forEach((frame, frameIndex) => {
                code += `  ; Frame ${frameIndex + 1}\n`;
                frame.grid.slice(0, spriteHeight).forEach((row, rowIndex) => {
                    const byte = row.reduce((acc, cell, index) => acc | (cell ? (1 << (7 - index)) : 0), 0);
                    code += `  .byte %${byte.toString(2).padStart(8, '0')} ; Row ${rowIndex + 1}\n`;
                });
                code += '\n';
            });

            code += `${animationName}_ColorData:\n`;
            animation.frames.forEach((frame, frameIndex) => {
                code += `  ; Frame ${frameIndex + 1} Colors\n`;
                frame.lineColors.slice(0, spriteHeight).forEach((color, rowIndex) => {
                    code += `  .byte ${color} ; Row ${rowIndex + 1}\n`;
                });
                code += '\n';
            });

            code += `${animationName}_Speed:\n`;
            code += `  .byte ${animation.speed} ; Animation speed\n\n`;
        });

        // Add some basic setup code
        code += `
SPRITE_HEIGHT = ${spriteHeight}

SetupSprites:
  lda #<${Object.keys(animations)[0]}_Data
  sta SPRITE_PTR
  lda #>${Object.keys(animations)[0]}_Data
  sta SPRITE_PTR+1
  lda #<${Object.keys(animations)[0]}_ColorData
  sta COLOR_PTR
  lda #>${Object.keys(animations)[0]}_ColorData
  sta COLOR_PTR+1
  rts

AnimateSprite:
  ; Animation code here
  rts

; Color registers
COLUP0 = $0006 ; Player 0 color
COLUP1 = $0007 ; Player 1 color
COLUPF = $0008 ; Playfield color
COLUBK = $0009 ; Background color

; Assume these are defined elsewhere:
; SPRITE_PTR = $80 ; 2 bytes
; COLOR_PTR = $82 ; 2 bytes
`;

        return code;
    };

    const downloadCode = () => {
        const code = generateCode();
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${characterName}_sprite_h${spriteHeight}.asm`;
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