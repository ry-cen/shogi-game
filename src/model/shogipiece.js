import { promoteMap } from "./promotions";

class ShogiPiece {
    /* names:
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

    // Sets the square that this piece resides on.
    setSquare(newSquare) {
        this.square = newSquare;
    }


    // TODO Promotes this piece if it is promotable.
    promote() {
        if (this.promotable) {
            this.name = promoteMap[this.name]
            this.promoted = true
        }
    }

    // TODO Sends this piece to the hand that is given
    toHand(hand) {
        this.color = hand.color
        this.square = hand
    }

    // Returns a clone of this piece with the same name, originalColor, color and id.
    clone() {
        return new ShogiPiece(this.name, this.originalColor, this.color, this.id)
    }
}

export default ShogiPiece