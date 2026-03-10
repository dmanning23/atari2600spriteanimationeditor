import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ModeSelector = ({ mode, onModeChange }) => {
    const modes = [
        { id: 'doubleColor', label: 'Double Color (P0, P1)' },
        { id: 'doubleWidth', label: 'Double Width (16px)' }
    ];

    return (
        <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Mode:</span>
            <Select value={mode} onValueChange={onModeChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                    {modes.map((modeOption) => (
                        <SelectItem key={modeOption.id} value={modeOption.id}>
                            {modeOption.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ModeSelector;