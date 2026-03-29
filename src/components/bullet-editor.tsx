"use client";

import { Plus, X } from "lucide-react";

interface BulletEditorProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  minItems?: number;
  maxItems?: number;
  children?: React.ReactNode;
}

export function BulletEditor({
  label,
  value,
  onChange,
  placeholder = "Stichpunkt eingeben...",
  minItems = 1,
  maxItems = 8,
  children,
}: BulletEditorProps) {
  const items = value.length > 0 ? value : [""];

  function updateItem(index: number, text: string) {
    const updated = [...items];
    updated[index] = text;
    onChange(updated);
  }

  function addItem() {
    if (items.length >= maxItems) return;
    onChange([...items, ""]);
  }

  function removeItem(index: number) {
    if (items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (items.length < maxItems) {
        const updated = [...items];
        updated.splice(index + 1, 0, "");
        onChange(updated);
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>(
            `[data-bullet-group="${label}"]`
          );
          inputs[index + 1]?.focus();
        }, 50);
      }
    }
    if (e.key === "Backspace" && items[index] === "" && items.length > minItems) {
      e.preventDefault();
      removeItem(index);
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>(
          `[data-bullet-group="${label}"]`
        );
        inputs[Math.max(0, index - 1)]?.focus();
      }, 50);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {children}
        </div>
      </div>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-zinc-600 select-none">–</span>
            <input
              data-bullet-group={label}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {items.length > minItems && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {items.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          className="mt-1.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
        >
          <Plus className="h-3 w-3" />
          Stichpunkt hinzufuegen
        </button>
      )}
    </div>
  );
}
