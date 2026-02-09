'use client';

import { useState, useRef, useCallback } from 'react';
import { Loader2, Camera, X } from 'lucide-react';

interface AvatarUploadProps {
  currentImage?: string | null;
  userName: string;
  onUploadComplete?: (imageUrl: string) => void;
  onRemove?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function AvatarUpload({
  currentImage,
  userName,
  onUploadComplete,
  onRemove
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a JPEG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Success - notify parent and refresh
      onUploadComplete?.(data.imageUrl);
      setPreview(null);

      // Force reload to refresh session with new image
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const handleCancel = useCallback(() => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemove = useCallback(async () => {
    if (!currentImage) return;

    setUploading(true);
    try {
      const response = await fetch('/api/user/avatar', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }
      onRemove?.();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setUploading(false);
    }
  }, [currentImage, onRemove]);

  const displayImage = preview || currentImage;
  const initial = (userName || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        {/* Avatar circle with gradient border */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-white/80">
                {initial}
              </span>
            )}
          </div>
        </div>

        {/* Hover overlay - only show when not in preview mode */}
        {!preview && !uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Right side content */}
      <div className="flex-1">
        {preview ? (
          // Preview mode - show confirm/cancel buttons
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Preview - confirm to save</p>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Normal mode - show change/remove options
          <div className="space-y-2">
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Change photo
              </button>
              {currentImage && (
                <button
                  onClick={handleRemove}
                  disabled={uploading}
                  className="text-sm font-medium text-gray-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              JPEG, PNG, WebP or GIF. Max 5MB.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
