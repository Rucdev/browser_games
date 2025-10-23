import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browser Games Collection',
  description: 'Collection of browser-based games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#1a1a1a', color: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
