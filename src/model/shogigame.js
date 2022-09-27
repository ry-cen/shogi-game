import { Shogi, Color } from 'shogi.js';
import ShogiPiece from './shogipiece.js'
import Square from './square.js';

class ShogiGame {
    constructor(thisPlayerIsBlack) {
        this.thisPlayerIsBlack = thisPlayerIsBlack
        this.game = new Shogi();
        this.board = this.makeBoard();
        this.kingInCheck = false;
        this.enemyKingInCheck = true;
        this.color = thisPlayerIsBlack ? "black" : "white";
        this.enemyColor = thisPlayerIsBlack ? "white" : "black";
    }

    isCheckmate(isMyMove) {
        // all king moves are being attacked
        // attackers cant be attacked
        // all drops wont remove check

        const convert = {
            0:9, 1:8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8:1
        }

        let coords = isMyMove ? this.findPiece(this.board, this.enemyKingId) : this.findPiece(this.board, this.kingId);
        let checkmateAttacker = [];
        let kingMoves = this.game.getMovesFrom(convert[coords[0]], coords[1] + 1);

        console.log(kingMoves)
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = this.board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.enemyColor : this.color)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(convert[j], i+1);
                
                for (let k = 0; k < kingMoves.length; k++) {
                    if (kingMoves[k] === true) {
                        continue
                    }
                    if (moves.some((move) => move.to.x === kingMoves[k].to.x && move.to.y === kingMoves[k].to.y)) {
                        kingMoves[k] = true;
                    }
                }
            }
        }


        console.log(kingMoves.every((move) => move === true))



        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = this.board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.enemyColor : this.color)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(convert[j], i+1);
                if (moves.some((move) => move.to.x === convert[coords[0]] && move.to.y === coords[1]+1)) {
                    checkmateAttacker.push([convert[j], i + 1])
                }

            }
        }

        console.log(checkmateAttacker)
        
        
        const canKingMove = kingMoves.length != 0
    }


    isInCheck(board, isMyMove) {

        const convert = {
            0:9, 1:8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8:1
        }

        let coords = isMyMove ? this.findPiece(board, this.kingId) : this.findPiece(board, this.enemyKingId);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.color : this.enemyColor)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(convert[j], i+1);
                if (moves.some((move) => move.to.x === convert[coords[0]] && move.to.y === coords[1]+1)) {
                    console.log("oute")
                    return true;
                }

            }
        }
        
        return false
    }

    makeBoard() {
        const side = this.thisPlayerIsBlack ? {
            0:'0', 1:'1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8:'8'
        } : {
            0:'8', 1:'7', 2: '6', 3: '5', 4: '4', 5: '3', 6: '2', 7: '1', 8:'0'
        }

        const midConvert = {1: 7, 7: 1}

        this.game.initialize();

        let board = []

        for (let i = 0; i < 9; i++) {
            let row = []
            for (let j = 0; j < 9; j++) {
                const canvasCoord = [((j+1) * 77 + 292), ((i+1) * 77 + 76)]
                const square = new Square(j, i, canvasCoord, null);
                row.push(square)
            }

            board.push(row)
        }

        const backRank = ["KY", "KE", "GI", "KI", "OU", "KI", "GI", "KE", "KY"]
        const midRank =  [""  , "KA", ""  , ""  , ""  , ""  , ""  , "HI", ""  ]

        for (let j = 0; j < 9; j += 8) {
            for (let i = 0; i < 9; i++) {
                if (j === 0) {
                    board[j][i].setPiece(new ShogiPiece(backRank[i], this.thisPlayerIsBlack ? "white" : "black", this.thisPlayerIsBlack ? "white" : "black", side[i] + side[j]))
                    if (i === 4) {
                        this.enemyKingId = side[i] + side[j]
                    }
                    if (i === 1 || i === 7) {
                        board[j + 1][i].setPiece(new ShogiPiece(midRank[midConvert[i]], this.thisPlayerIsBlack ? "white" : "black", this.thisPlayerIsBlack ? "white" : "black", side[i] + side[j + 1]))
                    }
                    board[j+2][i].setPiece(new ShogiPiece("FU", this.thisPlayerIsBlack ? "white" : "black", this.thisPlayerIsBlack ? "white" : "black", side[i] + side[j + 2]))
                } else {
                    board[j][i].setPiece(new ShogiPiece(backRank[i], this.thisPlayerIsBlack ? "black" : "white", this.thisPlayerIsBlack ? "black" : "white", side[i] + side[j]))
                    if (i === 4) {
                        this.kingId = side[i] + side[j]
                    }
                    if (i === 1 || i === 7) {
                        board[j - 1][i].setPiece(new ShogiPiece(midRank[i], this.thisPlayerIsBlack ? "black" : "white", this.thisPlayerIsBlack ? "black" : "white", side[i] + side[j - 1]))
                    }
                    board[j - 2][i].setPiece(new ShogiPiece("FU", this.thisPlayerIsBlack ? "black" : "white", this.thisPlayerIsBlack ? "black" : "white", side[i] + side[j - 2]))
                }
            }
        }
        
        return board
    }

    getBoard() {
        return this.board;
    }

    setBoard(board) {
        this.board = board;
    }

    //move piece to a given coordinate
    // pieceId
    // to : [x, y]
    movePiece(pieceId, to, isMyMove) {

        const side = isMyMove ? {
            0:0, 1:1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8:8
        } : {
            0:8, 1:7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8:0
        }

        const convert = {
            0:9, 1:8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8:1
        }

        let currentBoard = this.getBoard()
        let tmpBoard = this.cloneBoard(currentBoard);

        const pieceCoords = this.findPiece(currentBoard, pieceId)

        if (!pieceCoords) {
            return
        }

        const y = pieceCoords[1]
        const x = pieceCoords[0]

        const to_y = to[1]
        const to_x = to[0]

        if(x === to_x && y === to_y) {
            return "didn't move"
        } 
        
        const ogPiece = currentBoard[y][x].getPiece();
        
        try {
            
            this.game.move(convert[x], y+1, convert[to_x], to_y+1, false);
        } catch (error) {
            
            console.log(error)
            return "didn't move"
        }

        tmpBoard[y][x].removePiece();
        tmpBoard[to_y][to_x].setPiece(ogPiece);

        

        if (this.isInCheck(tmpBoard, isMyMove)) {
            if(isMyMove) {
                this.kingInCheck = true;
            } else {
                this.enemyKingInCheck = true;
            }
            this.game.unmove(convert[x], y+1, convert[to_x], to_y+1, false);
            this.setBoard(currentBoard)
            return "didn't move"
        }

        if(isMyMove) {
            this.kingInCheck = false;
        } else {
            this.enemyKingInCheck = false;
        }

        currentBoard[y][x].removePiece();
        currentBoard[to_y][to_x].setPiece(ogPiece);

        this.setBoard(currentBoard)
    }

    findPiece(board, pieceId) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (board[i][j].getPieceId() === pieceId) {
                    return [j, i]
                }
            }
        }
    }

    cloneBoard(board) {
        let newBoard = []
        for (let i = 0; i < 9; i++) {
            newBoard.push([])
            for (let j = 0; j < 9; j++) {
                newBoard[i].push(new Square(j, i, board[i][j].getCanvasCoord(), null));
                if (board[i][j].isOccupied()) {
                    newBoard[i][j].setPiece(board[i][j].getPiece().clone())
                }
            }
        }

        return newBoard
    }
}

export default ShogiGame