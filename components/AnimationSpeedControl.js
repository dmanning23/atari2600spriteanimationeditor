import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

const AnimationSpeedControl = ({ speed, onChange }) => {
    return (
        <div className="flex items-center space-x-2 mb-4">
            <span>Animation Speed (1/60th second delay):</span>
            <Slider
                min={0}
                max={255}
                step={1}
                value={[speed]}
                onValueChange={(value) => onChange(value[0])}
                className="w-64"
            />
            <Input
                type="number"
                min={0}
                max={255}
                value={speed}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-16"
            />
        </div>
    );
};

export default AnimationSpeedControl;