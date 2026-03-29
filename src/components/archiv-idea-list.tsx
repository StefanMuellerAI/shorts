"use client";

import { useState, useEffect } from "react";
import { IdeaCard } from "@/components/idea-card";

interface Idea {
  id: string;
  hook: string[];
  status: string;
  category: { name: string; color: string } | null;
  [key: string]: unknown;
}

export function ArchivIdeaList({ ideas: initialIdeas }: { ideas: Idea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas);

  useEffect(() => {
    setIdeas(initialIdeas);
  }, [initialIdeas]);

  function removeIdea(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          showDelete
          onRemove={removeIdea}
        />
      ))}
    </div>
  );
}
