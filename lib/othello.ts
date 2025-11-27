// Othello game logic
export const boardSize = 8

export interface Move {
  player: number
  row: number
  col: number
}

export function createInitialBoard() {
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0))
  board[3][3] = 2 // White
  board[3][4] = 1 // Black
  board[4][3] = 1 // Black
  board[4][4] = 2 // White
  return board
}

export function isValidMove(board: number[][], row: number, col: number, player: number) {
  if (board[row][col] !== 0) return false

  const opponent = player === 1 ? 2 : 1
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  for (const [dr, dc] of directions) {
    let r = row + dr
    let c = col + dc
    let hasOpponentPiece = false

    while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === opponent) {
      r += dr
      c += dc
      hasOpponentPiece = true
    }

    if (hasOpponentPiece && r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
      return true
    }
  }
  return false
}

export function getPiecesToFlip(board: number[][], row: number, col: number, player: number) {
  const piecesToFlip = []
  const opponent = player === 1 ? 2 : 1
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  for (const [dr, dc] of directions) {
    let r = row + dr
    let c = col + dc
    const line = []

    while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === opponent) {
      line.push({ r, c })
      r += dr
      c += dc
    }

    if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
      piecesToFlip.push(...line)
    }
  }
  return piecesToFlip
}

export function flipPieces(board: number[][], pieces: { r: number; c: number }[], player: number) {
  for (const piece of pieces) {
    board[piece.r][piece.c] = player
  }
}

export function applyMoves(board: number[][], moves: Move[]) {
  for (const move of moves) {
    const { player, row, col } = move
    if (isValidMove(board, row, col, player)) {
      const piecesToFlip = getPiecesToFlip(board, row, col, player)
      board[row][col] = player
      flipPieces(board, piecesToFlip, player)
    }
  }
}

export function getValidMoves(board: number[][], player: number) {
  const validMoves = []
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (isValidMove(board, row, col, player)) {
        validMoves.push({ row, col })
      }
    }
  }
  return validMoves
}
