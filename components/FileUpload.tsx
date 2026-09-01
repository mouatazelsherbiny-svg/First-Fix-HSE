"use client";

import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { UploadedFile } from "@/types/toolboxTalk";

interface FileUploadProps {
  label: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

export default function FileUpload({ label, files, onChange }: FileUploadProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const readers = Array.from(fileList).map(
      (file) =>
        new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              name: file.name,
              type: file.type,
              dataUrl: reader.result as string,
            });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((uploaded) => onChange([...files, ...uploaded]));
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
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
        {files.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-brand-orange">
            {files.length} {t.form.filesSelected}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {files.map((file, i) => {
            const isImage = file.type.startsWith("image/");
            return (
              <div
                key={i}
                className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-2"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand-orangeLight text-brand-orange">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                    >
                      <path
                        d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <span className="truncate text-xs font-medium text-brand-grayDark">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ms-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
