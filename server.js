const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const boardSize = 8;

function createInitialBoard() {
    const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
    board[3][3] = 2; // White
    board[3][4] = 1; // Black
    board[4][3] = 1; // Black
    board[4][4] = 2; // White
    return board;
}

function applyMoves(board, moves) {
    for (const move of moves) {
        const { player, row, col } = move;
        if (isValidMove(board, row, col, player)) {
            const piecesToFlip = getPiecesToFlip(board, row, col, player);
            board[row][col] = player;
            flipPieces(board, piecesToFlip, player);
        }
    }
}

function isValidMove(board, row, col, player) {
    if (board[row][col] !== 0) return false;

    const opponent = player === 1 ? 2 : 1;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        let hasOpponentPiece = false;

        while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === opponent) {
            r += dr;
            c += dc;
            hasOpponentPiece = true;
        }

        if (hasOpponentPiece && r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            return true;
        }
    }
    return false;
}

function getPiecesToFlip(board, row, col, player) {
    const piecesToFlip = [];
    const opponent = player === 1 ? 2 : 1;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        const line = [];

        while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === opponent) {
            line.push({ r, c });
            r += dr;
            c += dc;
        }

        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            piecesToFlip.push(...line);
        }
    }
    return piecesToFlip;
}

function flipPieces(board, pieces, player) {
    for (const piece of pieces) {
        board[piece.r][piece.c] = player;
    }
}

function getValidMoves(board, player) {
    const validMoves = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (isValidMove(board, row, col, player)) {
                validMoves.push({ row, col });
            }
        }
    }
    return validMoves;
}


wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        const moves = JSON.parse(message);
        console.log(`Received ${moves.length} moves`);

        const board = createInitialBoard();
        applyMoves(board, moves);

        // Computer's turn (player 2)
        const computerPlayer = 2;
        const validMoves = getValidMoves(board, computerPlayer);

        if (validMoves.length > 0) {
            const thinkingTime = Math.random() * 5000 + 5000; // 5-10 seconds
            setTimeout(() => {
                const computerMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                const moveToSend = { type: 'move', player: computerPlayer, row: computerMove.row, col: computerMove.col };
                ws.send(JSON.stringify(moveToSend));
                console.log('Sent computer move:', moveToSend);
            }, thinkingTime);
        } else {
            // No valid moves for the computer, send a "pass" message
            console.log('Computer has no valid moves. Sending pass.');
            ws.send(JSON.stringify({ type: 'pass' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server started on port 8080');