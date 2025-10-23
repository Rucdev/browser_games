'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './styles.module.css'

interface GameState {
  matchedPairs: number
  moves: number
  time: number
  canFlip: boolean
}

interface CardData {
  emoji: string
  index: number
  isFlipped: boolean
  isMatched: boolean
}

const cardEmojis = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑']

export default function MemoryGame() {
  const [cards, setCards] = useState<CardData[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [gameState, setGameState] = useState<GameState>({
    matchedPairs: 0,
    moves: 0,
    time: 0,
    canFlip: true
  })
  const [showWinModal, setShowWinModal] = useState(false)
  const [timerActive, setTimerActive] = useState(false)

  // Initialize game
  const initGame = useCallback(() => {
    const cardPairs = [...cardEmojis, ...cardEmojis]
    const shuffled = cardPairs
      .map((emoji, index) => ({
        emoji,
        index,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5)

    setCards(shuffled)
    setFlippedIndices([])
    setGameState({
      matchedPairs: 0,
      moves: 0,
      time: 0,
      canFlip: true
    })
    setShowWinModal(false)
    setTimerActive(false)
  }, [])

  // Initialize on mount
  useEffect(() => {
    initGame()
  }, [initGame])

  // Timer effect
  useEffect(() => {
    if (!timerActive) return

    const timer = setInterval(() => {
      setGameState(prev => ({ ...prev, time: prev.time + 1 }))
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive])

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flippedIndices.length !== 2) return

    const [index1, index2] = flippedIndices
    const card1 = cards[index1]
    const card2 = cards[index2]

    setGameState(prev => ({
      ...prev,
      canFlip: false,
      moves: prev.moves + 1
    }))

    if (card1.emoji === card2.emoji) {
      // Match found
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === index1 || idx === index2
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          )
        )
        setFlippedIndices([])
        setGameState(prev => {
          const newMatchedPairs = prev.matchedPairs + 1
          const allMatched = newMatchedPairs === cardEmojis.length

          if (allMatched) {
            setTimerActive(false)
            setShowWinModal(true)
          }

          return {
            ...prev,
            matchedPairs: newMatchedPairs,
            canFlip: true
          }
        })
      }, 500)
    } else {
      // No match
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === index1 || idx === index2
              ? { ...card, isFlipped: false }
              : card
          )
        )
        setFlippedIndices([])
        setGameState(prev => ({ ...prev, canFlip: true }))
      }, 1000)
    }
  }, [flippedIndices, cards])

  const handleCardClick = (index: number) => {
    // Start timer on first move
    if (gameState.moves === 0 && !timerActive) {
      setTimerActive(true)
    }

    const card = cards[index]

    if (!gameState.canFlip || card.isFlipped || card.isMatched || flippedIndices.length >= 2) {
      return
    }

    setCards(prev =>
      prev.map((c, idx) =>
        idx === index ? { ...c, isFlipped: true } : c
      )
    )
    setFlippedIndices(prev => [...prev, index])
  }

  const handleNewGame = () => {
    setTimerActive(false)
    initGame()
  }

  return (
    <div className={styles.container}>
      <h1>🎴 神経衰弱ゲーム 🎴</h1>

      <div className={styles.gameInfo}>
        <div className={styles.infoItem}>
          ペア数: <span>{gameState.matchedPairs}</span> / {cardEmojis.length}
        </div>
        <div className={styles.infoItem}>
          手数: <span>{gameState.moves}</span>
        </div>
        <div className={styles.infoItem}>
          時間: <span>{gameState.time}</span>秒
        </div>
      </div>

      <div className={styles.gameBoard}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${styles.card} ${card.isFlipped ? styles.flipped : ''} ${
              card.isMatched ? styles.matched : ''
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className={styles.cardFront}>?</div>
            <div className={styles.cardBack}>{card.emoji}</div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button onClick={handleNewGame}>新しいゲーム</button>
      </div>

      {showWinModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>🎉 おめでとうございます！ 🎉</h2>
            <p>
              {gameState.moves}手で{gameState.time}秒でクリア！
            </p>
            <button onClick={handleNewGame}>もう一度プレイ</button>
          </div>
        </div>
      )}
    </div>
  )
}
