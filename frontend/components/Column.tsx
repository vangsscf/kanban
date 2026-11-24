"use client";

import { useRef, useState } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { Card } from "@/components/Card";
import type { Card as CardData, Column as ColumnData } from "@/lib/board";

type ColumnProps = {
  column: ColumnData;
  cards: CardData[];
  onRename: (name: string) => void;
  onAdd: (title: string, details: string) => void;
  onDelete: (cardId: string) => void;
};

export function Column({ column, cards, onRename, onAdd, onDelete }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: "column",
    accept: "card",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <section
      ref={ref}
      data-testid={`column-${column.id}`}
      className={`flex h-full w-72 shrink-0 flex-col rounded-2xl bg-white shadow-md shadow-navy/5 ${
        isDropTarget ? "ring-2 ring-blue" : ""
      }`}
    >
      <div className="border-b border-navy/10 px-4 py-3">
        <ColumnName name={column.name} onRename={onRename} />
        <p className="mt-1 text-xs font-semibold tracking-wide text-muted uppercase">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </p>
      </div>
      <div className="flex min-h-28 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            columnId={column.id}
            onDelete={onDelete}
          />
        ))}
      </div>
      <AddCardForm onAdd={onAdd} />
    </section>
  );
}

function ColumnName({ name, onRename }: { name: string; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const cancelRef = useRef(false);

  if (!editing) {
    return (
      <button
        type="button"
        className="w-full truncate text-left font-serif text-xl text-navy"
        onClick={() => {
          cancelRef.current = false;
          setDraft(name);
          setEditing(true);
        }}
      >
        {name}
      </button>
    );
  }

  return (
    <input
      autoFocus
      aria-label="Column name"
      value={draft}
      className="w-full border-b border-blue bg-transparent font-serif text-xl text-navy outline-none"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (cancelRef.current) {
          cancelRef.current = false;
          return;
        }
        onRename(draft);
        setEditing(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          cancelRef.current = true;
          setDraft(name);
          setEditing(false);
        }
      }}
    />
  );
}

function AddCardForm({ onAdd }: { onAdd: (title: string, details: string) => void }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  return (
    <form
      className="grid gap-2 border-t border-navy/10 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return;
        onAdd(title, details);
        setTitle("");
        setDetails("");
      }}
    >
      <input
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Card title"
        aria-label="Card title"
        className="rounded-lg border border-navy/10 px-3 py-2 text-sm text-navy outline-none placeholder:text-muted focus:border-blue"
      />
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Details"
        aria-label="Card details"
        rows={2}
        className="resize-none rounded-lg border border-navy/10 px-3 py-2 text-sm text-navy outline-none placeholder:text-muted focus:border-blue"
      />
      <button
        type="submit"
        className="rounded-lg bg-purple px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
      >
        Add card
      </button>
    </form>
  );
}
