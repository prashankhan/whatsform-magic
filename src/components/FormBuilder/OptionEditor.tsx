import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FormOption } from '@/lib/whatsapp';
import { Trash2, Plus } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface OptionEditorProps {
  options: FormOption[];
  onChange: (options: FormOption[]) => void;
  fieldType: 'multiple-choice' | 'checkbox';
}

const OptionEditor = ({ options, onChange, fieldType }: OptionEditorProps) => {
  const addOption = () => {
    onChange([...options, { text: '' }]);
  };

  const updateOption = (index: number, updates: Partial<FormOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          Options
          {fieldType === 'checkbox' && (
            <span className="text-sm text-muted-foreground ml-2">
              - Users can select multiple
            </span>
          )}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>

      {options.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No options added yet. Click "Add Option" to get started.
        </div>
      )}

      {options.map((option, index) => (
        <Card key={index} className="p-4">
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor={`option-text-${index}`} className="text-sm">
                  Option {index + 1} Text
                </Label>
                <Input
                  id={`option-text-${index}`}
                  value={option.text}
                  onChange={(e) => updateOption(index, { text: e.target.value })}
                  placeholder={`Option ${index + 1}`}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                className="text-destructive hover:text-destructive mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Option Image Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`show-option-image-${index}`}>Add option image</Label>
              <Switch
                id={`show-option-image-${index}`}
                checked={!!option.showImageUpload}
                onCheckedChange={(checked) => updateOption(index, { 
                  showImageUpload: checked,
                  image: checked ? option.image : undefined
                })}
              />
            </div>

            {/* Option Image Upload */}
            {option.showImageUpload && (
              <ImageUpload
                value={option.image}
                onChange={(imageUrl) => updateOption(index, { image: imageUrl })}
                label={`Option ${index + 1} Image`}
              />
            )}
          </CardContent>
        </Card>
      ))}

      {options.length === 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Option
        </Button>
      )}
    </div>
  );
};

export default OptionEditor;