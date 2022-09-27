class Square {
    constructor(x, y, canvasCoord, piece) {
        this.x = x;
        this.y = y;
        this.canvasCoord = canvasCoord;
        this.piece = piece;
    }

    //returns True if capture
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
            this.piece = newPiece;
            this.piece.setSquare(this);
            return true;
        }
    }

    removePiece() {
        this.piece.setSquare(null);
        this.piece = null;
    }

    getPiece() {
        return this.piece;
    }

    getPieceId() {
        if (this.piece === null) {
            return "empty"
        }

        return this.piece.id
    }

    getCanvasCoord() {
        return this.canvasCoord;
    }

    getCoord() {
        return [this.x, this.y];
    }

    isOccupied() {
        return this.piece != null;
    }
}

export default Square