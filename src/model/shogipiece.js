import {promoteMap, unpromoteMap} from './promotions.js';
import {Color} from 'shogi.js';

class ShogiPiece {
    /* kinds:
        KY: Lance
        KE: Knight
        KA: Bishop
        HI: Rook
        FU: Pawn
        OU: King
        KI: Gold
        GI: Silver
    */
    
    constructor(kind, color, id) {
        this.kind = kind;
        this.color = color;
        this.id = id;
    }

    /**
     * Returns if the piece is promotable.
     */
    isPromotable() {
        return this.kind in promoteMap;
    }

    /**
     * Returns if the piece is promoted.
     */
    isPromoted() {
        return (["TO", "NY", "NK", "NG", "UM", "RY"].indexOf(this.kind) >= 0);
    }

    /**
     * Promotes this piece if it is promotable.
     */
    promote() {
        if (this.isPromotable()) {
            this.kind = promoteMap[this.kind];
        }
    }

    /**
     * Unpromotes this piece if it is promoted.
     */
    unpromote() {
        if (this.isPromoted()) {
            this.kind = unpromoteMap[this.kind];
        }
    }

    /**
     * Switches the color of the piece.
     */
    switchColor() {
        this.color = this.color === Color.Black ? Color.White : Color.Black;
    }

    /**
     * Returns a clone of this piece with the same kind, color and id.
     */
    clone() {
        return new ShogiPiece(this.kind, this.color, this.id);
    }
}

export default ShogiPiece