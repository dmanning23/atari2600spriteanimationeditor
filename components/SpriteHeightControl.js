import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SpriteHeightControl = ({ height, onHeightChange }) => {
    const possibleHeights = [4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24];

    return (
        <div className="flex items-center space-x-2 mb-4">
            <span>Sprite Height:</span>
            <Select value={height.toString()} onValueChange={(value) => onHeightChange(Number(value))}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Height" />
                </SelectTrigger>
                <SelectContent>
                    {possibleHeights.map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                            {h}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SpriteHeightControl;