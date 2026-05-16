import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface Props {
  value?: string | null;       // existing URL (from backend)
  onChange: (file: File | null) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const displayUrl = preview ?? value ?? null;

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-content-primary">Cover Image</label>

      {displayUrl ? (
        /* Preview */
        <div className="relative overflow-hidden rounded-xl border border-surface-border">
          <img
            src={displayUrl}
            alt="Cover preview"
            className="aspect-video w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
            dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-surface-border bg-surface-muted hover:border-primary-400 hover:bg-primary-50/40'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-surface-border text-content-tertiary">
            <ImagePlus size={22} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-content-primary">
              Drag & drop or <span className="text-primary-600">browse</span>
            </p>
            <p className="mt-0.5 text-xs text-content-tertiary">PNG, JPG, WEBP — max 5 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
