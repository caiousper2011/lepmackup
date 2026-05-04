"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ImageManagerProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export function ImageManager({ value, onChange }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const next = [...value];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Falha no upload.");
        }
        const data = (await res.json()) as { url: string };
        next.push(data.url);
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs text-gray-500">
          Imagens ({value.length})
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
        >
          {uploading ? "Enviando..." : "+ Adicionar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 mb-2">{error}</p>
      )}

      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading
            ? "Enviando imagens..."
            : "Clique para enviar imagens (JPG, PNG ou WEBP — máx 8MB)"}
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative group border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
            >
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Imagem ${i + 1}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    PRINCIPAL
                  </span>
                )}
                <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {i + 1}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5 bg-white border-t border-gray-100">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Mover para trás"
                    className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    title="Mover para frente"
                    className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      title="Tornar principal"
                      className="px-1.5 py-0.5 text-xs text-rose-600 hover:bg-rose-50 rounded"
                    >
                      ★
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  title="Remover"
                  className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-gray-400">
        A primeira imagem é a principal — usada na vitrine. Use ★ para tornar
        outra principal, ou as setas para reordenar.
      </p>
    </div>
  );
}
