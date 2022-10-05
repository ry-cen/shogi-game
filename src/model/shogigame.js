import { Shogi, Color } from 'shogi.js';
import ShogiPiece from './shogipiece.js';
import Square from './square.js';

/*
    BOARD IS ALWAYS FROM BLACK POV
    Coordinate Systems:
    Library Game - 1-indexed (1-9) - File-Rank
    Board - 0-indexed (0-8) - Rank-File
*/

const conv_x = {
    0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9
}

const conv_y = {
    0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9
}

class ShogiGame {
    constructor(thisPlayerIsBlack) {
        this.thisPlayerIsBlack = thisPlayerIsBlack

        // Side based conversions to sync board with game instance.
        this.game = new Shogi();
        this.game.initialize();

        this.kings = {};
        this.board = this.makeBoard();
        this.color = thisPlayerIsBlack ? Color.Black : Color.White;
        this.enemyColor = thisPlayerIsBlack ? Color.White : Color.Black;

        this.hand = [];
        this.enemyHand = [];

        
    }

    // Checks if the current board state would be a checkmate
    isCheckmate(isMyMove) {

        let allPseudoLegalMoves = [];

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = this.board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.enemyColor : this.color)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(conv_x[j], conv_y[i]);
                allPseudoLegalMoves = allPseudoLegalMoves.concat(moves)
            }
        }

        let allPseudoLegalDrops = this.game.getDropsBy((isMyMove ? this.color : this.enemyColor));

        for (let i = 0; i < allPseudoLegalMoves.length; i++) {
            if (this.checkForCheck([allPseudoLegalMoves[i].from.x, allPseudoLegalMoves[i].from.y], [allPseudoLegalMoves[i].to.x, allPseudoLegalMoves[i].to.y], isMyMove)) {
                continue
            } else {
                return false
            }
        }

        for (let i = 0; i < allPseudoLegalDrops.length; i++) {
            if (this.checkForCheckDrop([allPseudoLegalDrops[i].to.x, allPseudoLegalDrops[i].to.y], isMyMove, allPseudoLegalDrops[i].kind)) {
                continue
            } else {
                return false
            }
        }

        return true

    }

    // Figures out if the current player is in check.
    isInCheck(board, isMyMove) {

        // Finds if there are any pieces that are attacking the king.
        let coords = isMyMove ? this.findPieceOnBoard(board, this.kings[this.color]) : this.findPieceOnBoard(board, this.kings[this.enemyColor]);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = board[i][j].getPiece();
                if (!piece || piece.color === (isMyMove ? this.color : this.enemyColor)) {
                    continue;
                }
                const moves = this.game.getMovesFrom(conv_x[j], conv_y[i]);
                if (moves.some((move) => move.to.x === conv_x[coords[0]] && move.to.y === conv_y[coords[1]])) {
                    return true;
                }

            }
        }
        
        return false
    }

    // Creates the board with the correct pieces and squares and returns it.
    makeBoard() {

        let board = []

        for (let i = 0; i < 9; i++) {
            let row = []
            for (let j = 0; j < 9; j++) {
                const canvasCoord = this.thisPlayerIsBlack ? [(((8-j)+1) * 77 + 375), ((i+1) * 77 + 76)] : [1366 - (((8-j)-1) * 77 + 375), 768 - ((i-1) * 77 + 76)]
                const square = new Square(j, i, canvasCoord, null);
                row.push(square)
            }

            board.push(row)
        }
        
        for (let j = 0; j < 9; j++) {
            for (let i = 0; i < 9; i++) {
                if (this.game.board[8-i][j] !== null) {
                    board[j][i].setPiece(new ShogiPiece(String(this.game.board[i][j].kind), this.game.board[i][j].color, String(conv_x[i]) + String(conv_y[j+1])))

                    if(this.game.board[8-i][j].kind === "OU") {
                        this.kings[this.game.board[i][j].color] = String(conv_x[i]) + String(conv_y[j+1])
                    }
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
        const reverse_conv_x = {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        }

        const reverse_conv_y = {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        }

        let currentBoard = this.getBoard();
        let tmpBoard = this.cloneBoard(currentBoard);

        const y = reverse_conv_y[from[1]];
        const x = reverse_conv_x[from[0]];

        const to_y = reverse_conv_y[to[1]];
        const to_x = reverse_conv_x[to[0]];
        
        const ogPiece = currentBoard[y][x].getPiece();
        const capPiece = currentBoard[to_y][to_x].getPiece() != null ? currentBoard[to_y][to_x].getPiece().kind : false

        tmpBoard[y][x].removePiece();
        tmpBoard[to_y][to_x].setPiece(ogPiece);


        this.game.move(conv_x[x], conv_y[y], conv_x[to_x], conv_y[to_y], false);


        if (this.isInCheck(tmpBoard, isMyMove)) {
            this.game.unmove(conv_x[x], conv_y[y], conv_x[to_x], conv_y[to_y], false, capPiece);
            return true;
        }

        this.game.unmove(conv_x[x], conv_y[y], conv_x[to_x], conv_y[to_y], false, capPiece);
        return false
    }

    checkForCheckDrop(to, isMyMove, kind) {
        const reverse_conv_x = {
            9: 0, 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8
        }

        const reverse_conv_y = {
            1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8
        }

        let currentBoard = this.getBoard();
        let tmpBoard = this.cloneBoard(currentBoard);

        const to_y = reverse_conv_y[to[1]];
        const to_x = reverse_conv_x[to[0]];

        tmpBoard[to_y][to_x].setPiece(new ShogiPiece(kind, isMyMove ? this.enemyColor : this.color, 'temp'));

        this.game.drop(to[0], to[1], kind)

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
    movePiece(pieceId, to, isMyMove, promote) {

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
        const capPiece = currentBoard[to_y][to_x].getPiece() != null ? currentBoard[to_y][to_x].getPiece().kind : false
        
        // Attempts to check if the move is valid in the library
        try {
            console.log(conv_x[x], conv_y[y], "to", conv_x[to_x], conv_y[to_y]);
            this.game.move(conv_x[x], conv_y[y], conv_x[to_x], conv_y[to_y], promote);
        } catch (error) {
            
            console.log(error)
            return "didn't move"
        }

        // Makes a move on the temporary board to check if it would put the current player in check.
        tmpBoard[y][x].removePiece();
        tmpBoard[to_y][to_x].setPiece(ogPiece);

        if (this.isInCheck(tmpBoard, isMyMove)) {
            this.game.unmove(conv_x[x], conv_y[y], conv_x[to_x], conv_y[to_y], promote, capPiece);
            return "didn't move"
        }

        // Makes the move on the current board if there are no issues.
        currentBoard[y][x].removePiece();
        const pieceToHand = currentBoard[to_y][to_x].setPiece(ogPiece);

        if(this.isDeadEnd(ogPiece.kind, ogPiece.color, to_y) && !ogPiece.isPromoted()) {
            currentBoard[to_y][to_x].getPiece().promote();
        }

        // For socket io moves.
        if (promote) {
            currentBoard[to_y][to_x].getPiece().promote();;
        }

        if (pieceToHand != false) {
            if (!isMyMove) {
                const r = (Math.floor(this.enemyHand.length / 6)) + 1;
                const c = (this.enemyHand.length % 6) + 1;
                this.enemyHand.push(new Square(0, 0, [-(c*30) + 350, (r*60) + 86], pieceToHand))
            } else {
                const r = (Math.floor(this.hand.length / 6)) + 1;
                const c = (this.hand.length % 6) + 1;
                this.hand.push(new Square(0, 0, [(c*30) + 1170, -(r*60) + 829], pieceToHand))
            }
        }

        this.setBoard(currentBoard)

        if (this.isPromoteRank(ogPiece.color, to_y, y) && ogPiece.isPromotable() && isMyMove && !promote) {
            return "handle promotion"
        }
    }

    // Promotes a piece on the board and game engine at a location.
    promotePiece(pieceLoc) {
        console.log(pieceLoc)
        this.board[pieceLoc[1]][pieceLoc[0]].getPiece().promote()
        this.game.board[pieceLoc[0]][pieceLoc[1]].promote()
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
            
            const pieceType = droppingPiece.kind

            try {
                this.game.drop(conv_x[to_x], conv_y[to_y], pieceType)
            } catch (error) {
                
                console.log(error)
                return "didn't move"
            }

            let tmpBoard = this.cloneBoard(currentBoard);

            tmpBoard[to_y][to_x].setPiece(droppingPiece);
            
            if (this.isInCheck(tmpBoard, isMyMove)) {
                this.game.undrop(conv_x[to_x], conv_y[to_y]);
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
            this.enemyHand[i].setCanvasCoord([-(c*30) + 350, (r*60) + 86])
        }

        for (let i = 0; i < this.hand.length; i++) {
            const r = (Math.floor(i / 6)) + 1;
            const c = (i % 6) + 1;
            this.hand[i].setCanvasCoord([(c*30) + 1170, -(r*60) + 829])
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

    findPieceKindOnBoard(pieceId) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (this.board[i][j].getPieceId() === pieceId) {
                    return this.board[i][j].getPiece().kind
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

    // Returns if piece should be promoted because of dead end.
    isDeadEnd(kind, color, y) {
        let deadEndY = color === Color.Black ? {"KE": 1, "FU": 0, "KY": 0} : {"KE": 7, "FU": 8, "KY": 8};

        return color === Color.Black ? y <= deadEndY[kind] : y >= deadEndY[kind];

    }

    isPromoteRank(color, to_y, y) {
        return ((color === Color.Black) ? (to_y <= 2) : (to_y >= 6)) || ((color === Color.Black) ? (y <= 2) : (y >= 6));
    }

    

    // Clones a given board and returns a copy of piece locations.
    cloneBoard(board) {
        let newBoard = []
        for (let i = 0; i < 9; i++) {
            newBoard.push([])
            for (let j = 0; j < 9; j++) {
                newBoard[i].push(new Square(j, i, null, null));
                if (board[i][j].isOccupied()) {
                    newBoard[i][j].setPiece(board[i][j].getPiece().clone())
                }
            }
        }

        return newBoard
    }

}

export default ShogiGame