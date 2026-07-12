import { useMemo, useState } from "react";

type Cell = {
  row: number;
  col: number;
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

const SIZE = 10;
const MINES = 10;

// ---------------------------
// Create Board
// ---------------------------

function createBoard(): Cell[][] {
  const board: Cell[][] = [];

  for (let row = 0; row < SIZE; row++) {
    const current: Cell[] = [];

    for (let col = 0; col < SIZE; col++) {
      current.push({
        row,
        col,
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      });
    }

    board.push(current);
  }

  // Random mines

  let placed = 0;

  while (placed < MINES) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    if (!board[row][col].mine) {
      board[row][col].mine = true;
      placed++;
    }
  }

  // Calculate adjacent mines

  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col].mine) continue;

      let count = 0;

      for (const [dx, dy] of directions) {
        const nr = row + dx;
        const nc = col + dy;

        if (
          nr >= 0 &&
          nr < SIZE &&
          nc >= 0 &&
          nc < SIZE &&
          board[nr][nc].mine
        ) {
          count++;
        }
      }

      board[row][col].adjacent = count;
    }
  }

  return board;
}

export default function Minesweeper() {
  const [board, setBoard] = useState(createBoard());

  const [gameOver, setGameOver] = useState(false);

  const [won, setWon] = useState(false);

  const revealedCount = useMemo(() => {
    return board.flat().filter((c) => c.revealed).length;
  }, [board]);

  function restart() {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
  }
    const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  function revealZeros(
    currentBoard: Cell[][],
    row: number,
    col: number
  ) {
    const stack = [[row, col]];

    while (stack.length > 0) {
      const [r, c] = stack.pop()!;

      for (const [dx, dy] of directions) {
        const nr = r + dx;
        const nc = c + dy;

        if (
          nr < 0 ||
          nr >= SIZE ||
          nc < 0 ||
          nc >= SIZE
        ) {
          continue;
        }

        const cell = currentBoard[nr][nc];

        if (cell.revealed || cell.flagged) continue;

        cell.revealed = true;

        if (cell.adjacent === 0 && !cell.mine) {
          stack.push([nr, nc]);
        }
      }
    }
  }

  function revealCell(row: number, col: number) {
    if (gameOver || won) return;

    const newBoard = board.map((r) =>
      r.map((cell) => ({ ...cell }))
    );

    const cell = newBoard[row][col];

    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    if (cell.mine) {
      newBoard.forEach((r) =>
        r.forEach((c) => {
          if (c.mine) c.revealed = true;
        })
      );

      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    if (cell.adjacent === 0) {
      revealZeros(newBoard, row, col);
    }

    const safeCells = SIZE * SIZE - MINES;

    const opened = newBoard
      .flat()
      .filter((c) => c.revealed && !c.mine).length;

    if (opened === safeCells) {
      setWon(true);
    }

    setBoard(newBoard);
  }

  function toggleFlag(
    e: React.MouseEvent,
    row: number,
    col: number
  ) {
    e.preventDefault();

    if (gameOver || won) return;

    const newBoard = board.map((r) =>
      r.map((cell) => ({ ...cell }))
    );

    const cell = newBoard[row][col];

    if (cell.revealed) return;

    cell.flagged = !cell.flagged;

    setBoard(newBoard);
  }
    return (
    <div className="max-w-2xl mx-auto">

      <h1 className="text-4xl font-bold text-center mb-3">
        💣 Minesweeper
      </h1>

      <p className="text-center text-neutral-500 mb-8">
        Left click to reveal • Right click to place a flag
      </p>

      <div className="flex justify-between items-center mb-6">

        <div className="border rounded-xl px-4 py-3">

          <p className="text-xs uppercase text-neutral-500">
            Safe Cells Opened
          </p>

          <p className="text-2xl font-bold">
            {revealedCount} / {SIZE * SIZE - MINES}
          </p>

        </div>

        <button
          onClick={restart}
          className="
            px-5
            py-3
            rounded-xl
            bg-black
            text-white
            hover:bg-neutral-800
            transition
          "
        >
          🔄 Restart
        </button>

      </div>

      {(gameOver || won) && (

        <div
          className={`
            mb-6
            rounded-2xl
            p-5
            text-center
            font-bold
            text-xl
            ${
              won
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          `}
        >

          {won
            ? "🎉 Congratulations! You cleared the board!"
            : "💥 Boom! You hit a mine."}

        </div>

      )}

      <div
        className="
          grid
          grid-cols-10
          gap-1
          sm:gap-2
          bg-neutral-300
          p-2
          rounded-2xl
        "
      >

        {board.flat().map((cell) => (

          <button
            key={`${cell.row}-${cell.col}`}
            onClick={() => revealCell(cell.row, cell.col)}
            onContextMenu={(e) =>
              toggleFlag(e, cell.row, cell.col)
            }
            className={`
              aspect-square
              rounded-md
              sm:rounded-lg
              text-sm
              sm:text-lg
              font-bold
              transition-all
              border

              ${
                cell.revealed
                  ? "bg-white border-neutral-300"
                  : "bg-neutral-200 hover:bg-neutral-100 border-neutral-400"
              }
            `}
          >

            {!cell.revealed && cell.flagged && "🚩"}

            {cell.revealed && cell.mine && "💣"}

            {cell.revealed &&
              !cell.mine &&
              cell.adjacent > 0 &&
              cell.adjacent}

          </button>

        ))}

      </div>

      <div className="mt-8 text-center text-sm text-neutral-500">

        Reveal all safe cells to win.
        <br />
        Avoid the hidden mines!

      </div>

    </div>
  );
}