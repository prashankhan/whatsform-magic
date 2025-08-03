import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadFieldProps {
  fieldId: string;
  value?: File;
  onChange: (fieldId: string, file: File | null) => void;
  required?: boolean;
  error?: string;
}

const FileUploadField = ({ fieldId, value, onChange, required, error }: FileUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Upload file to Supabase Storage (works for both authenticated and public users)
      const fileExt = file.name.split('.').pop();
      const fileName = `public/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('form-uploads')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setUploadError('Failed to upload file. Please try again.');
        return;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('form-uploads')
        .getPublicUrl(fileName);

      // Create a file reference with the storage path and public URL
      const fileWithPath = Object.assign(file, { 
        storagePath: fileName,
        publicUrl: publicUrl
      });
      onChange(fieldId, fileWithPath);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [fieldId, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = () => {
    onChange(fieldId, null);
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      {!value ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-[var(--file-upload-border-color,hsl(var(--primary)))] bg-[var(--file-upload-background-color,hsl(var(--primary)/0.05))]' 
              : 'border-[var(--file-upload-border-color,hsl(var(--muted-foreground)/0.25))] hover:border-[var(--file-upload-border-color,hsl(var(--primary)))] hover:bg-[var(--file-upload-background-color,hsl(var(--primary)/0.05))]'
          } ${error ? 'border-destructive' : ''}`}
          style={{
            backgroundColor: isDragActive 
              ? 'var(--file-upload-background-color, hsl(var(--primary) / 0.05))'
              : undefined
          }}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--file-upload-placeholder-color, hsl(var(--muted-foreground)))' }} />
          {uploading ? (
            <p className="text-sm" style={{ color: 'var(--file-upload-placeholder-color, hsl(var(--muted-foreground)))' }}>Uploading...</p>
          ) : isDragActive ? (
            <p className="text-sm" style={{ color: 'var(--file-upload-border-color, hsl(var(--primary)))' }}>Drop the file here</p>
          ) : (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--file-upload-placeholder-color, hsl(var(--muted-foreground)))' }}>
                Drag & drop a file here, or click to select
              </p>
              <p className="text-xs" style={{ color: 'var(--file-upload-placeholder-color, hsl(var(--muted-foreground)))' }}>
                Supports PDF, DOC, DOCX, images, and text files (max 10MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {(error || uploadError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUploadField;