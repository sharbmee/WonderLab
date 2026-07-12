// ─── Core domain types ───────────────────────────────────────────────────────

/** The three states a cell can cycle through. */
export type CellState = 'empty' | 'cat' | 'grass';

/** Available difficulty levels. */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

/** A colored region on the board. */
export interface Region {
  id: number;
  cells: Array<{ row: number; col: number }>;
  color: string;
}

/** 2D array of cell states (the player's working board). */
export type Grid = CellState[][];

/** 2D map of regionId for each cell position. */
export type RegionMap = number[][];

/** A fully generated puzzle, ready to play. */
export interface Puzzle {
  /** Unique id for React keying and board re-animation. */
  id: number;
  size: number;
  regionMap: RegionMap;
  regions: Region[];
  /** The one valid solution grid. */
  solution: Grid;
  difficulty: Difficulty;
}

// ─── Game state ───────────────────────────────────────────────────────────────

export interface GameState {
  puzzle: Puzzle | null;
  board: Grid;
  /** Undo stack — list of previous board states. */
  history: Grid[];
  /** Redo stack. */
  future: Grid[];
  moves: number;
  /** Timestamp (ms) when the first move was made. */
  startTime: number | null;
  /** Elapsed seconds since first move. */
  elapsed: number;
  isRunning: boolean;
  isSolved: boolean;
  difficulty: Difficulty;
  /** Set of "row,col" strings for cells currently in conflict. */
  conflictCells: Set<string>;
  /** "row,col" string for the cell a hint was applied to (or null). */
  hintCell: string | null;
  soundEnabled: boolean;
  /** True while the async puzzle generator is running. */
  isGenerating: boolean;
}

// ─── Reducer actions ──────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'GENERATING' }
  | { type: 'NEW_PUZZLE'; puzzle: Puzzle }
  | { type: 'CELL_CLICK'; row: number; col: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESTART' }
  | { type: 'TICK' }
  | { type: 'HINT'; row: number; col: number; state: CellState }
  | { type: 'CLEAR_HINT' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'TOGGLE_SOUND' };
