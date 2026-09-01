"use client";

import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ImageUploadProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ label, images, onChange }: ImageUploadProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((urls) => onChange([...images, ...urls]));
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="label-field">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-brand-grayLight/50 px-4 py-6 text-center transition hover:border-brand-orange hover:bg-brand-orangeLight/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-2 h-7 w-7 text-brand-orange"
        >
          <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 16v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs font-medium text-brand-gray">{t.form.uploadHint}</p>
        {images.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-brand-orange">
            {images.length} {t.form.filesSelected}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`upload-${i}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
