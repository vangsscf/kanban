"use client";

import { useEffect, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react";
import { Column } from "@/components/Column";
import {
  addCard,
  applyColumnOrder,
  cardsByColumn,
  cardsInColumn,
  createSeedBoard,
  deleteCard,
  renameColumn,
  type Board as BoardState,
} from "@/lib/board";

export function Board() {
  const [board, setBoard] = useState<BoardState>(() => createSeedBoard());
  const boardRef = useRef(board);
  const snapshot = useRef(board);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  function applyDrag(current: BoardState, event: DragOverEvent | DragEndEvent) {
    return applyColumnOrder(current, move(cardsByColumn(current), event));
  }

  function commit(next: BoardState) {
    boardRef.current = next;
    setBoard(next);
  }

  function handleDragStart() {
    snapshot.current = boardRef.current;
  }

  function handleDragOver(event: DragOverEvent) {
    const current = boardRef.current;
    const next = applyDrag(current, event);
    if (next === current) return;
    commit(next);
    event.preventDefault();
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      commit(snapshot.current);
      return;
    }
    commit(applyDrag(boardRef.current, event));
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b-4 border-yellow bg-navy px-8 py-6 text-white">
        <p className="text-sm font-semibold tracking-[0.18em] text-blue uppercase">Project</p>
        <h1 className="mt-2 font-serif text-4xl leading-none tracking-tight">Studio board</h1>
      </header>
      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="flex min-h-0 flex-1 gap-4 overflow-x-auto px-6 py-6">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={cardsInColumn(board, column)}
              onRename={(name) => commit(renameColumn(boardRef.current, column.id, name))}
              onAdd={(title, details) =>
                commit(addCard(boardRef.current, column.id, { title, details }))
              }
              onDelete={(cardId) => commit(deleteCard(boardRef.current, cardId))}
            />
          ))}
        </main>
      </DragDropProvider>
    </div>
  );
}
