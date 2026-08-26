import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';

interface PhotoUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  required?: boolean;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Broken Road / Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dirty Water / Pump',
    url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Electric Transformer',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Blocked Drain / Trash',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rural Health Clinic',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  },
];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  images,
  onImagesChange,
  required = true,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const newImages: string[] = [...images];
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload only image files (JPEG, PNG, WebP).');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('Image size must be under 15MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          onImagesChange([...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  const addPresetSample = (url: string) => {
    if (!images.includes(url)) {
      onImagesChange([...images, url]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>Add Photo Evidence</span>
          {required && <span className="text-rose-600 font-extrabold text-base">*</span>}
          <span className="text-xs font-normal text-slate-500">(Mandatory for official verification)</span>
        </label>

        {images.length > 0 ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {images.length} photo{images.length > 1 ? 's' : ''} attached
          </span>
        ) : (
          <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> At least 1 photo required
          </span>
        )}
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition ${
          images.length === 0
            ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
            : 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
        } ${dragOver ? 'border-emerald-500 bg-emerald-100/40' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="photo-file-input"
        />

        {/* Hidden Camera Input for mobile devices */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="photo-camera-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-emerald-600">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800">
              Drag & drop photos of the problem here
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports JPEG, PNG, WebP up to 15MB each
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              id="upload-browse-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Browse Photos</span>
            </button>

            <button
              type="button"
              id="upload-camera-btn"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Take Live Photo (Camera)</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs text-rose-600 font-medium flex items-center gap-1 bg-rose-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Sample Photos for Rapid Demo Testing */}
      <div className="pt-1">
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
          <span>Quick Sample Evidence for Testing:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addPresetSample(preset.url)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Attached Images Grid Gallery */}
      {images.length > 0 && (
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-700 mb-2">Attached Photo Evidence ({images.length}):</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-sm group"
              >
                <img
                  src={imgUrl}
                  alt={`Evidence ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute top-1 right-1">
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Photo #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
