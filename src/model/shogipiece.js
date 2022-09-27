import { promoteMap } from "./promotions";

class ShogiPiece {
    /* ids:
        KY: Lance
        KE: Knight
        KA: Bishop
        HI: Rook
        FU: Pawn
        OU: King
        KI: Gold
        GI: Silver
    */
    constructor(name, originalColor, color, id, promoted = false) {
        this.name = name;
        this.originalColor = originalColor;
        this.color = color;
        this.id = id;
        this.promotable = name in promoteMap;
        if(this.promotable) {
            this.promoted = promoted
        }
    }

    setSquare(newSquare) {
        this.square = newSquare;
    }

    promote() {
        if (this.promotable) {
            this.name = promoteMap[this.name]
            this.promoted = true
        }
    }

    toHand(hand) {
        this.color = hand.color
        this.square = hand
    }

    clone() {
        return new ShogiPiece(this.name, this.originalColor, this.color, this.id)
    }
}

export default ShogiPiece