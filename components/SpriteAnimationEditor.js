'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColorPalette from '@/components/ColorPalette';
import AnimationSpeedControl from '@/components/AnimationSpeedControl';
import SpriteHeightControl from '@/components/SpriteHeightControl';
import colorPaletteData from '@/data/desaturated-color-palette.json';
import Atari2600CodeExporter from '@/components/Atari2600CodeExporter';

const GRID_WIDTH = 8;
const DEFAULT_GRID_HEIGHT = 16;
const PIXEL_ASPECT_RATIO = 1.33; // Horizontal to vertical ratio for Atari 2600 pixels
const ATARI_REFRESH_RATE = 60; // 60 Hz

const SpriteAnimationEditor = () => {
    const [characterName, setCharacterName] = useState('');
    const [spriteHeight, setSpriteHeight] = useState(DEFAULT_GRID_HEIGHT);
    const [animations, setAnimations] = useState({
        'Default': {
            frames: [{
                grid: Array(spriteHeight).fill().map(() => Array(GRID_WIDTH).fill(false)),
                lineColors: Array(spriteHeight).fill('$00')
            }],
            speed: 30
        }
    });
    const [currentAnimation, setCurrentAnimation] = useState('Default');
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentColor, setCurrentColor] = useState('$0E'); // Default to white
    const [copiedFrame, setCopiedFrame] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [newAnimationName, setNewAnimationName] = useState('');
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const handleCellClick = (row, col) => {
        const newAnimations = { ...animations };
        const frame = { ...newAnimations[currentAnimation].frames[currentFrame] };
        frame.grid = [...frame.grid];
        frame.grid[row] = [...frame.grid[row]];
        frame.grid[row][col] = !frame.grid[row][col];

        if (frame.grid[row][col] && frame.lineColors[row] === 0) {
            frame.lineColors = [...frame.lineColors];
            frame.lineColors[row] = currentColor;
        }

        newAnimations[currentAnimation].frames[currentFrame] = frame;
        setAnimations(newAnimations);
    };

    const handleLineColorChange = (row) => {
        const newAnimations = { ...animations };
        const frame = { ...newAnimations[currentAnimation].frames[currentFrame] };
        frame.lineColors = [...frame.lineColors];
        frame.lineColors[row] = currentColor;
        newAnimations[currentAnimation].frames[currentFrame] = frame;
        setAnimations(newAnimations);
    };

    const handleSpriteHeightChange = (newHeight) => {
        setSpriteHeight(newHeight);
        setAnimations(prevAnimations => {
            const newAnimations = {};
            Object.entries(prevAnimations).forEach(([name, animation]) => {
                newAnimations[name] = {
                    ...animation,
                    frames: animation.frames.map(frame => ({
                        grid: frame.grid.slice(0, newHeight).map(row => [...row]),
                        lineColors: frame.lineColors.slice(0, newHeight)
                    }))
                };
                // If new height is larger, add empty rows
                while (newAnimations[name].frames[0].grid.length < newHeight) {
                    newAnimations[name].frames.forEach(frame => {
                        frame.grid.push(Array(GRID_WIDTH).fill(false));
                        frame.lineColors.push('$00');
                    });
                }
            });
            return newAnimations;
        });
    };

    const addFrame = () => {
        const newAnimations = { ...animations };
        newAnimations[currentAnimation].frames.push({
            grid: Array(spriteHeight).fill().map(() => Array(GRID_WIDTH).fill(false)),
            lineColors: Array(spriteHeight).fill('$00')
        });
        setAnimations(newAnimations);
        setCurrentFrame(newAnimations[currentAnimation].frames.length - 1);
    };

    const deleteFrame = () => {
        if (animations[currentAnimation].frames.length > 1) {
            const newAnimations = { ...animations };
            newAnimations[currentAnimation].frames = newAnimations[currentAnimation].frames.filter((_, index) => index !== currentFrame);
            setAnimations(newAnimations);
            setCurrentFrame(Math.min(currentFrame, newAnimations[currentAnimation].frames.length - 1));
        }
    };

    const copyFrame = () => {
        setCopiedFrame(JSON.parse(JSON.stringify(animations[currentAnimation].frames[currentFrame])));
    };

    const pasteFrame = () => {
        if (copiedFrame) {
            const newAnimations = { ...animations };
            newAnimations[currentAnimation].frames[currentFrame] = JSON.parse(JSON.stringify(copiedFrame));
            setAnimations(newAnimations);
        }
    };

    const addAnimation = () => {
        if (newAnimationName && !animations[newAnimationName]) {
            setAnimations({
                ...animations,
                [newAnimationName]: {
                    frames: [{
                        grid: Array(spriteHeight).fill().map(() => Array(GRID_WIDTH).fill(false)),
                        lineColors: Array(spriteHeight).fill('$00')
                    }],
                    speed: 30
                }
            });
            setCurrentAnimation(newAnimationName);
            setCurrentFrame(0);
            setNewAnimationName('');
        }
    };

    const deleteAnimation = () => {
        if (Object.keys(animations).length > 1) {
            const newAnimations = { ...animations };
            delete newAnimations[currentAnimation];
            setAnimations(newAnimations);
            setCurrentAnimation(Object.keys(newAnimations)[0]);
            setCurrentFrame(0);
        }
    };

    const handleAnimationChange = (newAnimation) => {
        setCurrentAnimation(newAnimation);
        setCurrentFrame(0);
        setIsPlaying(false);
    };

    const handleSpeedChange = (newSpeed) => {
        const newAnimations = { ...animations };
        newAnimations[currentAnimation].speed = newSpeed;
        setAnimations(newAnimations);
    };

    const saveProject = () => {
        const projectData = {
            characterName: characterName,
            animations: animations // This now correctly includes both frames and speed for each animation
        };
        const data = JSON.stringify(projectData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${characterName || 'sprite'}_project.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const fileInputRef = useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const loadProject = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedProject = JSON.parse(e.target.result);
                    if (typeof loadedProject.animations === 'object' && Object.keys(loadedProject.animations).length > 0) {
                        // Ensure each animation has both frames and speed
                        const loadedAnimations = Object.fromEntries(
                            Object.entries(loadedProject.animations).map(([name, animation]) => [
                                name,
                                {
                                    frames: animation.frames || [],
                                    speed: animation.speed || 30 // Default to 30 if speed is not present
                                }
                            ])
                        );
                        setAnimations(loadedAnimations);
                        setCurrentAnimation(Object.keys(loadedAnimations)[0]);
                        setCurrentFrame(0);
                        if (typeof loadedProject.characterName === 'string') {
                            setCharacterName(loadedProject.characterName);
                        }
                    } else {
                        alert('Invalid file format');
                    }
                } catch (error) {
                    alert('Error loading file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };

    const toggleAnimation = () => {
        setIsPlaying(!isPlaying);
    };

    const getColorHex = (code) => {
        const colorObj = colorPaletteData.palette.find(c => c.code === code);
        return colorObj ? colorObj.color : 'transparent';
    };

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cellWidth = 20 * PIXEL_ASPECT_RATIO;
        const cellHeight = 20;
        canvas.width = GRID_WIDTH * cellWidth;
        canvas.height = spriteHeight * cellHeight;

        let frameIndex = 0;
        let lastFrameTime = 0;
        const frameDuration = (animations[currentAnimation].speed / ATARI_REFRESH_RATE) * 1000; // Convert to milliseconds

        const animate = (currentTime) => {
            if (currentTime - lastFrameTime >= frameDuration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const currentAnimationFrames = animations[currentAnimation].frames;
                if (currentAnimationFrames && currentAnimationFrames.length > 0) {
                    const frame = currentAnimationFrames[frameIndex];
                    frame.grid.forEach((row, y) => {
                        row.forEach((cell, x) => {
                            if (cell) {
                                const colorCode = frame.lineColors[y];
                                const colorHex = colorPaletteData.palette.find(c => c.code === colorCode)?.color || '#000000';
                                ctx.fillStyle = colorHex;
                                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
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
            const currentAnimationFrames = animations[currentAnimation].frames;
            if (currentAnimationFrames && currentAnimationFrames.length > 0) {
                const frame = currentAnimationFrames[currentFrame];
                frame.grid.forEach((row, y) => {
                    row.forEach((cell, x) => {
                        if (cell) {
                            const colorCode = frame.lineColors[y];
                            const colorHex = colorPaletteData.palette.find(c => c.code === colorCode)?.color || '#000000';
                            ctx.fillStyle = colorHex;
                            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
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
    }, [isPlaying, animations, currentAnimation, currentFrame]);

    return (
        <div className="p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Atari 2600 Sprite Animation Editor</h1>

            <div className="mb-4">
                <label htmlFor="character-name" className="block text-sm font-medium text-gray-700">Character Name</label>
                <Input
                    id="character-name"
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter character name"
                    className="mt-1"
                />
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Button onClick={saveProject}>Save Project</Button>
                    <input
                        type="file"
                        accept=".json"
                        onChange={loadProject}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
                    <Button onClick={triggerFileInput}>Load Project</Button>
                </div>
                <SpriteHeightControl height={spriteHeight} onHeightChange={handleSpriteHeightChange} />
            </div>

            <div className="flex mb-4">
                <div className="mr-2">
                    {animations[currentAnimation] && animations[currentAnimation].frames[currentFrame] &&
                        animations[currentAnimation].frames[currentFrame].lineColors.map((color, index) => (
                            <div
                                key={index}
                                className="w-8 h-6 border border-gray-300 cursor-pointer mb-[1px]"
                                style={{ backgroundColor: color !== undefined ? getColorHex(color) : 'transparent' }}
                                onClick={() => handleLineColorChange(index)}
                                title={color !== undefined ? getColorHex(color) : 'No color'}
                            />
                        ))}
                </div>
                <div className="border border-gray-300 inline-block bg-white">
                    {animations[currentAnimation] && animations[currentAnimation].frames[currentFrame] &&
                        animations[currentAnimation].frames[currentFrame].grid.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex">
                                {row.map((cell, colIndex) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className="w-8 h-6 border border-gray-200 cursor-pointer"
                                        style={{
                                            backgroundColor: cell ? getColorHex(animations[currentAnimation].frames[currentFrame].lineColors[rowIndex]) : 'transparent',
                                            opacity: cell ? 1 : 0.3
                                        }}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                    />
                                ))}
                            </div>
                        ))}
                </div>
                <div className="ml-4">
                    <h2 className="text-lg font-bold mb-2">Preview</h2>
                    <canvas ref={canvasRef} className="border border-gray-300" />
                    <Button className="mt-2" onClick={toggleAnimation}>
                        {isPlaying ? 'Stop' : 'Play'} Animation
                    </Button>
                </div>
                <div className="ml-4">
                    <ColorPalette onColorSelect={setCurrentColor} currentColor={currentColor} />
                </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <Select value={currentAnimation} onValueChange={handleAnimationChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select animation" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(animations).map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="text"
                    placeholder="New animation name"
                    value={newAnimationName}
                    onChange={(e) => setNewAnimationName(e.target.value)}
                />
                <Button onClick={addAnimation}>Add Animation</Button>
                <Button onClick={deleteAnimation} disabled={Object.keys(animations).length <= 1}>Delete Animation</Button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <Button onClick={addFrame}>Add Frame</Button>
                <Button onClick={deleteFrame} disabled={animations[currentAnimation].frames.length === 1}>Delete Frame</Button>
                <Button onClick={copyFrame}>Copy Frame</Button>
                <Button onClick={pasteFrame} disabled={!copiedFrame}>Paste Frame</Button>
                <span className="ml-4">
                    Frame: {currentFrame + 1} of {animations[currentAnimation] ? animations[currentAnimation].frames.length : 0}
                </span>
                <Button onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))} disabled={currentFrame === 0}>Previous</Button>
                <Button onClick={() => setCurrentFrame(Math.min(animations[currentAnimation].frames.length - 1, currentFrame + 1))} disabled={currentFrame === animations[currentAnimation].frames.length - 1}>Next</Button>
            </div>
            <AnimationSpeedControl
                speed={animations[currentAnimation].speed}
                onChange={handleSpeedChange}
            />
            <Atari2600CodeExporter
                animations={animations}
                characterName={characterName}
                spriteHeight={spriteHeight} />
        </div>
    );
};

export default SpriteAnimationEditor;