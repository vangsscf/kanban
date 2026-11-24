"use client";

import { Feedback } from "@dnd-kit/dom";
import { useSortable } from "@dnd-kit/react/sortable";
import type { Card as CardData } from "@/lib/board";

type CardProps = {
  card: CardData;
  index: number;
  columnId: string;
  onDelete: (cardId: string) => void;
};

export function Card({ card, index, columnId, onDelete }: CardProps) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: columnId,
    type: "card",
    accept: "card",
    plugins: (defaults) => [...defaults, Feedback.configure({ feedback: "clone" })],
  });

  return (
    <div data-testid={`card-${card.id}`}>
      <article
        ref={ref}
        className={`rounded-xl border border-navy/10 bg-white px-3 py-3 shadow-sm ${
          isDragging ? "opacity-40" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-navy">{card.title}</h3>
          <button
            type="button"
            aria-label={`Delete ${card.title}`}
            className="shrink-0 text-xs font-semibold text-purple"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(card.id)}
          >
            Delete
          </button>
        </div>
        {card.details ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{card.details}</p>
        ) : null}
      </article>
    </div>
  );
}
