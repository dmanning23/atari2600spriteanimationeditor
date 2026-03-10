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
        <div className="bg-card rounded border border-border panel-glow p-4 mb-4">
            <div className="flex items-center justify-between gap-6 flex-wrap">
                <h1 className="pixel-font title-glow text-primary whitespace-nowrap" style={{ fontSize: '11px', lineHeight: '1.6' }}>
                    Atari 2600<br />Sprite Editor
                </h1>

                <Input
                    id="character-name"
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Character name"
                    className="w-48"
                />

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={triggerFileInput}>Load</Button>
                    <Button variant="outline" onClick={onSaveProject}>Save</Button>
                    <input
                        type="file"
                        accept=".json"
                        onChange={onLoadProject}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
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

                <div className="flex items-center gap-4">
                    <ModeSelector mode={spriteMode} onModeChange={onModeChange} />
                    <SpriteHeightControl height={spriteHeight} onHeightChange={onSpriteHeightChange} />
                </div>
            </div>
        </div>
    );
};

export default HeaderControls;