// オセロのゲームロジック

export const BOARD_SIZE = 8;

export type Player = 1 | 2; // 1: 黒, 2: 白
export type Cell = 0 | Player; // 0: 空
export type Board = Cell[][];

export interface Move {
  player: Player;
  row: number;
  col: number;
}

export interface Position {
  row: number;
  col: number;
}

// 初期盤面を作成
export function createInitialBoard(): Board {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
  board[3][3] = 2; // 白
  board[3][4] = 1; // 黒
  board[4][3] = 1; // 黒
  board[4][4] = 2; // 白
  return board;
}

// 盤面のディープコピー
export function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

// 手を盤面に適用
export function applyMove(board: Board, move: Move): Board {
  const newBoard = copyBoard(board);
  const { player, row, col } = move;

  if (isValidMove(newBoard, row, col, player)) {
    const piecesToFlip = getPiecesToFlip(newBoard, row, col, player);
    newBoard[row][col] = player;
    flipPieces(newBoard, piecesToFlip, player);
  }

  return newBoard;
}

// 複数の手を順番に適用
export function applyMoves(board: Board, moves: Move[]): Board {
  let currentBoard = board;
  for (const move of moves) {
    currentBoard = applyMove(currentBoard, move);
  }
  return currentBoard;
}

// 有効な手かどうかを判定
export function isValidMove(board: Board, row: number, col: number, player: Player): boolean {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
  if (board[row][col] !== 0) return false;

  const opponent: Player = player === 1 ? 2 : 1;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    let hasOpponentPiece = false;

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      r += dr;
      c += dc;
      hasOpponentPiece = true;
    }

    if (hasOpponentPiece && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      return true;
    }
  }
  return false;
}

// ひっくり返す駒を取得
export function getPiecesToFlip(board: Board, row: number, col: number, player: Player): Position[] {
  const piecesToFlip: Position[] = [];
  const opponent: Player = player === 1 ? 2 : 1;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    const line: Position[] = [];

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      piecesToFlip.push(...line);
    }
  }
  return piecesToFlip;
}

// 駒をひっくり返す
export function flipPieces(board: Board, pieces: Position[], player: Player): void {
  for (const piece of pieces) {
    board[piece.row][piece.col] = player;
  }
}

// 有効な手をすべて取得
export function getValidMoves(board: Board, player: Player): Position[] {
  const validMoves: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isValidMove(board, row, col, player)) {
        validMoves.push({ row, col });
      }
    }
  }
  return validMoves;
}

// 駒の数を数える
export function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 1) black++;
      else if (board[row][col] === 2) white++;
    }
  }
  return { black, white };
}

// ゲームが終了しているかどうかを判定
export function isGameOver(board: Board): boolean {
  const player1Moves = getValidMoves(board, 1);
  const player2Moves = getValidMoves(board, 2);
  return player1Moves.length === 0 && player2Moves.length === 0;
}

// 勝者を判定
export function getWinner(board: Board): Player | 0 {
  const { black, white } = countPieces(board);
  if (black > white) return 1;
  if (white > black) return 2;
  return 0; // 引き分け
}
