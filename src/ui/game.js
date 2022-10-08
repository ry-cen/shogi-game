import React from "react";
import Piece from "./piece.js";
import { promoteMap } from "../model/promotions.js";
import PromotionImage from "./promotionImage.js";
import ShogiGame from "../model/shogigame.js"
import BoardPic from "../assets/brownboard.png"
import imagemap from "./imagemap.js"
import { Stage, Layer, Image, Rect, Text } from "react-konva";
import { Color } from "shogi.js";

const socket = require('../connection/socket').socket

let boardImage = new window.Image();
boardImage.src = BoardPic;

class Game extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            gameState: new ShogiGame(this.props.thisPlayerIsBlack),
            playersTurnIsBlack: true,
            draggedPieceTargetId: "",
            gameKey: 0,
            hoverTarget: "",
            piecesDraggable: true,
            pieceUpForPromotion: "",
            pieceUpForPromotionID: "",
            pieceUpForPromotionLoc: "",
            promotionScreenShow: false,
            winScreen: "",
            width: window.innerWidth,
            height: window.innerHeight,
        }

    }

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.setState({
            gameState: new ShogiGame(this.props.thisPlayerIsBlack)
        })
        socket.on('opponent move', move => {
            console.log(move)
            this.movePiece(move.selectedId, move.position, this.state.gameState, false, move.promote)
        })
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    };


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
        
        this.props.playAudio()

        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame
        })

        if (isMyMove && update !== "handle promotion") {
            socket.emit('move', {
                selectedId: selectedId,
                position: position,
                promote: false
            })
        }

        
        if (update === "checkmate") {
            this.checkmate(isMyMove)
            return

        } else if (update === "handle promotion") {
            let promotePiece = currentGame.findPieceKindOnBoard(selectedId)
            this.setState({
                gameKey: this.state.gameKey === 1 ? 0 : 1,
                pieceUpForPromotion: promotePiece,
                pieceUpForPromotionID: selectedId,
                pieceUpForPromotionLoc: position,
                piecesDraggable: false,
                promotionScreenShow: true
            })
            return

        }

        


        this.setState({
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })

    }

    checkmate = (isMyMove) => {
        this.setState({
            pieceUpForPromotion: "",
            pieceUpForPromotionLoc: "",
            piecesDraggable: false,
            promotionScreenShow: false,
            winScreen: isMyMove === this.props.thisPlayerIsBlack ? "Black" : "White"
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

        socket.emit('move', {
            selectedId: this.state.pieceUpForPromotionID,
            position: this.reversePosition(this.state.pieceUpForPromotionLoc),
            promote: false
        })

        this.setState({
            pieceUpForPromotion: "",
            pieceUpForPromotionID: "",
            pieceUpForPromotionLoc: "",
            piecesDraggable: true,
            promotionScreenShow: false,
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })
        
    }

    handlePromotion = () => {
        const promoteStatus = this.state.gameState.promotePiece(this.state.pieceUpForPromotionLoc)

        socket.emit('move', {
            selectedId: this.state.pieceUpForPromotionID,
            position: this.reversePosition(this.state.pieceUpForPromotionLoc),
            promote: true
        })

        this.setState({
            pieceUpForPromotion: "",
            pieceUpForPromotionID: "",
            pieceUpForPromotionLoc: "",
            piecesDraggable: true,
            promotionScreenShow: false,
            playersTurnIsBlack: !this.state.playersTurnIsBlack
        })

        this.props.playAudio()

        

        if (promoteStatus === "checkmate") {
            this.checkmate(true)
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

    reversePosition = (position) => {
        if (this.props.thisPlayerIsBlack) {
            return [8-position[0], 8-position[1]]
        } else {
            return position
        }
    }
    
    render() {
        return(
            <div>
                <Stage y={this.state.width*(0.025)} width={this.state.width} height={this.state.height} scaleX={this.state.height*(0.9)/768} scaleY={this.state.height*(0.9)/768}>
                    <Layer>
                        <Image image={boardImage} x={299} />
                        <Rect width={250} height={250} x={43} y={10} fill="#9c7b62"/>
                        <Rect width={250} height={250} x={1073} y={508} fill="#9c7b62"/>
                        <Rect width={250} height={50} x={1073} y={508} fill="#9c7b62"/>
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
                                                    thisPlayersColorBlack = {this.props.thisPlayerIsBlack}
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
                                                    thisPlayersColorBlack = {this.props.thisPlayerIsBlack}
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
                                                    thisPlayersColorBlack = {this.props.thisPlayerIsBlack}
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