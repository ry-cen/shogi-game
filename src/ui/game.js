import React from "react";
import Piece from "./piece.js";
import ShogiGame from "../model/shogigame.js"
import BoardPic from "../assets/board.png"
import imagemap from "./imagemap.js"
import { Stage, Layer, Group } from "react-konva";
import { Color } from "shogi.js";



class Game extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            gameState: new ShogiGame(this.props.thisPlayerIsBlack),
            playersTurnIsBlack: true,
            draggedPieceTargetId: "",
            gameKey: 0
        }
    }


    startDragging = (e) => {
        e.target.moveToTop();
        this.setState({
            draggedPieceTargetId: e.target.attrs.id,
            tempGameState: this.state.gameState
        })
    }

    endDragging = (e) => {
        const currentGame = this.state.gameState;
        const currentBoard = currentGame.getBoard();
        const position = this.triangulate(e.target.x()+77, e.target.y()+77, currentBoard);
        const selectedId = this.state.draggedPieceTargetId;
        
        this.movePiece(selectedId, position, currentGame, this.state.playersTurnIsBlack);
    }

    movePiece = (selectedId, position, currentGame, isMyMove) => {

        const update = currentGame.movePiece(selectedId, position, isMyMove)

        if (update === "needs update") {
            this.setState({
                gameKey: this.state.gameKey === 1 ? 0 : 1
            })
        }

        if (update === "didn't move") {
            this.setState({
                gameKey: this.state.gameKey === 1 ? 0 : 1,
                draggedPieceTargetId: ""
            })
            return
        }

        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame,
           
        })

        if (currentGame.isInCheck(currentGame.getBoard(), !isMyMove)) {
            if (currentGame.isCheckmate(!isMyMove)) {
                console.log("checkmate")
            }
        }

        this.props.playAudio()

        this.setState({
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })

    }



    triangulate = (x, y, board) => {
        var hashmap = {}
        var shortestDistance = Infinity
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                const canvasCoord = board[i][j].getCanvasCoord()
                const delta_x = canvasCoord[0] - x 
                const delta_y = canvasCoord[1] - y
                const newDistance = Math.sqrt(delta_x**2 + delta_y**2)
                hashmap[newDistance] = [j, i]
                if (newDistance < shortestDistance) {
                    shortestDistance = newDistance
                }
            }
        }

        if (shortestDistance > 50) {
            return false
        }

        return hashmap[shortestDistance]
    }

    
    render() {
        return(
            <div style={{
                backgroundImage: `url(${BoardPic})`,
                backgroundPosition: "Center",
                backgroundRepeat: "no-repeat",
                width: "1600px",
                height: "768px",
            }}>
                <Stage width={1600} height={768}>
                    <Layer>
                    {this.state.gameState.getBoard().map((row) => {
                        return (<React.Fragment>
                                {row.map((square) => {
                                    if (square.isOccupied()) {                                    
                                        return (
                                            <Piece
                                                name = {square.getPiece().name}
                                                x = {square.getCanvasCoord()[0]-77}
                                                y = {square.getCanvasCoord()[1]-77}
                                                imgurls = {imagemap[(square.getPiece().promoted ? 1 : 0)][square.getPiece().name]}
                                                isBlack = {square.getPiece().color === Color.Black}
                                                gameKey = {this.state.gameKey}
                                                onDragStart = {this.startDragging}
                                                onDragEnd = {this.endDragging}
                                                draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                id = {square.getPieceId()}
                                                thisPlayersColorBlack = {this.state.gameState.thisPlayerIsBlack}
                                                playersTurnIsBlack = {this.state.playersTurnIsBlack}
                                            />)
                                    }
                                    return
                                })}
                            </React.Fragment>)
                    })}
                    {this.state.gameState.getHand().map((square) => {
                                    if (square.isOccupied()) {                                    
                                        return (
                                            <Piece
                                                name = {square.getPiece().name}
                                                x = {square.getCanvasCoord()[0]-77}
                                                y = {square.getCanvasCoord()[1]-77}
                                                imgurls = {imagemap[(square.getPiece().promoted ? 1 : 0)][square.getPiece().name]}
                                                isBlack = {square.getPiece().color === Color.Black}
                                                gameKey = {this.state.gameKey}
                                                onDragStart = {this.startDragging}
                                                onDragEnd = {this.endDragging}
                                                draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                id = {square.getPieceId()}
                                                thisPlayersColorBlack = {this.state.gameState.thisPlayerIsBlack}
                                                playersTurnIsBlack = {this.state.playersTurnIsBlack}
                                            />)
                                    }
                                    return
                    })}
                    {this.state.gameState.getEnemyHand().map((square) => {
                                    if (square.isOccupied()) {                                    
                                        return (
                                            <Piece
                                                name = {square.getPiece().name}
                                                x = {square.getCanvasCoord()[0]-77}
                                                y = {square.getCanvasCoord()[1]-77}
                                                imgurls = {imagemap[(square.getPiece().promoted ? 1 : 0)][square.getPiece().name]}
                                                isBlack = {square.getPiece().color === Color.Black}
                                                gameKey = {this.state.gameKey}
                                                onDragStart = {this.startDragging}
                                                onDragEnd = {this.endDragging}
                                                draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                id = {square.getPieceId()}
                                                thisPlayersColorBlack = {this.state.gameState.thisPlayerIsBlack}
                                                playersTurnIsBlack = {this.state.playersTurnIsBlack}
                                            />)
                                    }
                                    return
                    })}
                    </Layer>
                </Stage>
            </div>
        )
    }
}

export default Game;