import React, { useRef } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import SpriteHeightControl from './SpriteHeightControl';
import ModeSelector from './ModeSelector';
import Atari2600CodeExporter from './Atari2600CodeExporter';

const HeaderControls = ({
    characterName,
    setCharacterName,
    spriteMode,
    onModeChange,
    spriteHeight,
    onSpriteHeightChange,
    onSaveProject,
    onLoadProject,
    animations
}) => {
    const fileInputRef = useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="mb-4 space-y-4">
            <h1 className="text-2xl font-bold">Atari 2600 Sprite Animation Editor</h1>

            <div>
                <label htmlFor="character-name" className="block text-sm font-medium text-gray-700">
                    Character Name
                </label>
                <Input
                    id="character-name"
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter character name"
                    className="mt-1"
                />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                    <Button onClick={triggerFileInput}>Load Project</Button>

                    <Button onClick={onSaveProject}>Save Project</Button>
                    <input
                        type="file"
                        accept=".json"
                        onChange={onLoadProject}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />

                    {/* Export buttons */}
                    <Atari2600CodeExporter
                        animations={animations}
                        characterName={characterName}
                        spriteHeight={spriteHeight}
                        mode={spriteMode}
                        withColor={true}
                    />
                    <Atari2600CodeExporter
                        animations={animations}
                        characterName={characterName}
                        spriteHeight={spriteHeight}
                        mode={spriteMode}
                        withColor={false}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <ModeSelector mode={spriteMode} onModeChange={onModeChange} />
                    <SpriteHeightControl height={spriteHeight} onHeightChange={onSpriteHeightChange} />
                </div>
            </div>
        </div>
    );
};

export default HeaderControls;