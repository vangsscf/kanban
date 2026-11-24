export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  name: string;
  cardIds: string[];
};

export type Board = {
  columns: Column[];
  cards: Record<string, Card>;
};

const seedColumns: Array<{ id: string; name: string }> = [
  { id: "backlog", name: "Backlog" },
  { id: "todo", name: "To Do" },
  { id: "in-progress", name: "In Progress" },
  { id: "review", name: "Review" },
  { id: "done", name: "Done" },
];

const seedCards: Array<Card & { columnId: string }> = [
  {
    id: "launch-narrative",
    columnId: "backlog",
    title: "Define the launch narrative",
    details: "Agree the story, audience, and the one outcome this release must prove.",
  },
  {
    id: "onboarding-copy",
    columnId: "backlog",
    title: "Audit onboarding copy",
    details: "Mark the lines that still describe the old flow.",
  },
  {
    id: "empty-states",
    columnId: "todo",
    title: "Design empty states",
    details: "Each column needs a quiet prompt when it has no cards.",
  },
  {
    id: "design-review",
    columnId: "todo",
    title: "Schedule the design review",
    details: "Hold thirty minutes after the first visual pass.",
  },
  {
    id: "column-layout",
    columnId: "in-progress",
    title: "Build the column layout",
    details: "Five columns, fixed order, scroll together on a narrow screen.",
  },
  {
    id: "card-spacing",
    columnId: "in-progress",
    title: "Tighten card spacing",
    details: "Keep titles readable and details to three lines.",
  },
  {
    id: "color-tokens",
    columnId: "review",
    title: "Review color tokens",
    details: "Navy headings, blue accents, yellow rules, purple actions.",
  },
  {
    id: "type-system",
    columnId: "done",
    title: "Choose the type pairing",
    details: "Newsreader for the board title, Source Sans for everything else.",
  },
];

export function createSeedBoard(): Board {
  const cards: Record<string, Card> = {};
  const cardIdsByColumn = new Map<string, string[]>();

  for (const { columnId, ...card } of seedCards) {
    cards[card.id] = card;
    const ids = cardIdsByColumn.get(columnId) ?? [];
    ids.push(card.id);
    cardIdsByColumn.set(columnId, ids);
  }

  return {
    cards,
    columns: seedColumns.map((column) => ({
      ...column,
      cardIds: cardIdsByColumn.get(column.id) ?? [],
    })),
  };
}

export function renameColumn(board: Board, columnId: string, name: string): Board {
  const nextName = name.trim();
  if (!nextName) return board;

  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, name: nextName } : column,
    ),
  };
}

export function addCard(
  board: Board,
  columnId: string,
  input: { title: string; details: string },
  id: string = crypto.randomUUID(),
): Board {
  const title = input.title.trim();
  if (!title) return board;

  const card: Card = { id, title, details: input.details.trim() };

  return {
    cards: { ...board.cards, [id]: card },
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, cardIds: [...column.cardIds, id] } : column,
    ),
  };
}

export function deleteCard(board: Board, cardId: string): Board {
  if (!board.cards[cardId]) return board;

  const cards = { ...board.cards };
  delete cards[cardId];

  return {
    cards,
    columns: board.columns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    })),
  };
}

export function moveCard(
  board: Board,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Board {
  const fromColumn = board.columns.find((column) => column.cardIds.includes(cardId));
  const toColumn = board.columns.find((column) => column.id === toColumnId);
  if (!fromColumn || !toColumn) return board;

  const fromIds = fromColumn.cardIds.filter((id) => id !== cardId);
  const targetIds = fromColumn.id === toColumn.id ? fromIds : [...toColumn.cardIds];
  const index = Math.max(0, Math.min(toIndex, targetIds.length));
  const nextIds = [
    ...targetIds.slice(0, index),
    cardId,
    ...targetIds.slice(index),
  ];

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.id === fromColumn.id && column.id === toColumn.id) {
        return { ...column, cardIds: nextIds };
      }
      if (column.id === fromColumn.id) return { ...column, cardIds: fromIds };
      if (column.id === toColumn.id) return { ...column, cardIds: nextIds };
      return column;
    }),
  };
}

export function cardsInColumn(board: Board, column: Column): Card[] {
  return column.cardIds.flatMap((id) => {
    const card = board.cards[id];
    return card ? [card] : [];
  });
}

export function cardsByColumn(board: Board): Record<string, string[]> {
  return Object.fromEntries(
    board.columns.map((column) => [column.id, [...column.cardIds]]),
  );
}

export function applyColumnOrder(
  board: Board,
  order: Record<string, readonly (string | number)[]>,
): Board {
  let changed = false;
  const columns = board.columns.map((column) => {
    const nextIds = (order[column.id] ?? column.cardIds).map(String);
    const sameOrder =
      nextIds.length === column.cardIds.length &&
      nextIds.every((id, index) => id === column.cardIds[index]);
    if (sameOrder) return column;
    changed = true;
    return { ...column, cardIds: nextIds };
  });

  return changed ? { ...board, columns } : board;
}
