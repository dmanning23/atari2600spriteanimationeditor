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
import LineColorSelector from '@/components/LineColorSelector';

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
                grid: Array(spriteHeight).fill().map(() => Array(GRID_WIDTH).fill(0)),
                lineColors1: Array(spriteHeight).fill('$00'),
                lineColors2: Array(spriteHeight).fill('$00')
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

        if (frame.grid[row][col] === 0) {
            frame.grid[row][col] = 1;
        }
        else if (frame.grid[row][col] === 1) {
            frame.grid[row][col] = 2;
        }
        else {
            frame.grid[row][col] = 0;
        }

        newAnimations[currentAnimation].frames[currentFrame] = frame;
        setAnimations(newAnimations);
    };

    const handleLineColorChange = (row, lineNumber) => {
        const newAnimations = { ...animations };
        const frame = { ...newAnimations[currentAnimation].frames[currentFrame] };
        if (lineNumber === 1) {
            frame.lineColors1 = [...frame.lineColors1];
            frame.lineColors1[row] = currentColor;
        }
        else {
            frame.lineColors2 = [...frame.lineColors2];
            frame.lineColors2[row] = currentColor;
        }
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
                        lineColors1: frame.lineColors1.slice(0, newHeight),
                        lineColors2: frame.lineColors2.slice(0, newHeight)
                    }))
                };
                // If new height is larger, add empty rows
                while (newAnimations[name].frames[0].grid.length < newHeight) {
                    newAnimations[name].frames.forEach(frame => {
                        frame.grid.push(Array(GRID_WIDTH).fill(0));
                        frame.lineColors1.push('$00');
                        frame.lineColors2.push('$00');
                    });
                }
            });
            return newAnimations;
        });
    };

    const addFrame = () => {
        const newAnimations = { ...animations };
        newAnimations[currentAnimation].frames.push({
            grid: Array(spriteHeight).fill().map(() => Array(GRID_WIDTH).fill(0)),
            lineColors1: Array(spriteHeight).fill('$00'),
            lineColors2: Array(spriteHeight).fill('$00'),
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
                        grid: Array(spriteHeight).fill().map(() => Array(GRID_WIDTH).fill(0)),
                        lineColors1: Array(spriteHeight).fill('$00'),
                        lineColors2: Array(spriteHeight).fill('$00'),
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
            spriteHeight: spriteHeight,
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

        // Check if a file was actually selected
        if (!file) {
            alert('Please select a file');
            return;
        }

        // Validate file type (assuming we want JSON files)
        if (!file.name.toLowerCase().endsWith('.json')) {
            alert('Please select a JSON file');
            return;
        }

        const reader = new FileReader();

        reader.onerror = () => {
            alert('Error reading file');
        };

        reader.onload = (e) => {
            try {
                const loadedProject = JSON.parse(e.target.result);

                // Validate overall project structure
                if (!loadedProject || typeof loadedProject !== 'object') {
                    throw new Error('Invalid project structure');
                }

                // Validate animations object
                if (!loadedProject.animations || typeof loadedProject.animations !== 'object') {
                    throw new Error('Project must contain animations object');
                }

                if (Object.keys(loadedProject.animations).length === 0) {
                    throw new Error('Project must contain at least one animation');
                }

                // Clean and validate animations
                const loadedAnimations = Object.fromEntries(
                    Object.entries(loadedProject.animations).map(([name, animation]) => {
                        // Validate animation name
                        if (!name || typeof name !== 'string') {
                            throw new Error(`Invalid animation name: ${name}`);
                        }

                        // Validate and clean animation object
                        if (!animation || typeof animation !== 'object') {
                            throw new Error(`Invalid animation data for: ${name}`);
                        }

                        // Validate frames
                        if (!Array.isArray(animation.frames)) {
                            throw new Error(`Animation "${name}" must have frames array`);
                        }

                        // Validate each frame's structure
                        const validatedFrames = animation.frames.map((frame, index) => {
                            if (!frame || typeof frame !== 'object') {
                                throw new Error(`Invalid frame object in animation "${name}" at position ${index}`);
                            }

                            // Validate grid
                            if (!Array.isArray(frame.grid)) {
                                throw new Error(`Missing grid data in animation "${name}" frame ${index}`);
                            }

                            // Validate grid dimensions and content
                            const height = frame.grid.length;
                            const width = frame.grid[0]?.length;

                            if (!height || !width) {
                                throw new Error(`Empty grid in animation "${name}" frame ${index}`);
                            }

                            // Validate each row has same width and contains only valid values (0, 1, or 2)
                            frame.grid.forEach((row, rowIndex) => {
                                if (!Array.isArray(row) || row.length !== width) {
                                    throw new Error(`Invalid grid row ${rowIndex} in animation "${name}" frame ${index}`);
                                }
                                if (!row.every(cell => [0, 1, 2].includes(cell))) {
                                    throw new Error(`Invalid grid values in animation "${name}" frame ${index} row ${rowIndex}`);
                                }
                            });

                            // Validate line colors
                            if (!Array.isArray(frame.lineColors1) || !Array.isArray(frame.lineColors2)) {
                                throw new Error(`Missing line colors in animation "${name}" frame ${index}`);
                            }

                            if (frame.lineColors1.length !== height || frame.lineColors2.length !== height) {
                                throw new Error(`Line colors length mismatch in animation "${name}" frame ${index}`);
                            }

                            // Return validated frame
                            return {
                                grid: frame.grid,
                                lineColors1: frame.lineColors1,
                                lineColors2: frame.lineColors2
                            };
                        });

                        // Validate and clean speed
                        let speed = Number(animation.speed);
                        if (isNaN(speed) || speed <= 0) {
                            speed = 30; // Default speed
                        }
                        speed = Math.min(Math.max(speed, 1), 120); // Clamp between 1 and 120

                        return [
                            name,
                            {
                                frames: validatedFrames,
                                speed
                            }
                        ];
                    })
                );

                // Clean character name
                const characterName = typeof loadedProject.characterName === 'string'
                    ? loadedProject.characterName.trim()
                    : 'Untitled Character';

                // Update state only after all validations pass
                setSpriteHeight(loadedProject.spriteHeight)
                setAnimations(loadedAnimations);
                setCurrentAnimation(Object.keys(loadedAnimations)[0]);
                setCurrentFrame(0);
                setCharacterName(characterName);

            } catch (error) {
                alert(`Error loading project: ${error.message}`);
            }
        };

        reader.readAsText(file);
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
                            if (cell === 1) {
                                const colorCode = frame.lineColors1[y];
                                const colorHex = colorPaletteData.palette.find(c => c.code === colorCode)?.color || '#000000';
                                ctx.fillStyle = colorHex;
                                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                            }
                            else if (cell === 2) {
                                const colorCode = frame.lineColors2[y];
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
                        if (cell === 1) {
                            const colorCode = frame.lineColors1[y];
                            const colorHex = colorPaletteData.palette.find(c => c.code === colorCode)?.color || '#000000';
                            ctx.fillStyle = colorHex;
                            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                        }
                        else if (cell === 2) {
                            const colorCode = frame.lineColors2[y];
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
                <LineColorSelector
                    lineColors={animations[currentAnimation]?.frames[currentFrame]?.lineColors1}
                    onLineColorChange={handleLineColorChange}
                    lineNumber={1}
                    getColorHex={getColorHex}
                />
                <LineColorSelector
                    lineColors={animations[currentAnimation]?.frames[currentFrame]?.lineColors2}
                    onLineColorChange={handleLineColorChange}
                    lineNumber={2}
                    getColorHex={getColorHex}
                />
                <div className="border border-gray-300 inline-block bg-white">
                    {animations[currentAnimation] && animations[currentAnimation].frames[currentFrame] &&
                        animations[currentAnimation].frames[currentFrame].grid.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex">
                                {row.map((cell, colIndex) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className="w-8 h-6 border border-gray-200 cursor-pointer"
                                        style={{
                                            //TODO: what is this control?
                                            backgroundColor: cell === 1 ?
                                                getColorHex(animations[currentAnimation].frames[currentFrame].lineColors1[rowIndex]) :
                                                cell === 2 ?
                                                    getColorHex(animations[currentAnimation].frames[currentFrame].lineColors2[rowIndex]) :
                                                    'transparent',
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
            <div className="flex items-center space-x-2 mb-4">
                <Atari2600CodeExporter
                    animations={animations}
                    characterName={characterName}
                    spriteHeight={spriteHeight}
                    withColor={true} />
                <Atari2600CodeExporter
                    animations={animations}
                    characterName={characterName}
                    spriteHeight={spriteHeight}
                    withColor={false} />
            </div>
        </div>
    );
};

export default SpriteAnimationEditor;