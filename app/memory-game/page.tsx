'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './styles.module.css'

// ゲーム状態の型定義
interface GameState {
  matchedPairs: number  // マッチしたペア数
  moves: number         // 手数（カード2枚めくるごとに1増加）
  time: number          // 経過時間（秒）
  canFlip: boolean      // カードをめくれるかどうか
}

// カードデータの型定義
interface CardData {
  emoji: string       // カードの絵文字
  index: number       // カードのインデックス
  isFlipped: boolean  // カードが表向きかどうか
  isMatched: boolean  // カードがマッチ済みかどうか
}

// ゲームに使用する8種類の絵文字（これを2枚ずつ配置）
const cardEmojis = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑']

export default function MemoryGame() {
  // カードの配列（全16枚：8種類×2枚）
  const [cards, setCards] = useState<CardData[]>([])
  // 現在めくられているカードのインデックス配列（最大2枚）
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  // ゲーム状態
  const [gameState, setGameState] = useState<GameState>({
    matchedPairs: 0,
    moves: 0,
    time: 0,
    canFlip: true
  })
  // 勝利モーダルの表示フラグ
  const [showWinModal, setShowWinModal] = useState(false)
  // タイマーの動作フラグ
  const [timerActive, setTimerActive] = useState(false)

  // ゲームの初期化処理
  const initGame = useCallback(() => {
    // 8種類の絵文字を2枚ずつ用意（計16枚）
    const cardPairs = [...cardEmojis, ...cardEmojis]
    // カードをシャッフルして初期状態に設定
    const shuffled = cardPairs
      .map((emoji, index) => ({
        emoji,
        index,
        isFlipped: false,  // 最初は全て裏向き
        isMatched: false   // 最初は全てマッチしていない
      }))
      .sort(() => Math.random() - 0.5)  // ランダムにシャッフル

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

  // コンポーネントマウント時にゲームを初期化
  useEffect(() => {
    initGame()
  }, [initGame])

  // タイマー処理：1秒ごとに経過時間を更新
  useEffect(() => {
    if (!timerActive) return

    const timer = setInterval(() => {
      setGameState(prev => ({ ...prev, time: prev.time + 1 }))
    }, 1000)

    // クリーンアップ：コンポーネントのアンマウント時やtimerActiveが変わる時にタイマーを停止
    return () => clearInterval(timer)
  }, [timerActive])

  // カードマッチング判定処理：2枚カードがめくられた時に実行
  useEffect(() => {
    // 2枚めくられていない場合は何もしない
    if (flippedIndices.length !== 2) return

    const [index1, index2] = flippedIndices
    const card1 = cards[index1]
    const card2 = cards[index2]

    // マッチング判定中はカードをめくれないようにし、手数を増やす
    setGameState(prev => ({
      ...prev,
      canFlip: false,
      moves: prev.moves + 1
    }))

    if (card1.emoji === card2.emoji) {
      // マッチした場合：0.5秒後にマッチ状態にする
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === index1 || idx === index2
              ? { ...card, isMatched: true, isFlipped: true }  // マッチしたカードは表のまま固定
              : card
          )
        )
        setFlippedIndices([])
        setGameState(prev => {
          const newMatchedPairs = prev.matchedPairs + 1
          const allMatched = newMatchedPairs === cardEmojis.length

          // 全てのペアがマッチしたらゲーム終了
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
      // マッチしなかった場合：1秒後にカードを裏返す（マッチ済みカードは除く）
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            (idx === index1 || idx === index2) && !card.isMatched
              ? { ...card, isFlipped: false }  // マッチしていないカードのみ裏返す
              : card
          )
        )
        setFlippedIndices([])
        setGameState(prev => ({ ...prev, canFlip: true }))
      }, 1000)
    }
  }, [flippedIndices, cards])

  // カードクリック時の処理
  const handleCardClick = (index: number) => {
    // 最初のカードをめくった時にタイマーを開始
    if (gameState.moves === 0 && !timerActive) {
      setTimerActive(true)
    }

    const card = cards[index]

    // 以下の場合はカードをめくれない
    // - カードめくり中（canFlip = false）
    // - 既に表向きのカード
    // - 既にマッチ済みのカード
    // - 既に2枚めくられている
    if (!gameState.canFlip || card.isFlipped || card.isMatched || flippedIndices.length >= 2) {
      return
    }

    // カードを表向きにする
    setCards(prev =>
      prev.map((c, idx) =>
        idx === index ? { ...c, isFlipped: true } : c
      )
    )
    // めくったカードのインデックスを記録
    setFlippedIndices(prev => [...prev, index])
  }

  // 新しいゲームを開始
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
