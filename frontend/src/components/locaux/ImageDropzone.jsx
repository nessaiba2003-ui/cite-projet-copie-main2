import { useCallback, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import uploadService from '@/services/uploadService';
import { cn } from '@/utils/helpers';
import { resolveMediaUrl } from '@/utils/media';

export default function ImageDropzone({ images = [], onChange, uploadFn }) {
  const [uploading, setUploading] = useState(false);
  const doUpload = uploadFn || uploadService.uploadLocal;

  const handleFiles = useCallback(
    async (files) => {
      if (!files?.length) return;
      setUploading(true);
      try {
        const urls = await Promise.all([...files].map((f) => doUpload(f)));
        onChange([...images, ...urls]);
        toast.success('Image(s) ajoutée(s)');
      } catch (err) {
        toast.error(err?.response?.data?.message || "Échec de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, doUpload],
  );

  const remove = (url) => onChange(images.filter((i) => i !== url));

  return (
    <div className="space-y-3">
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors',
          'border-stone-300 bg-stone-50 hover:border-[var(--color-primary)] hover:bg-[#FEF0EB]/40',
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-stone-400" />
            <p className="text-sm font-semibold text-stone-700">
              Glissez vos photos ou cliquez pour parcourir
            </p>
            <p className="mt-1 text-xs text-stone-500">JPG, PNG, WebP — max 5 Mo</p>
          </>
        )}
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url) => (
            <div
              key={url}
              className="group relative aspect-video overflow-hidden rounded-xl border border-stone-200"
            >
              <img src={resolveMediaUrl(url)} alt="" className="h-full w-full object-cover" />

              <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={resolveMediaUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/90 p-1.5 text-stone-700 shadow hover:bg-white"
                  aria-label="Ouvrir"
                  title="Ouvrir"
                >
                  <Download className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="rounded-full bg-red-500 p-1.5 text-white shadow hover:bg-red-600"
                  aria-label="Supprimer"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <label className="flex aspect-video cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <ImagePlus className="h-8 w-8 text-stone-400" />
          </label>
        </div>
      )}
    </div>
  );
}