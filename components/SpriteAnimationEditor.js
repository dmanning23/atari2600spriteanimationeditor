'use client';

import React, { useState, useCallback } from 'react';
import colorPaletteData from '../data/desaturated-color-palette.json';

// Import modular components - using relative paths
import HeaderControls from './HeaderControls';
import AnimationSelector from './AnimationSelector';
import FrameControls from './FrameControls';
import ColorControls from './ColorControls';
import GridEditor from './GridEditor';
import PreviewCanvas from './PreviewCanvas';

const DEFAULT_GRID_HEIGHT = 16;

const SpriteAnimationEditor = () => {
    const [characterName, setCharacterName] = useState('');
    const [spriteMode, setSpriteMode] = useState('doubleColor');
    const [spriteHeight, setSpriteHeight] = useState(DEFAULT_GRID_HEIGHT);
    const [animations, setAnimations] = useState({
        'Default': {
            frames: [{
                grid: Array(spriteHeight).fill().map(() => Array(getGridWidth()).fill(0)),
                lineColors1: Array(spriteHeight).fill('$0E'),
                lineColors2: Array(spriteHeight).fill('$0E')
            }],
            speed: 30
        }
    });
    const [currentAnimation, setCurrentAnimation] = useState('Default');
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentColor, setCurrentColor] = useState('$0E'); // Default to white
    const [copiedFrame, setCopiedFrame] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [previewBgColor, setPreviewBgColor] = useState('#000000');

    // Function to determine grid width based on mode
    function getGridWidth() {
        return spriteMode === 'doubleWidth' ? 16 : 8;
    }

    // Callback functions for grid editing
    const handleCellClick = useCallback((row, col) => {
        // Use functional update to ensure we're working with the latest state
        setAnimations(prevAnimations => {
            // Create a deep copy of the current frame to work with
            const currentFrameCopy = JSON.parse(
                JSON.stringify(prevAnimations[currentAnimation].frames[currentFrame])
            );

            // Get the current cell value before making changes
            const currentCellValue = currentFrameCopy.grid[row][col];

            // Create a copy of the entire animations object to maintain immutability
            const newAnimations = { ...prevAnimations };
            newAnimations[currentAnimation] = {
                ...newAnimations[currentAnimation],
                frames: [...newAnimations[currentAnimation].frames]
            };

            // Clone the specific frame we're modifying
            newAnimations[currentAnimation].frames[currentFrame] = {
                ...newAnimations[currentAnimation].frames[currentFrame],
                grid: [...newAnimations[currentAnimation].frames[currentFrame].grid]
            };

            // Create a fresh copy of the row we're modifying
            newAnimations[currentAnimation].frames[currentFrame].grid[row] =
                [...newAnimations[currentAnimation].frames[currentFrame].grid[row]];

            // Modify the cell value based on mode and current value
            if (spriteMode === 'doubleColor') {
                // In double color mode, cycle through 0->1->2->0
                // Use a deterministic approach based on the current value
                if (currentCellValue === 0) {
                    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] = 1;
                }
                else if (currentCellValue === 1) {
                    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] = 2;
                }
                else {
                    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] = 0;
                }
            } else if (spriteMode === 'doubleWidth') {
                // In double width mode, toggle between 0 and 1
                newAnimations[currentAnimation].frames[currentFrame].grid[row][col] =
                    currentCellValue === 0 ? 1 : 0;
            }

            return newAnimations;
        });
    }, [currentAnimation, currentFrame, spriteMode]);

    const handleLineColorChange = useCallback((row, lineNumber) => {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            const frame = { ...newAnimations[currentAnimation].frames[currentFrame] };
            if (lineNumber === 1) {
                frame.lineColors1 = [...frame.lineColors1];
                frame.lineColors1[row] = currentColor;
            }
            else if (spriteMode === 'doubleColor') {
                frame.lineColors2 = [...frame.lineColors2];
                frame.lineColors2[row] = currentColor;
            }
            newAnimations[currentAnimation].frames[currentFrame] = frame;
            return newAnimations;
        });
    }, [currentAnimation, currentFrame, currentColor, spriteMode]);

    // Add the horizontal flip function
    const handleFlipHorizontal = useCallback(() => {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };

            // Create a deep copy of the current frame
            const frameToFlip = JSON.parse(
                JSON.stringify(newAnimations[currentAnimation].frames[currentFrame])
            );

            // Flip each row in the grid
            frameToFlip.grid = frameToFlip.grid.map(row => [...row].reverse());

            // Update the frame in the animations object
            newAnimations[currentAnimation].frames[currentFrame] = frameToFlip;

            return newAnimations;
        });
    }, [currentAnimation, currentFrame]);

    // Callbacks for header controls
    const handleSpriteHeightChange = useCallback((newHeight) => {
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
                        frame.grid.push(Array(getGridWidth()).fill(0));
                        frame.lineColors1.push('$0E');
                        frame.lineColors2.push('$0E');
                    });
                }
            });
            return newAnimations;
        });
    }, [getGridWidth]);

    const handleModeChange = useCallback((newMode) => {
        setSpriteMode(newMode);

        // If changing from doubleColor to doubleWidth
        if (spriteMode === 'doubleColor' && newMode === 'doubleWidth') {
            // Convert existing animations to double width format
            setAnimations(prevAnimations => {
                const newAnimations = { ...prevAnimations };

                Object.keys(newAnimations).forEach(animName => {
                    newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                        // Create a new grid with width 16
                        const newGrid = Array(frame.grid.length).fill().map((_, rowIndex) => {
                            const oldRow = frame.grid[rowIndex];
                            // Extend each row to 16 cells, initialized with 0
                            return [...oldRow, ...Array(8).fill(0)];
                        });

                        // In the conversion, we'll treat color1 and color2 as filled positions
                        // but only use color1 in the new format
                        for (let i = 0; i < frame.grid.length; i++) {
                            for (let j = 0; j < 8; j++) {
                                if (frame.grid[i][j] === 2) { // If was color2
                                    newGrid[i][j] = 1; // Convert to filled in doubleWidth
                                }
                            }
                        }

                        return {
                            grid: newGrid,
                            lineColors1: [...frame.lineColors1], // Keep color1
                            lineColors2: [...frame.lineColors2]  // Keep color2 for potential conversion back
                        };
                    });
                });

                return newAnimations;
            });
        }
        // If changing from doubleWidth to doubleColor
        else if (spriteMode === 'doubleWidth' && newMode === 'doubleColor') {
            // Convert existing animations back to double color format
            setAnimations(prevAnimations => {
                const newAnimations = { ...prevAnimations };

                Object.keys(newAnimations).forEach(animName => {
                    newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                        // Create a new grid with width 8
                        const newGrid = Array(frame.grid.length).fill().map((_, rowIndex) => {
                            // Keep only the first 8 cells from each row
                            return frame.grid[rowIndex].slice(0, 8);
                        });

                        return {
                            grid: newGrid,
                            lineColors1: [...frame.lineColors1],
                            lineColors2: [...frame.lineColors2]
                        };
                    });
                });

                return newAnimations;
            });
        }
    }, [spriteMode]);

    // Callbacks for animation selector
    const handleAnimationChange = useCallback((newAnimation) => {
        setCurrentAnimation(newAnimation);
        setCurrentFrame(0);
        setIsPlaying(false);
    }, []);

    const handleAddAnimation = useCallback((newAnimationName) => {
        setAnimations(prevAnimations => ({
            ...prevAnimations,
            [newAnimationName]: {
                frames: [{
                    grid: Array(spriteHeight).fill().map(() => Array(getGridWidth()).fill(0)),
                    lineColors1: Array(spriteHeight).fill('$0E'),
                    lineColors2: Array(spriteHeight).fill('$0E'),
                }],
                speed: 30
            }
        }));
        setCurrentAnimation(newAnimationName);
        setCurrentFrame(0);
    }, [spriteHeight, getGridWidth]);

    const handleDeleteAnimation = useCallback(() => {
        if (Object.keys(animations).length > 1) {
            setAnimations(prevAnimations => {
                const newAnimations = { ...prevAnimations };
                delete newAnimations[currentAnimation];
                return newAnimations;
            });
            setCurrentAnimation(Object.keys(animations).filter(name => name !== currentAnimation)[0]);
            setCurrentFrame(0);
        }
    }, [animations, currentAnimation]);

    const handleAddFrame = useCallback(() => {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };

            // Add the new frame
            newAnimations[currentAnimation].frames = [
                ...newAnimations[currentAnimation].frames,
                {
                    grid: Array(spriteHeight).fill().map(() => Array(getGridWidth()).fill(0)),
                    lineColors1: Array(spriteHeight).fill('$0E'),
                    lineColors2: Array(spriteHeight).fill('$0E'),
                }
            ];

            return newAnimations;
        });
        setCurrentFrame(animations[currentAnimation].frames.length);
    }, [currentAnimation, spriteHeight, getGridWidth, animations]);

    const handleDeleteFrame = useCallback(() => {
        if (animations[currentAnimation].frames.length > 1) {
            setAnimations(prevAnimations => {
                const newAnimations = { ...prevAnimations };
                newAnimations[currentAnimation].frames = newAnimations[currentAnimation].frames.filter((_, index) => index !== currentFrame);
                return newAnimations;
            });
            setCurrentFrame(prev => Math.min(prev, animations[currentAnimation].frames.length - 2));
        }
    }, [animations, currentAnimation, currentFrame]);

    const handleCopyFrame = useCallback(() => {
        setCopiedFrame(JSON.parse(JSON.stringify(animations[currentAnimation].frames[currentFrame])));
    }, [animations, currentAnimation, currentFrame]);

    const handlePasteFrame = useCallback(() => {
        if (copiedFrame) {
            setAnimations(prevAnimations => {
                const newAnimations = { ...prevAnimations };
                // If pasting from a different mode, need to adjust the frame
                if (copiedFrame.grid[0].length !== getGridWidth()) {
                    const adjustedFrame = { ...copiedFrame };
                    if (spriteMode === 'doubleWidth') {
                        // Extend grid to 16 columns
                        adjustedFrame.grid = adjustedFrame.grid.map(row => [...row, ...Array(8).fill(0)]);
                    } else {
                        // Trim grid to 8 columns
                        adjustedFrame.grid = adjustedFrame.grid.map(row => row.slice(0, 8));
                    }
                    newAnimations[currentAnimation].frames[currentFrame] = adjustedFrame;
                } else {
                    newAnimations[currentAnimation].frames[currentFrame] = JSON.parse(JSON.stringify(copiedFrame));
                }
                return newAnimations;
            });
        }
    }, [copiedFrame, currentAnimation, currentFrame, spriteMode, getGridWidth]);

    const handlePreviousFrame = useCallback(() => {
        setCurrentFrame(prev => Math.max(0, prev - 1));
    }, []);

    const handleNextFrame = useCallback(() => {
        setCurrentFrame(prev => Math.min(animations[currentAnimation].frames.length - 1, prev + 1));
    }, [animations, currentAnimation]);

    const handleSpeedChange = useCallback((newSpeed) => {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            newAnimations[currentAnimation].speed = newSpeed;
            return newAnimations;
        });
    }, [currentAnimation]);

    // Project saving and loading
    const saveProject = useCallback(() => {
        const projectData = {
            characterName: characterName,
            spriteHeight: spriteHeight,
            spriteMode: spriteMode,
            animations: animations
        };
        const data = JSON.stringify(projectData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${characterName || 'sprite'}_project.json`;
        link.click();
        URL.revokeObjectURL(url);
    }, [characterName, spriteHeight, spriteMode, animations]);

    const loadProject = useCallback((event) => {
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

                            // For double color mode validate values are 0, 1, or 2
                            // For double width mode validate values are 0 or 1
                            const validValues = loadedProject.spriteMode === 'doubleWidth' ? [0, 1] : [0, 1, 2];

                            // Validate each row has same width and contains only valid values
                            frame.grid.forEach((row, rowIndex) => {
                                if (!Array.isArray(row) || row.length !== width) {
                                    throw new Error(`Invalid grid row ${rowIndex} in animation "${name}" frame ${index}`);
                                }

                                if (!row.every(cell => validValues.includes(cell))) {
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

                // Set sprite mode (default to doubleColor if not specified in project)
                const spriteMode = loadedProject.spriteMode === 'doubleWidth' ? 'doubleWidth' : 'doubleColor';

                // Update state only after all validations pass
                setSpriteHeight(loadedProject.spriteHeight);
                setSpriteMode(spriteMode);
                setAnimations(loadedAnimations);
                setCurrentAnimation(Object.keys(loadedAnimations)[0]);
                setCurrentFrame(0);
                setCharacterName(characterName);

            } catch (error) {
                alert(`Error loading project: ${error.message}`);
            }
        };

        reader.readAsText(file);
    }, []);

    const toggleAnimation = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const getColorHex = useCallback((code) => {
        const colorObj = colorPaletteData.palette.find(c => c.code === code);
        return colorObj ? colorObj.color : 'transparent';
    }, []);

    return (
        <div className="min-h-screen bg-background p-6">

            <HeaderControls
                characterName={characterName}
                setCharacterName={setCharacterName}
                spriteMode={spriteMode}
                onModeChange={handleModeChange}
                spriteHeight={spriteHeight}
                onSpriteHeightChange={handleSpriteHeightChange}
                onSaveProject={saveProject}
                onLoadProject={loadProject}
                animations={animations}
            />

            <div className="bg-card rounded border border-border panel-glow p-4">
                <div className="flex gap-6">
                    <ColorControls
                        currentFrame={currentFrame}
                        currentAnimation={currentAnimation}
                        animations={animations}
                        currentColor={currentColor}
                        onColorSelect={setCurrentColor}
                        onLineColorChange={handleLineColorChange}
                        getColorHex={getColorHex}
                        spriteMode={spriteMode}
                    />

                    <GridEditor
                        currentFrame={currentFrame}
                        currentAnimation={currentAnimation}
                        animations={animations}
                        getColorHex={getColorHex}
                        onCellClick={handleCellClick}
                    />

                    <PreviewCanvas
                        animations={animations}
                        currentAnimation={currentAnimation}
                        currentFrame={currentFrame}
                        spriteMode={spriteMode}
                        spriteHeight={spriteHeight}
                        isPlaying={isPlaying}
                        toggleAnimation={toggleAnimation}
                        getColorHex={getColorHex}
                        previewBgColor={previewBgColor}
                        setPreviewBgColor={setPreviewBgColor}
                    />
                </div>
            </div>

            <div className="bg-card rounded border border-border panel-glow p-4 mt-4">
                <AnimationSelector
                    animations={animations}
                    currentAnimation={currentAnimation}
                    onAnimationChange={handleAnimationChange}
                    onAddAnimation={handleAddAnimation}
                    onDeleteAnimation={handleDeleteAnimation}
                />

                <FrameControls
                    currentFrame={currentFrame}
                    totalFrames={animations[currentAnimation]?.frames.length || 0}
                    onAddFrame={handleAddFrame}
                    onDeleteFrame={handleDeleteFrame}
                    onCopyFrame={handleCopyFrame}
                    onPasteFrame={handlePasteFrame}
                    onPreviousFrame={handlePreviousFrame}
                    onNextFrame={handleNextFrame}
                    copiedFrame={copiedFrame}
                    animationSpeed={animations[currentAnimation]?.speed || 30}
                    onSpeedChange={handleSpeedChange}
                    onFlipHorizontal={handleFlipHorizontal}
                />
            </div>
        </div>
    );
};

export default SpriteAnimationEditor;