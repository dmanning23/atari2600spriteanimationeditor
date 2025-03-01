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
        <div className="flex items-center space-x-2 mb-4">
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
            />

            <Button onClick={handleAddAnimation}>Add Animation</Button>

            <Button
                onClick={onDeleteAnimation}
                disabled={Object.keys(animations).length <= 1}
            >
                Delete Animation
            </Button>
        </div>
    );
};

export default AnimationSelector;