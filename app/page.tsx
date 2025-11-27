import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Browser Games</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/makai-runner"
          style={{
            padding: '2rem',
            backgroundColor: '#333',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'transform 0.2s',
            border: '2px solid #555'
          }}
        >
          魔界ランナー
        </Link>
        <Link
          href="/memory-game"
          style={{
            padding: '2rem',
            backgroundColor: '#667eea',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'transform 0.2s',
            border: '2px solid #764ba2'
          }}
        >
          神経衰弱
        </Link>
        <Link
          href="/tetris"
          style={{
            padding: '2rem',
            backgroundColor: '#333',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'transform 0.2s',
            border: '2px solid #555'
          }}
        >
          テトリス
        </Link>
        <Link
          href="/othello"
          style={{
            padding: '2rem',
            backgroundColor: '#2d5016',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'transform 0.2s',
            border: '2px solid #1a3010'
          }}
        >
          オセロ
        </Link>
      </div>
    </main>
  )
}
