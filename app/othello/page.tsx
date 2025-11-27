'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Board, Move, Player } from './gameLogic'
import {
  applyMove,
  countPieces,
  createInitialBoard,
  getValidMoves,
  getWinner,
  isGameOver
} from './gameLogic'
import styles from './styles.module.css'

interface GameState {
  board: Board
  currentPlayer: Player
  moveHistory: Move[]
  gameOver: boolean
  winner: Player | 0 | null
  validMoves: { row: number; col: number }[]
  computerThinking: boolean
  wsConnected: boolean
}

export default function OthelloGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 1, // 黒から開始
    moveHistory: [],
    gameOver: false,
    winner: null,
    validMoves: [],
    computerThinking: false,
    wsConnected: false
  })

  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket接続を初期化
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setGameState(prev => ({ ...prev, wsConnected: true }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Received from server:', data)

      if (data.type === 'move') {
        // コンピュータの手を盤面に適用
        setGameState(prev => {
          const newBoard = applyMove(prev.board, {
            player: data.player,
            row: data.row,
            col: data.col
          })

          const newMoveHistory = [
            ...prev.moveHistory,
            { player: data.player, row: data.row, col: data.col }
          ]

          const nextPlayer: Player = 1 // プレイヤーのターンに戻る
          const validMoves = getValidMoves(newBoard, nextPlayer)
          const gameOver = isGameOver(newBoard)
          const winner = gameOver ? getWinner(newBoard) : null

          return {
            ...prev,
            board: newBoard,
            currentPlayer: nextPlayer,
            moveHistory: newMoveHistory,
            validMoves,
            gameOver,
            winner,
            computerThinking: false
          }
        })
      } else if (data.type === 'pass') {
        // コンピュータがパスした場合
        console.log('Computer passed')
        setGameState(prev => {
          const validMoves = getValidMoves(prev.board, 1)
          const gameOver = validMoves.length === 0
          const winner = gameOver ? getWinner(prev.board) : null

          return {
            ...prev,
            currentPlayer: 1,
            validMoves,
            gameOver,
            winner,
            computerThinking: false
          }
        })
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setGameState(prev => ({ ...prev, wsConnected: false }))
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current = ws

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // 有効な手を計算
  useEffect(() => {
    if (!gameState.gameOver && !gameState.computerThinking) {
      const validMoves = getValidMoves(gameState.board, gameState.currentPlayer)
      setGameState(prev => ({ ...prev, validMoves }))

      // プレイヤーに有効な手がない場合
      if (validMoves.length === 0 && gameState.currentPlayer === 1) {
        // コンピュータのターンにスキップ
        const computerValidMoves = getValidMoves(gameState.board, 2)
        if (computerValidMoves.length === 0) {
          // 両者とも手がない場合、ゲーム終了
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            winner: getWinner(prev.board)
          }))
        } else {
          // コンピュータに手を渡す
          setGameState(prev => ({ ...prev, currentPlayer: 2 }))
        }
      }
    }
  }, [gameState.board, gameState.currentPlayer, gameState.gameOver, gameState.computerThinking])

  // コンピュータのターンを処理
  useEffect(() => {
    if (gameState.currentPlayer === 2 && !gameState.gameOver && wsRef.current?.readyState === WebSocket.OPEN) {
      setGameState(prev => ({ ...prev, computerThinking: true }))
      // WebSocketサーバーに現在の手の履歴を送信
      wsRef.current.send(JSON.stringify(gameState.moveHistory))
    }
  }, [gameState.currentPlayer, gameState.gameOver, gameState.moveHistory])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver || gameState.currentPlayer !== 1 || gameState.computerThinking) {
      return
    }

    // 有効な手かどうかを確認
    const isValid = gameState.validMoves.some(move => move.row === row && move.col === col)
    if (!isValid) {
      return
    }

    // 手を適用
    const move: Move = { player: 1, row, col }
    const newBoard = applyMove(gameState.board, move)
    const newMoveHistory = [...gameState.moveHistory, move]

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 2, // コンピュータのターンに切り替え
      moveHistory: newMoveHistory,
      validMoves: []
    }))
  }, [gameState])

  const handleNewGame = useCallback(() => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 1,
      moveHistory: [],
      gameOver: false,
      winner: null,
      validMoves: getValidMoves(createInitialBoard(), 1),
      computerThinking: false,
      wsConnected: wsRef.current?.readyState === WebSocket.OPEN
    })
  }, [])

  const { black, white } = countPieces(gameState.board)

  return (
    <div className={styles.container}>
      <h1>⚫⚪ オセロ ⚪⚫</h1>

      <div className={styles.gameInfo}>
        <div className={styles.infoItem}>
          黒（あなた）: <span>{black}</span>
        </div>
        <div className={styles.infoItem}>
          白（コンピュータ）: <span>{white}</span>
        </div>
        <div className={styles.infoItem}>
          {gameState.computerThinking ? (
            <span className={styles.thinking}>コンピュータが考え中...</span>
          ) : gameState.currentPlayer === 1 ? (
            <span>あなたのターン</span>
          ) : (
            <span>コンピュータのターン</span>
          )}
        </div>
      </div>

      {!gameState.wsConnected && (
        <div className={styles.warning}>
          WebSocketサーバーに接続できません。<br />
          `npm run dev` を実行してください。
        </div>
      )}

      <div className={styles.gameBoard}>
        {gameState.board.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={styles.row}>
            {row.map((cell, colIndex) => {
              const isValid = gameState.validMoves.some(
                move => move.row === rowIndex && move.col === colIndex
              )

              return (
                <button
                  type="button"
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${isValid ? styles.validMove : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell === 1 && <div className={`${styles.piece} ${styles.black}`} />}
                  {cell === 2 && <div className={`${styles.piece} ${styles.white}`} />}
                  {isValid && <div className={styles.hint} />}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={handleNewGame}>新しいゲーム</button>
      </div>

      {gameState.gameOver && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>ゲーム終了</h2>
            <p className={styles.score}>
              黒: {black} - 白: {white}
            </p>
            <p className={styles.result}>
              {gameState.winner === 1 && '🎉 あなたの勝ち！ 🎉'}
              {gameState.winner === 2 && '😢 コンピュータの勝ち'}
              {gameState.winner === 0 && '引き分け'}
            </p>
            <button type="button" onClick={handleNewGame}>もう一度プレイ</button>
          </div>
        </div>
      )}
    </div>
  )
}
