import { describe, expect, it } from "vitest";
import {
  addCard,
  applyColumnOrder,
  cardsInColumn,
  createSeedBoard,
  deleteCard,
  moveCard,
  renameColumn,
} from "./board";

describe("board", () => {
  it("seeds five columns and at least one card", () => {
    const board = createSeedBoard();

    expect(board.columns).toHaveLength(5);
    expect(board.columns.map((column) => column.name)).toEqual([
      "Backlog",
      "To Do",
      "In Progress",
      "Review",
      "Done",
    ]);
    expect(Object.keys(board.cards).length).toBeGreaterThan(0);
    expect(
      board.columns.every((column) =>
        column.cardIds.every((id) => board.cards[id]),
      ),
    ).toBe(true);
  });

  it("renames only the chosen column", () => {
    const board = createSeedBoard();
    const next = renameColumn(board, "backlog", "Ideas");

    expect(next.columns[0].name).toBe("Ideas");
    expect(next.columns.slice(1).map((column) => column.name)).toEqual(
      board.columns.slice(1).map((column) => column.name),
    );
    expect(next.columns).toHaveLength(5);
  });

  it("keeps the current name when a rename is blank", () => {
    const board = createSeedBoard();
    const next = renameColumn(board, "backlog", "   ");

    expect(next).toBe(board);
  });

  it("appends a card with title and details", () => {
    const board = createSeedBoard();
    const next = addCard(
      board,
      "backlog",
      { title: "Ship the checklist", details: "Include owners and dates" },
      "ship-checklist",
    );

    expect(next.cards["ship-checklist"]).toEqual({
      id: "ship-checklist",
      title: "Ship the checklist",
      details: "Include owners and dates",
    });
    expect(next.columns[0].cardIds.at(-1)).toBe("ship-checklist");
    expect(next.columns).toHaveLength(5);
  });

  it("does not add a card with a blank title", () => {
    const board = createSeedBoard();
    const next = addCard(board, "backlog", { title: "  ", details: "Notes" }, "blank");

    expect(next).toBe(board);
  });

  it("removes a card and its column id", () => {
    const board = createSeedBoard();
    const next = deleteCard(board, "launch-narrative");

    expect(next.cards["launch-narrative"]).toBeUndefined();
    expect(next.columns[0].cardIds).not.toContain("launch-narrative");
    expect(next.columns).toHaveLength(5);
  });

  it("reorders a card inside its column", () => {
    const board = createSeedBoard();
    const next = moveCard(board, "design-review", "todo", 0);

    expect(next.columns[1].cardIds).toEqual(["design-review", "empty-states"]);
    expect(next.columns).toHaveLength(5);
  });

  it("moves a card into another column", () => {
    const board = createSeedBoard();
    const next = moveCard(board, "launch-narrative", "review", 0);

    expect(next.columns[0].cardIds).not.toContain("launch-narrative");
    expect(next.columns[3].cardIds[0]).toBe("launch-narrative");
    expect(next.cards["launch-narrative"].title).toBe("Define the launch narrative");
    expect(next.columns).toHaveLength(5);
  });

  it("keeps the same board when a drag does not change order", () => {
    const board = createSeedBoard();
    const order = Object.fromEntries(board.columns.map((column) => [column.id, column.cardIds]));

    expect(applyColumnOrder(board, order)).toBe(board);
  });

  it("skips a column id that has no card", () => {
    const board = createSeedBoard();
    const column = { ...board.columns[0], cardIds: [...board.columns[0].cardIds, "missing"] };

    expect(cardsInColumn(board, column).map((card) => card.id)).toEqual(board.columns[0].cardIds);
  });

  it("moves a card into an empty column", () => {
    const board = createSeedBoard();
    const emptied = deleteCard(board, "type-system");
    const next = moveCard(emptied, "launch-narrative", "done", 0);

    expect(next.columns[4].cardIds).toEqual(["launch-narrative"]);
    expect(next.columns[0].cardIds).not.toContain("launch-narrative");
    expect(next.columns).toHaveLength(5);
  });
});
