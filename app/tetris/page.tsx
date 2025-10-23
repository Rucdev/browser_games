'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'

export default function Tetris() {
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
        <h1 style={{ marginBottom: '20px' }}>テトリス</h1>
        <div>
          <canvas id="tetris" width="240" height="400" style={{ border: '2px solid #444' }}></canvas>
        </div>
        <div id="score" style={{ marginTop: '10px', fontSize: '18px' }}>0</div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>
          操作: ← → (移動) | ↓ (落下) | Q/W (回転)
        </div>
      </div>

      <Script src="/tetris/script.js" strategy="afterInteractive" />
    </div>
  )
}
