import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer, type WebSocket } from 'ws'
import {
  applyMoves,
  createInitialBoard,
  getValidMoves,
  type Move
} from './lib/othello'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '/', true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true })

  // Handle WebSocket upgrade
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url || '/', true)

    if (pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected')

    ws.on('message', (data: Buffer) => {
      try {
        const message = data.toString()
        const moves: Move[] = JSON.parse(message)
        console.log(`Received ${moves.length} moves`)

        const board = createInitialBoard()
        applyMoves(board, moves)

        // Computer's turn (player 2)
        const computerPlayer = 2
        const validMoves = getValidMoves(board, computerPlayer)

        if (validMoves.length > 0) {
          const thinkingTime = Math.random() * 2000 + 1000 // 1-3 seconds
          setTimeout(() => {
            const computerMove = validMoves[Math.floor(Math.random() * validMoves.length)]
            const moveToSend = {
              type: 'move',
              player: computerPlayer,
              row: computerMove.row,
              col: computerMove.col
            }
            ws.send(JSON.stringify(moveToSend))
            console.log('Sent computer move:', moveToSend)
          }, thinkingTime)
        } else {
          console.log('Computer has no valid moves. Sending pass.')
          ws.send(JSON.stringify({ type: 'pass' }))
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      console.log('WebSocket client disconnected')
    })

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error)
    })
  })

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket endpoint: ws://${hostname}:${port}/api/ws`)
  })
})
