'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function MakaiRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameInitialized = useRef(false)

  useEffect(() => {
    if (gameInitialized.current) return
    gameInitialized.current = true

    // Dynamically import the game to avoid SSR issues
    import('./game/main').then(({ initGame }) => {
      if (canvasRef.current) {
        initGame(canvasRef.current)
      }
    })
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#222',
      padding: '20px'
    }}>
      <Link
        href="/"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '1.2rem',
          padding: '10px 20px',
          backgroundColor: '#444',
          borderRadius: '5px'
        }}
      >
        ← ホームに戻る
      </Link>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>魔界ランナー</h1>
        <canvas
          ref={canvasRef}
          id="gameCanvas"
          width={800}
          height={500}
          style={{
            border: '2px solid #444',
            backgroundColor: '#333'
          }}
        />
        <div id="gameInfo" style={{ marginTop: '10px', fontSize: '14px' }}>
          <div>HP: <span id="hp">3</span> | Score: <span id="score">0</span></div>
        </div>
        <div id="controls" style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>
          操作: スペース(ジャンプ) | J(攻撃) | K(回避)
        </div>
      </div>
    </div>
  )
}
