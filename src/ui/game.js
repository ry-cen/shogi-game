import React from "react";
import Piece from "./piece.js";
import { promoteMap } from "../model/promotions.js";
import PromotionImage from "./promotionImage.js";
import ShogiGame from "../model/shogigame.js"
import BoardPic from "../assets/brownboard.png"
import imagemap from "./imagemap.js"
import { Stage, Layer, Image, Rect, Text } from "react-konva";
import { Color } from "shogi.js";



class Game extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            gameState: new ShogiGame(this.props.thisPlayerIsBlack),
            playersTurnIsBlack: true,
            draggedPieceTargetId: "",
            gameKey: 0,
            boardImage: new window.Image(),
            hoverTarget: "",
            piecesDraggable: true,
            pieceUpForPromotion: "",
            pieceUpForPromotionLoc: "",
            promotionScreenShow: false,
            winScreen: ""
        }

        this.state.boardImage.src = BoardPic;
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
        
        this.movePiece(selectedId, position, currentGame, this.props.thisPlayerIsBlack === this.state.playersTurnIsBlack);
    }

    movePiece = (selectedId, position, currentGame, isMyMove, promote = false) => {

        const update = currentGame.movePiece(selectedId, position, isMyMove, promote)

        if (update === "needs update") {
            this.setState({
                gameKey: this.state.gameKey === 1 ? 0 : 1
            })
        } else if (update === "didn't move") {
            this.setState({
                gameKey: this.state.gameKey === 1 ? 0 : 1,
                draggedPieceTargetId: ""
            })
            return
        }

        if (currentGame.isInCheck(currentGame.getBoard(), !isMyMove)) {
            if (currentGame.isCheckmate(!isMyMove)) {
                this.setState({
                    gameKey: this.state.gameKey === 1 ? 0 : 1,
                    pieceUpForPromotion: "",
                    pieceUpForPromotionLoc: "",
                    piecesDraggable: false,
                    promotionScreenShow: false,
                    winScreen: isMyMove === this.props.thisPlayerIsBlack ? "Black" : "White"
                })

                return
            }
        }
        
        
        if (update === "handle promotion") {
            let promotePiece = currentGame.findPieceKindOnBoard(selectedId)
            this.setState({
                gameKey: this.state.gameKey === 1 ? 0 : 1,
                draggedPieceTargetId: "",
                pieceUpForPromotion: promotePiece,
                pieceUpForPromotionLoc: position,
                piecesDraggable: false,
                promotionScreenShow: true,
                gameState: currentGame
            })
            return
        }

        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame
        })

        this.props.playAudio()

        this.setState({
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })

    }



    triangulate = (x, y, board) => {
        let hashmap = {}
        let shortestDistance = Infinity
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
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

    handleNoPromotion = () => {
        this.setState({
            pieceUpForPromotion: "",
            pieceUpForPromotionLoc: "",
            piecesDraggable: true,
            promotionScreenShow: false,
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })
    }

    handlePromotion = () => {
        this.state.gameState.promotePiece(this.state.pieceUpForPromotionLoc)
        this.setState({
            pieceUpForPromotion: "",
            pieceUpForPromotionLoc: "",
            piecesDraggable: true,
            promotionScreenShow: false,
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })

        let currentGame = this.state.gameState
        if (currentGame.isInCheck(currentGame.getBoard(), false)) {
            if (currentGame.isCheckmate(false)) {
                this.setState({
                    pieceUpForPromotion: "",
                    pieceUpForPromotionLoc: "",
                    piecesDraggable: false,
                    promotionScreenShow: false,
                    winScreen: this.props.thisPlayerIsBlack ? "Black" : "White"
                })
            }
        }

    }

    handleMouseEnter = (e) => {
        this.setState({
            hoverTarget: e.target.attrs.id
        })
    }

    handleMouseLeave = () => {
        this.setState({
            hoverTarget: ""
        })
    }

    
    render() {
        return(
            <div>
                <Stage width={1366} height={768}>
                    <Layer>
                        <Image image={this.state.boardImage} x={299} />
                        <Rect width={250} height={250} x={43} y={10} fill="#9c7b62"/>
                        <Rect width={250} height={250} x={1073} y={508} fill="#9c7b62"/>
                        {this.state.gameState.getBoard().map((row) => {
                            return (<React.Fragment>
                                    {row.map((square) => {
                                        if (square.isOccupied()) {                       
                                            return (
                                                <Piece
                                                    kind = {square.getPiece().kind}
                                                    x = {square.getCanvasCoord()[0]-77}
                                                    y = {square.getCanvasCoord()[1]-77}
                                                    imgurls = {imagemap[square.getPiece().kind]}
                                                    isBlack = {square.getPiece().color === Color.Black}
                                                    gameKey = {this.state.gameKey}
                                                    onDragStart = {this.startDragging}
                                                    onDragEnd = {this.endDragging}
                                                    draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                    piecesDraggable = {this.state.piecesDraggable}
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
                                                    kind = {square.getPiece().kind}
                                                    x = {square.getCanvasCoord()[0]-77}
                                                    y = {square.getCanvasCoord()[1]-77}
                                                    imgurls = {imagemap[square.getPiece().kind]}
                                                    isBlack = {square.getPiece().color === Color.Black}
                                                    gameKey = {this.state.gameKey}
                                                    onDragStart = {this.startDragging}
                                                    onDragEnd = {this.endDragging}
                                                    draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                    piecesDraggable = {this.state.piecesDraggable}
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
                                                    kind = {square.getPiece().kind}
                                                    x = {square.getCanvasCoord()[0]-77}
                                                    y = {square.getCanvasCoord()[1]-77}
                                                    imgurls = {imagemap[square.getPiece().kind]}
                                                    isBlack = {square.getPiece().color === Color.Black}
                                                    gameKey = {this.state.gameKey}
                                                    onDragStart = {this.startDragging}
                                                    onDragEnd = {this.endDragging}
                                                    draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                    piecesDraggable = {this.state.piecesDraggable}
                                                    id = {square.getPieceId()}
                                                    thisPlayersColorBlack = {this.state.gameState.thisPlayerIsBlack}
                                                    playersTurnIsBlack = {this.state.playersTurnIsBlack}
                                                />)
                                        }
                                        return
                        })}
                        {(this.state.promotionScreenShow) ?
                            <div>
                                <Rect width={1366} height={300} y={234} fill={"#000000AA"}/>
                                <PromotionImage
                                    id = {1}
                                    imgurls = {imagemap[this.state.pieceUpForPromotion]}
                                    gameKey = {this.state.gameKey}
                                    onClick = {this.handleNoPromotion}
                                    onMouseEnter = {this.handleMouseEnter}
                                    onMouseLeave = {this.handleMouseLeave}
                                    hoverTarget = {this.state.hoverTarget}
                                    x={533}
                                    y={384}
                                />
                                <PromotionImage
                                    id = {2}
                                    imgurls = {imagemap[promoteMap[this.state.pieceUpForPromotion]]}
                                    gameKey = {this.state.gameKey}
                                    onClick = {this.handlePromotion}
                                    onMouseEnter = {this.handleMouseEnter}
                                    onMouseLeave = {this.handleMouseLeave}
                                    hoverTarget = {this.state.hoverTarget}
                                    x={833}
                                    y={384}

                                />
                            </div> 
                            : ""
                        }
                        {(this.state.winScreen !== "") ?
                            <div>
                                <Rect width={1366} height={300} y={234} fill={"#000000AA"}/>
                                <Text fill={"#fff"} verticalAlign="middle" align="center" width={1366} height={768} fontSize={100} text={this.state.winScreen + " Wins!"}/>
                            </div> : ""
                        }
                    </Layer>
                </Stage>
            </div>
        )
    }
}

export default Game;