import { Shogi, Color } from 'shogi.js';
import Piece from '../ui/piece.js';
import ShogiPiece from './shogipiece.js'
import Square from './square.js';

/*
    TODO Unify coordinate systems
    Coordinate Systems:
    Library Game - 1-indexed (1-9) - File-Rank
    Board - 0-indexed (0-8) - Rank-File
*/

class ShogiGame {
    constructor(thisPlayerIsBlack) {
        this.thisPlayerIsBlack = thisPlayerIsBlack
        this.side_x = this.thisPlayerIsBlack ? {
            0: 9, 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
        } : {
            0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9
        }

        this.side_y = this.thisPlayerIsBlack ? {
            0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9
        } : {
            0: 9, 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
        }

        this.game = new Shogi();
        this.game.initialize();

        this.board = this.makeBoard();

        this.color = thisPlayerIsBlack ? Color.Black : Color.White;
        this.enemyColor = thisPlayerIsBlack ? Color.White : Color.Black;

        this.hand = []
        this.enemyHand = []

        
    }

    // Checks if the current board state would be a checkmate
    isCheckmate(isMyMove) {
        // all king moves are being attacked
        // attackers attacking the king cant be attacked
        // all drops wont remove check

        let allPseudoLegalMoves = [];

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = this.board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.enemyColor : this.color)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(this.side_x[j], this.side_y[i]);
                allPseudoLegalMoves = allPseudoLegalMoves.concat(moves)
            }
        }

        let allPseudoLegalDrops = this.game.getDropsBy((isMyMove ? this.enemyColor : this.color));

        for (let i = 0; i < allPseudoLegalMoves.length; i++) {
            if (this.checkForCheck([allPseudoLegalMoves[i].from.x, allPseudoLegalMoves[i].from.y], [allPseudoLegalMoves[i].to.x, allPseudoLegalMoves[i].to.y], isMyMove)) {
                continue
            } else {
                console.log("not checkmate")
                return false
            }
        }

        for (let i = 0; i < allPseudoLegalDrops.length; i++) {
            if (this.checkForCheckDrop([allPseudoLegalMoves[i].to.x, allPseudoLegalMoves[i].to.y], isMyMove)) {
                continue
            } else {
                console.log("not checkmate")
                return false
            }
        }

        return true

        
        // Find any locations where a drop can block the attackers and remove check.
    }

    // Figures out if the current player is in check.
    isInCheck(board, isMyMove) {

        // Finds if there are any pieces that are attacking the king.
        let coords = isMyMove ? this.findPieceOnBoard(board, this.kingId) : this.findPieceOnBoard(board, this.enemyKingId);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.color : this.enemyColor)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(this.side_x[j], this.side_y[i]);
                if (moves.some((move) => move.to.x === this.side_x[coords[0]] && move.to.y === this.side_y[coords[1]])) {
                    console.log("oute")
                    return true;
                }

            }
        }
        
        return false
    }

    // Creates the board with the correct pieces and squares and returns it.
    makeBoard() {

        const midConvert = {1: 7, 7: 1}

        let board = []

        for (let i = 0; i < 9; i++) {
            let row = []
            for (let j = 0; j < 9; j++) {
                const canvasCoord = [((j+1) * 77 + 492), ((i+1) * 77 + 76)]
                const square = new Square(this.side_x[j], this.side_y[i], canvasCoord, null);
                row.push(square)
            }

            board.push(row)
        }

        const backRank = ["KY", "KE", "GI", "KI", "OU", "KI", "GI", "KE", "KY"]
        const midRank =  [""  , "KA", ""  , ""  , ""  , ""  , ""  , "HI", ""  ]

        for (let j = 0; j < 9; j += 8) {
            for (let i = 0; i < 9; i++) {
                if (j === 0) {
                    board[j][i].setPiece(new ShogiPiece(backRank[i], this.thisPlayerIsBlack ? Color.White : Color.Black, this.thisPlayerIsBlack ? Color.White : Color.Black, String(this.side_x[i]) + String(this.side_y[j])))
                    if (i === 4) {
                        this.enemyKingId = String(this.side_x[i]) + String(this.side_y[j])
                    }
                    if (i === 1 || i === 7) {
                        board[j + 1][i].setPiece(new ShogiPiece(midRank[midConvert[i]], this.thisPlayerIsBlack ? Color.White : Color.Black, this.thisPlayerIsBlack ? Color.White : Color.Black, String(this.side_x[i]) + String(this.side_y[j+1])))
                    }
                    board[j+2][i].setPiece(new ShogiPiece("FU", this.thisPlayerIsBlack ? Color.White : Color.Black, this.thisPlayerIsBlack ? Color.White : Color.Black, String(this.side_x[i]) + String(this.side_y[j + 2])))
                } else {
                    board[j][i].setPiece(new ShogiPiece(backRank[i], this.thisPlayerIsBlack ? Color.Black : Color.White, this.thisPlayerIsBlack ? Color.Black : Color.White, String(this.side_x[i]) + String(this.side_y[j])))
                    if (i === 4) {
                        this.kingId = String(this.side_x[i]) + String(this.side_y[j])
                    }
                    if (i === 1 || i === 7) {
                        board[j - 1][i].setPiece(new ShogiPiece(midRank[i], this.thisPlayerIsBlack ? Color.Black : Color.White, this.thisPlayerIsBlack ? Color.Black : Color.White, String(this.side_x[i]) + String(this.side_y[j - 1])))
                    }
                    board[j - 2][i].setPiece(new ShogiPiece("FU", this.thisPlayerIsBlack ? Color.Black : Color.White, this.thisPlayerIsBlack ? Color.Black : Color.White, String(this.side_x[i]) + String(this.side_y[j - 2])))
                }
            }
        }
        
        return board
    }

    // Returns the board contained in this game object.
    getBoard() {
        return this.board;
    }

    // Sets the board contained in this game object to the given board.
    setBoard(board) {
        this.board = board;
    }

    getHand() {
        return this.hand;
    }

    getEnemyHand() {
        return this.enemyHand;
    }

    checkForCheck(from, to, isMyMove) {
        const reverse_side_x = this.thisPlayerIsBlack ? {
            9: 0, 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8
        } : {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        }

        const reverse_side_y = this.thisPlayerIsBlack ? {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        } : {
            9: 0, 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8
        }

        let currentBoard = this.getBoard();
        let tmpBoard = this.cloneBoard(currentBoard);

        const y = reverse_side_y[from[1]];
        const x = reverse_side_x[from[0]];

        const to_y = reverse_side_y[to[1]];
        const to_x = reverse_side_x[to[0]];
        
        const ogPiece = currentBoard[y][x].getPiece();
        const capPiece = currentBoard[to_y][to_x].getPiece() != null ? currentBoard[to_y][to_x].getPiece().name : false

        tmpBoard[y][x].removePiece();
        tmpBoard[to_y][to_x].setPiece(ogPiece);


        this.game.move(this.side_x[x], this.side_y[y], this.side_x[to_x], this.side_y[to_y], false);


        if (this.isInCheck(tmpBoard, isMyMove)) {
            this.game.unmove(this.side_x[x], this.side_y[y], this.side_x[to_x], this.side_y[to_y], false, capPiece);
            return true;
        }

        this.game.unmove(this.side_x[x], this.side_y[y], this.side_x[to_x], this.side_y[to_y], false, capPiece);
        return false
    }

    checkForCheckDrop(to, isMyMove) {
        const reverse_side_x = this.thisPlayerIsBlack ? {
            9: 0, 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8
        } : {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        }

        const reverse_side_y = this.thisPlayerIsBlack ? {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        } : {
            9: 0, 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8
        }

        let currentBoard = this.getBoard();
        let tmpBoard = this.cloneBoard(currentBoard);

        const to_y = reverse_side_y[to[1]];
        const to_x = reverse_side_x[to[0]];

        tmpBoard[to_y][to_x].setPiece(new ShogiPiece("FU", null, isMyMove ? this.enemyColor : this.color, '00'));

        this.game.drop(to[0], to[1], "HI")

        if (this.isInCheck(tmpBoard, isMyMove)) {
            this.game.undrop(to[0], to[1])
            return true;
        }

        this.game.undrop(to[0], to[1])
        return false
    }

    //move piece to a given coordinate
    // pieceId
    // to : [x, y]
    movePiece(pieceId, to, isMyMove) {

        if (to === false) {
            return "didn't move"
        }

        // Clones the board 
        let currentBoard = this.getBoard()

        const pieceCoords = this.findPieceOnBoard(this.getBoard(), pieceId)


        if (!pieceCoords) {
            return this.dropPiece(pieceId, to, isMyMove, currentBoard);
        }

        let tmpBoard = this.cloneBoard(currentBoard);

        const to_y = to[1]
        const to_x = to[0]

        const y = pieceCoords[1]
        const x = pieceCoords[0]

        if(x === to_x && y === to_y) {
            return "didn't move"
        } 
        
        const ogPiece = currentBoard[y][x].getPiece();
        const capPiece = currentBoard[to_y][to_x].getPiece() != null ? currentBoard[to_y][to_x].getPiece().name : false
        
        // Attempts to check if the move is valid in the library
        try {
            
            this.game.move(this.side_x[x], this.side_y[y], this.side_x[to_x], this.side_y[to_y], false);
        } catch (error) {
            
            console.log(error)
            return "didn't move"
        }

        // Makes a move on the temporary board to check if it would put the current player in check.
        tmpBoard[y][x].removePiece();
        tmpBoard[to_y][to_x].setPiece(ogPiece);

        if (this.isInCheck(tmpBoard, isMyMove)) {
            this.game.unmove(this.side_x[x], this.side_y[y], this.side_x[to_x], this.side_y[to_y], false, capPiece);
            return "didn't move"
        }

        // Makes the move on the current board if there are no issues.
        currentBoard[y][x].removePiece();
        const pieceToHand = currentBoard[to_y][to_x].setPiece(ogPiece);

        if (pieceToHand != false) {
            if (!isMyMove) {
                const r = (Math.floor(this.enemyHand.length / 6)) + 1;
                const c = (this.enemyHand.length % 6) + 1;
                this.enemyHand.push(new Square(0, 0, [-(c*30) + 472, (r*60) + 86], pieceToHand))
            } else {
                const r = (Math.floor(this.hand.length / 6)) + 1;
                const c = (this.hand.length % 6) + 1;
                this.hand.push(new Square(0, 0, [(c*30) + 1282, -(r*60) + 829], pieceToHand))
            }
        }

        this.setBoard(currentBoard)
    }
    
    dropPiece(pieceId, to, isMyMove, currentBoard) {
        const to_y = to[1]
        const to_x = to[0]

        let currentHand = isMyMove ? this.hand : this.enemyHand;
        const pieceLoc = this.findPieceInHand(currentHand, pieceId);

        if (pieceLoc === false) {

            return
        } else {
            const droppingPiece = currentHand[pieceLoc].getPiece()
            
            const pieceType = droppingPiece.name

            try {
                this.game.drop(this.side_x[to_x], this.side_y[to_y], pieceType)
            } catch (error) {
                
                console.log(error)
                return "didn't move"
            }

            let tmpBoard = this.cloneBoard(currentBoard);

            tmpBoard[to_y][to_x].setPiece(droppingPiece);
            
            if (this.isInCheck(tmpBoard, isMyMove)) {
                this.game.undrop(this.side_x[to_x], this.side_y[to_y]);
                return "didn't move"
            }

            currentBoard[to_y][to_x].setPiece(droppingPiece);

            currentHand.splice(pieceLoc, 1);
            if (!isMyMove) {
                this.enemyHand = currentHand;
            } else {
                this.hand = currentHand;
            }

            this.rearrangeHands();

            this.setBoard(currentBoard);

            return "needs update"
        }
    }

    rearrangeHands() {
        for (let i = 0; i < this.enemyHand.length; i++) {
            const r = (Math.floor(i / 6)) + 1;
            const c = (i % 6) + 1;
            this.enemyHand[i].setCanvasCoord([-(c*30) + 472, (r*60) + 86])
        }

        for (let i = 0; i < this.hand.length; i++) {
            const r = (Math.floor(i / 6)) + 1;
            const c = (i % 6) + 1;
            this.hand[i].setCanvasCoord([(c*30) + 1282, -(r*60) + 829])
        }
    }

    // Finds a piece of the given piece id on the given board and returns the coordinates.
    findPieceOnBoard(board, pieceId) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (board[i][j].getPieceId() === pieceId) {
                    return [j, i]
                }
            }
        }

        return false;
    }

    findPieceInHand(hand, pieceId) {
        for (var i = 0; i < hand.length; i++) {
            if (hand[i].getPieceId() === pieceId) {
                return i;
            }
        }

        return false;
    }

    

    // Clones a given board and returns a deep copy.
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