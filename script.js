document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const turnElement = document.getElementById('turn');
    const timerElement = document.getElementById('timer');

    const boardSize = 8;
    let board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
    let currentPlayer = 1; // 1 for black, 2 for white
    let timer;
    let timeLeft = 15;
    let consecutivePasses = 0;
    let gameOver = false;

    // WebSocket setup
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('Connected to the server');
    };

    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        console.log('Received message from server:', message);

        if (gameOver) return;

        if (message.type === 'move') {
            consecutivePasses = 0; // Reset pass counter on a valid move
            const { player, row, col } = message;
            // Apply computer's move
            board[row][col] = player;
            const piecesToFlip = getPiecesToFlip(row, col, player);
            flipPieces(piecesToFlip, player);
            renderBoard();
            addMove(message);
        } else if (message.type === 'pass') {
            console.log('Computer passed turn.');
            consecutivePasses++;
            if (checkGameOver()) return;
        }
        // In both cases, switch turn back to the user
        switchTurn();
    };

    ws.onclose = () => {
        console.log('Disconnected from the server');
    };

    // IndexedDB setup
    let db;
    const dbName = 'OthelloGame';
    const dbVersion = 1;
    const storeName = 'moves';

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = event => {
        console.error('Database error:', event.target.errorCode);
    };

    request.onupgradeneeded = event => {
        db = event.target.result;
        db.createObjectStore(storeName, { autoIncrement: true });
    };

    request.onsuccess = event => {
        db = event.target.result;
        console.log('Database opened successfully');
    };


    function initializeBoard() {
        board[3][3] = 2; // White
        board[3][4] = 1; // Black
        board[4][3] = 1; // Black
        board[4][4] = 2; // White
        renderBoard();
        startTimer();
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const pieceValue = board[row][col];
                if (pieceValue !== 0) {
                    const piece = document.createElement('div');
                    piece.className = 'piece ' + (pieceValue === 1 ? 'black' : 'white');
                    cell.appendChild(piece);
                } else {
                    cell.addEventListener('click', handleCellClick);
                }
                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        if (currentPlayer !== 1 || gameOver) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (isValidMove(row, col, currentPlayer)) {
            consecutivePasses = 0; // Reset pass counter on a valid move
            const piecesToFlip = getPiecesToFlip(row, col, currentPlayer);
            board[row][col] = currentPlayer;
            flipPieces(piecesToFlip, currentPlayer);
            const move = { player: currentPlayer, row, col };
            addMove(move);
            renderBoard();
            switchTurn();
            sendMovesToServer();
        }
    }

    function isValidMove(row, col, player) {
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

    function getPiecesToFlip(row, col, player) {
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

    function flipPieces(pieces, player) {
        for (const piece of pieces) {
            board[piece.r][piece.c] = player;
        }
    }

    function getValidMoves(player) {
        const validMoves = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (isValidMove(row, col, player)) {
                    validMoves.push({ row, col });
                }
            }
        }
        return validMoves;
    }

    function switchTurn() {
        if (gameOver) return;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnElement.textContent = currentPlayer === 1 ? 'Black' : 'White';

        if (currentPlayer === 1) { // User's turn
            startTimer();
        } else { // Computer's turn
            stopTimer();
        }
    }

    function startTimer() {
        const validMoves = getValidMoves(currentPlayer);
        if (validMoves.length === 0) {
            console.log('User has no valid moves. Passing turn.');
            alert('You have no valid moves. Passing turn.');
            consecutivePasses++;
            if (checkGameOver()) return;
            switchTurn(); // Switch to computer's turn
            sendMovesToServer();
            return; // Don't start the timer
        }

        timeLeft = 15;
        timerElement.textContent = timeLeft + 's';
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft + 's';
            if (timeLeft <= 0) {
                // Handle timeout as a pass
                clearInterval(timer);
                console.log('Time is up! Passing turn.');
                consecutivePasses++;
                if (checkGameOver()) return;
                switchTurn(); // Pass the turn
                sendMovesToServer();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
        // timerElement.textContent = '15s'; // Reset timer display - temporarily disabled for debugging
    }

    function addMove(move) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.add(move);
    }

    function getAllMoves(callback) {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => {
            callback(request.result);
        }
    }

    function sendMovesToServer() {
        getAllMoves(moves => {
            ws.send(JSON.stringify(moves));
        });
    }

    function checkGameOver() {
        if (consecutivePasses >= 2) {
            gameOver = true;
            const scores = calculateScores();
            let winnerMessage = `Game Over! Black: ${scores.black}, White: ${scores.white}. `;
            if (scores.black > scores.white) {
                winnerMessage += 'Black wins!';
            } else if (scores.white > scores.black) {
                winnerMessage += 'White wins!';
            } else {
                winnerMessage += "It's a draw!";
            }
            // Display the winner message (e.g., in the game-info div)
            const gameInfo = document.getElementById('game-info');
            const winnerElement = document.createElement('p');
            winnerElement.textContent = winnerMessage;
            gameInfo.appendChild(winnerElement);
            stopTimer();
            return true;
        }
        return false;
    }

    function calculateScores() {
        let black = 0;
        let white = 0;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 1) {
                    black++;
                } else if (board[row][col] === 2) {
                    white++;
                }
            }
        }
        return { black, white };
    }

    initializeBoard();
});
