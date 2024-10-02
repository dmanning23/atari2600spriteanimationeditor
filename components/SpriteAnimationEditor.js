'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const GRID_WIDTH = 8;
const GRID_HEIGHT = 16;
const PIXEL_ASPECT_RATIO = 1.33; // Horizontal to vertical ratio for Atari 2600 pixels
const ATARI_REFRESH_RATE = 60; // 60 Hz

const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Grey', hex: '#7C7C7C' },
    { name: 'Yellow', hex: '#BCBC00' },
    { name: 'Orange', hex: '#AC7C00' },
    { name: 'Red-Orange', hex: '#AC5400' },
    { name: 'Brown', hex: '#843800' },
    { name: 'Red', hex: '#AC0000' },
    { name: 'Dark Green', hex: '#005400' },
    { name: 'Green', hex: '#0C5C00' },
    { name: 'Blue-Green', hex: '#006C00' },
    { name: 'Blue', hex: '#00388C' },
    { name: 'Light Blue', hex: '#0070EC' },
    { name: 'Blue-Violet', hex: '#2C0084' },
    { name: 'Violet', hex: '#8C00AC' },
    { name: 'Purple', hex: '#AC00AC' },
];

const SpriteAnimationEditor = () => {
    const [animations, setAnimations] = useState({
        'Default': [{
            grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false)),
            lineColors: Array(GRID_HEIGHT).fill(0)
        }]
    });
    const [currentAnimation, setCurrentAnimation] = useState('Default');
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentColor, setCurrentColor] = useState(1);
    const [copiedFrame, setCopiedFrame] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [newAnimationName, setNewAnimationName] = useState('');
    const [animationSpeed, setAnimationSpeed] = useState(30); // Default to 0.5 seconds between frames
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const handleCellClick = (row, col) => {
        const newAnimations = { ...animations };
        const frame = { ...newAnimations[currentAnimation][currentFrame] };
        frame.grid = [...frame.grid];
        frame.grid[row] = [...frame.grid[row]];
        frame.grid[row][col] = !frame.grid[row][col];

        if (frame.grid[row][col] && frame.lineColors[row] === 0) {
            frame.lineColors = [...frame.lineColors];
            frame.lineColors[row] = currentColor;
        }

        newAnimations[currentAnimation][currentFrame] = frame;
        setAnimations(newAnimations);
    };

    const handleLineColorChange = (row) => {
        const newAnimations = { ...animations };
        const frame = { ...newAnimations[currentAnimation][currentFrame] };
        frame.lineColors = [...frame.lineColors];
        frame.lineColors[row] = currentColor;
        newAnimations[currentAnimation][currentFrame] = frame;
        setAnimations(newAnimations);
    };

    const addFrame = () => {
        const newAnimations = { ...animations };
        newAnimations[currentAnimation] = [
            ...newAnimations[currentAnimation],
            {
                grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false)),
                lineColors: Array(GRID_HEIGHT).fill(0)
            }
        ];
        setAnimations(newAnimations);
        setCurrentFrame(newAnimations[currentAnimation].length - 1);
    };

    const deleteFrame = () => {
        if (animations[currentAnimation].length > 1) {
            const newAnimations = { ...animations };
            newAnimations[currentAnimation] = newAnimations[currentAnimation].filter((_, index) => index !== currentFrame);
            setAnimations(newAnimations);
            setCurrentFrame(Math.min(currentFrame, newAnimations[currentAnimation].length - 1));
        }
    };

    const copyFrame = () => {
        setCopiedFrame(JSON.parse(JSON.stringify(animations[currentAnimation][currentFrame])));
    };

    const pasteFrame = () => {
        if (copiedFrame) {
            const newAnimations = { ...animations };
            newAnimations[currentAnimation][currentFrame] = JSON.parse(JSON.stringify(copiedFrame));
            setAnimations(newAnimations);
        }
    };

    const addAnimation = () => {
        if (newAnimationName && !animations[newAnimationName]) {
            setAnimations({
                ...animations,
                [newAnimationName]: [{
                    grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false)),
                    lineColors: Array(GRID_HEIGHT).fill(0)
                }]
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

    const saveProject = () => {
        const projectData = {
            animations: animations,
            animationSpeed: animationSpeed
        };
        const data = JSON.stringify(projectData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sprite_project.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const loadProject = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedProject = JSON.parse(e.target.result);
                    if (typeof loadedProject.animations === 'object' && Object.keys(loadedProject.animations).length > 0) {
                        setAnimations(loadedProject.animations);
                        setCurrentAnimation(Object.keys(loadedProject.animations)[0]);
                        setCurrentFrame(0);
                        if (typeof loadedProject.animationSpeed === 'number') {
                            setAnimationSpeed(loadedProject.animationSpeed);
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

    const handleAnimationChange = (newAnimation) => {
        setCurrentAnimation(newAnimation);
        setCurrentFrame(0);  // Reset to the first frame when changing animations
        setIsPlaying(false);  // Stop the animation when switching
    };

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cellWidth = 20 * PIXEL_ASPECT_RATIO;
        const cellHeight = 20;
        canvas.width = GRID_WIDTH * cellWidth;
        canvas.height = GRID_HEIGHT * cellHeight;

        let frameIndex = 0;
        let lastFrameTime = 0;
        const frameDuration = (animationSpeed / ATARI_REFRESH_RATE) * 1000; // Convert to milliseconds

        const animate = (currentTime) => {
            if (currentTime - lastFrameTime >= frameDuration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const frame = animations[currentAnimation][frameIndex];
                frame.grid.forEach((row, y) => {
                    row.forEach((cell, x) => {
                        if (cell) {
                            ctx.fillStyle = COLORS[frame.lineColors[y]].hex;
                            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                        }
                    });
                });
                frameIndex = (frameIndex + 1) % animations[currentAnimation].length;
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
            const frame = animations[currentAnimation][currentFrame];
            frame.grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        ctx.fillStyle = COLORS[frame.lineColors[y]].hex;
                        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                    }
                });
            });
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, animations, currentAnimation, animationSpeed, currentFrame]);

    return (
        <div className="p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Atari 2600 Sprite Animation Editor</h1>
            <div className="mb-4 grid grid-cols-8 gap-2">
                {COLORS.map((color, index) => (
                    <Button
                        key={color.name}
                        className={`w-12 h-9 ${currentColor === index ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setCurrentColor(index)}
                        title={color.name}
                    />
                ))}
            </div>
            <div className="flex mb-4">
                <div className="mr-2">
                    {animations[currentAnimation][currentFrame].lineColors.map((color, index) => (
                        <div
                            key={index}
                            className="w-8 h-6 border border-gray-300 cursor-pointer mb-[1px]"
                            style={{ backgroundColor: color !== undefined ? COLORS[color].hex : 'transparent' }}
                            onClick={() => handleLineColorChange(index)}
                            title={color !== undefined ? COLORS[color].name : 'No color'}
                        />
                    ))}
                </div>
                <div className="border border-gray-300 inline-block bg-white">
                    {animations[currentAnimation][currentFrame].grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className="w-8 h-6 border border-gray-200 cursor-pointer"
                                    style={{
                                        backgroundColor: cell && animations[currentAnimation][currentFrame].lineColors[rowIndex] !== undefined ?
                                            COLORS[animations[currentAnimation][currentFrame].lineColors[rowIndex]].hex : 'transparent',
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
                <Button onClick={deleteFrame} disabled={animations[currentAnimation].length === 1}>Delete Frame</Button>
                <Button onClick={copyFrame}>Copy Frame</Button>
                <Button onClick={pasteFrame} disabled={!copiedFrame}>Paste Frame</Button>
                <span className="ml-4">
                    Frame: {currentFrame + 1} of {animations[currentAnimation].length}
                </span>
                <Button onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))} disabled={currentFrame === 0}>Previous</Button>
                <Button onClick={() => setCurrentFrame(Math.min(animations[currentAnimation].length - 1, currentFrame + 1))} disabled={currentFrame === animations[currentAnimation].length - 1}>Next</Button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <span>Animation Speed (1/60th second delay):</span>
                <Slider
                    min={0}
                    max={255}
                    step={1}
                    value={[animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                    className="w-64"
                />
                <Input
                    type="number"
                    min={0}
                    max={255}
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="w-16"
                />
            </div>
            <div className="flex items-center space-x-2">
                <Button onClick={saveProject}>Save Project</Button>
                <input
                    type="file"
                    accept=".json"
                    onChange={loadProject}
                    style={{ display: 'none' }}
                    id="load-project"
                />
                <label htmlFor="load-project">
                    <Button as="span">Load Project</Button>
                </label>
            </div>
        </div>
    );
};

export default SpriteAnimationEditor;