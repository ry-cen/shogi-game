import { Color } from "shogi.js";

class Square {
    constructor(x, y, canvasCoord, piece) {
        this.x = x;
        this.y = y;
        this.canvasCoord = canvasCoord;
        this.piece = piece;
    }

    // Sets the piece that is currently on this square.
    setPiece(newPiece) {
        if (newPiece === null & this.piece === null) {
            return false;
        } else if (newPiece === null) {
            // use remove piece
            return false;
        } else if (this.piece === null) {
            this.piece = newPiece;
            this.piece.setSquare(this);
            return false;
        } else {
            var tempPiece = this.piece;
            this.piece = newPiece;
            this.piece.setSquare(this);
            tempPiece.color = tempPiece.color === Color.Black ? Color.White : Color.Black;
            return tempPiece;
        }
    }

    // Removes the piece that is currently on this square.
    removePiece() {
        this.piece.setSquare(null);
        this.piece = null;
    }

    // Returns the piece that is currently on this square.
    getPiece() {
        return this.piece;
    }

    // Returns the id of the piece that is currently on this square.
    getPieceId() {
        if (this.piece === null) {
            return "empty"
        }

        return this.piece.id
    }

    setCanvasCoord(newCoords) {
        this.canvasCoord = newCoords;
    }

    // Returns the canvas coordinates of this square.
    getCanvasCoord() {
        return this.canvasCoord;
    }

    // Returns the game coordinate (rank and file) of this square.
    getCoord() {
        return [this.x, this.y];
    }

    // Returns whether or not this square is occupied by a piece.
    isOccupied() {
        return this.piece != null;
    }
}

export default Square