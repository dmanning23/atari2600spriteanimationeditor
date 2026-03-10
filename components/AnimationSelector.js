import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const AnimationSelector = ({
    animations,
    currentAnimation,
    onAnimationChange,
    onAddAnimation,
    onDeleteAnimation
}) => {
    const [newAnimationName, setNewAnimationName] = useState('');

    const handleAddAnimation = () => {
        if (newAnimationName && !animations[newAnimationName]) {
            onAddAnimation(newAnimationName);
            setNewAnimationName('');
        }
    };

    return (
        <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Animations</p>
            <div className="flex items-center gap-2 flex-wrap">
                <Select value={currentAnimation} onValueChange={onAnimationChange}>
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
                    className="w-48"
                />

                <Button onClick={handleAddAnimation}>Add</Button>
                <Button
                    variant="outline"
                    onClick={onDeleteAnimation}
                    disabled={Object.keys(animations).length <= 1}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default AnimationSelector;