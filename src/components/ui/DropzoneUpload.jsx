import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, Images, X } from "lucide-react";

function readFilesToDataUrls(files) {
  const arr = Array.from(files || []);
  return Promise.all(
    arr.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file, dataUrl: reader.result });
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function DropzoneUpload({
  multiple = true,
  accept = "image/*",
  onFilesChange,
  value,
  className = "",
  label = "Drag & drop files here",
  sublabel = "or click to browse",
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleOpenFileDialog = () => inputRef.current?.click();

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = await readFilesToDataUrls(files);
    onFilesChange && onFilesChange(items);
    e.target.value = ""; // reset to allow reselect same file
  };

  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) return;
      const items = await readFilesToDataUrls(files);
      onFilesChange && onFilesChange(items);
    },
    [onFilesChange]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeAt = (idx) => {
    if (!value) return;
    const next = value.filter((_, i) => i !== idx);
    onFilesChange && onFilesChange(next);
  };

  return (
    <div className={className}>
      <div
        onClick={handleOpenFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        aria-label="File upload"
        className={[
          "relative group border-2 border-dashed rounded-2xl p-6 cursor-pointer",
          "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900",
          "transition-all duration-200",
          dragActive ? "ring-2 ring-indigo-500 border-indigo-400" : "hover:shadow-lg",
        ].join(" ")}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{sublabel}</div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleSelect}
        />

        {!!(value && value.length) && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img src={item.dataUrl} alt={item.file?.name || `File ${idx + 1}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(idx);
                  }}
                  className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <Images className="h-4 w-4" />
          <span>Supported: {accept || "any"}. Multiple files allowed.</span>
        </div>
      </div>
    </div>
  );
}

