import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorInputProps {
  id: string;
  label: string;
  value?: string;
  defaultValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  description?: string;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  id,
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
  description
}) => {
  const currentValue = value || defaultValue;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center space-x-3">
        <input
          id={id}
          type="color"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          className={`w-12 h-8 rounded border cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          disabled={disabled}
        />
        <Input
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultValue}
          className="flex-1"
          disabled={disabled}
        />
      </div>
    </div>
  );
};