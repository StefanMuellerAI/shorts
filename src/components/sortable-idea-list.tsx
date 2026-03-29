"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { IdeaCard } from "@/components/idea-card";
import { reorderIdeas } from "@/actions/ideas";
import { useToast } from "@/components/toast";

interface Idea {
  id: string;
  hook: string[];
  status: string;
  category: { name: string; color: string } | null;
  [key: string]: unknown;
}

export function SortableIdeaList({ ideas: initialIdeas }: { ideas: Idea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setIdeas(initialIdeas);
  }, [initialIdeas]);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const touchStartY = useRef(0);
  const touchCurrentItem = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function removeIdea(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  const saveOrder = useCallback(
    async (newIdeas: Idea[]) => {
      try {
        await reorderIdeas(newIdeas.map((i) => i.id));
      } catch {
        toast("Fehler beim Speichern der Reihenfolge.", "error");
      }
    },
    [toast]
  );

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const updated = [...ideas];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setIdeas(updated);
    setDragIndex(null);
    setOverIndex(null);
    saveOrder(updated);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleTouchStart(index: number, e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentItem.current = index;
    setDragIndex(index);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchCurrentItem.current === null || !listRef.current) return;

    const touch = e.touches[0];
    const elements = listRef.current.children;

    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        if (i !== overIndex) setOverIndex(i);
        break;
      }
    }
  }

  function handleTouchEnd() {
    if (touchCurrentItem.current !== null && overIndex !== null && touchCurrentItem.current !== overIndex) {
      const updated = [...ideas];
      const [moved] = updated.splice(touchCurrentItem.current, 1);
      updated.splice(overIndex, 0, moved);
      setIdeas(updated);
      saveOrder(updated);
    }

    touchCurrentItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div ref={listRef} className="space-y-2">
      {ideas.map((idea, index) => (
        <div
          key={idea.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(index, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`transition-transform ${
            dragIndex === index ? "opacity-50 scale-95" : ""
          } ${
            overIndex === index && dragIndex !== index
              ? "border-t-2 border-indigo-500 -mt-px pt-px"
              : ""
          }`}
        >
          <IdeaCard
            idea={idea}
            draggable
            onRemove={removeIdea}
            dragHandleProps={{
              onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
            }}
          />
        </div>
      ))}
    </div>
  );
}
