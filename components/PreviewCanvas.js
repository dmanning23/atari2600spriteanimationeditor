import React, { useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';

const PIXEL_ASPECT_RATIO = 1.33; // Horizontal to vertical ratio for Atari 2600 pixels
const ATARI_REFRESH_RATE = 60; // 60 Hz

const PreviewCanvas = ({
    animations,
    currentAnimation,
    currentFrame,
    spriteMode,
    spriteHeight,
    isPlaying,
    toggleAnimation,
    getColorHex,
    previewBgColor,
    setPreviewBgColor
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // Function to determine grid width based on mode
    function getGridWidth() {
        return spriteMode === 'doubleWidth' ? 16 : 8;
    }

    useEffect(() => {
        if (!canvasRef.current || !animations[currentAnimation]) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cellWidth = 20 * PIXEL_ASPECT_RATIO;
        const cellHeight = 20;
        const totalWidth = getGridWidth() * cellWidth;
        canvas.width = totalWidth;
        canvas.height = spriteHeight * cellHeight;

        let frameIndex = currentFrame;
        let lastFrameTime = 0;
        const frameDuration = (animations[currentAnimation].speed / ATARI_REFRESH_RATE) * 1000; // Convert to milliseconds

        const fillBackground = () => {
            ctx.fillStyle = previewBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const animate = (currentTime) => {
            if (currentTime - lastFrameTime >= frameDuration) {
                fillBackground();
                const currentAnimationFrames = animations[currentAnimation].frames;
                if (currentAnimationFrames && currentAnimationFrames.length > 0) {
                    const frame = currentAnimationFrames[frameIndex];
                    frame.grid.forEach((row, y) => {
                        row.forEach((cell, x) => {
                            if (spriteMode === 'doubleColor') {
                                if (cell === 1) {
                                    const colorCode = frame.lineColors1[y];
                                    ctx.fillStyle = getColorHex(colorCode);
                                    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                                }
                                else if (cell === 2) {
                                    const colorCode = frame.lineColors2[y];
                                    ctx.fillStyle = getColorHex(colorCode);
                                    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                                }
                            } else if (spriteMode === 'doubleWidth') {
                                if (cell === 1) {
                                    const colorCode = frame.lineColors1[y];
                                    ctx.fillStyle = getColorHex(colorCode);
                                    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                                }
                            }
                        });
                    });
                    frameIndex = (frameIndex + 1) % currentAnimationFrames.length;
                }
                lastFrameTime = currentTime;
            }
            if (isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        if (isPlaying) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // Render the current frame when stopped
            fillBackground();
            const currentAnimationFrames = animations[currentAnimation].frames;
            if (currentAnimationFrames && currentAnimationFrames.length > 0) {
                const frame = currentAnimationFrames[currentFrame];
                frame.grid.forEach((row, y) => {
                    row.forEach((cell, x) => {
                        if (spriteMode === 'doubleColor') {
                            if (cell === 1) {
                                const colorCode = frame.lineColors1[y];
                                ctx.fillStyle = getColorHex(colorCode);
                                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                            }
                            else if (cell === 2) {
                                const colorCode = frame.lineColors2[y];
                                ctx.fillStyle = getColorHex(colorCode);
                                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                            }
                        } else if (spriteMode === 'doubleWidth') {
                            if (cell === 1) {
                                const colorCode = frame.lineColors1[y];
                                ctx.fillStyle = getColorHex(colorCode);
                                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                            }
                        }
                    });
                });
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [
        isPlaying,
        animations,
        currentAnimation,
        currentFrame,
        spriteMode,
        spriteHeight,
        getColorHex,
        getGridWidth,
        previewBgColor
    ]);

    return (
        <div className="ml-4">
            <h2 className="text-lg font-bold mb-2">Preview</h2>
            <canvas ref={canvasRef} className="border border-gray-300" />
            <div className="mt-2 flex items-center gap-2">
                <Button onClick={toggleAnimation}>
                    {isPlaying ? 'Stop' : 'Play'} Animation
                </Button>
                <label className="flex items-center gap-1 text-sm">
                    BG
                    <input
                        type="color"
                        value={previewBgColor}
                        onChange={e => setPreviewBgColor(e.target.value)}
                        className="w-8 h-8 cursor-pointer rounded border border-gray-300 p-0.5"
                        title="Preview background color"
                    />
                </label>
            </div>
        </div>
    );
};

export default PreviewCanvas;