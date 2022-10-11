import React from "react";
import Piece from "./piece.js";
import { promoteMap } from "../model/promotions.js";
import PromotionImage from "./promotionImage.js";
import ShogiGame from "../model/shogigame.js"
import BoardPic from "../assets/brownboard.png"
import imagemap from "./imagemap.js"

import { Stage, Layer, Image, Rect, Text, Group } from "react-konva";
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
            piecesDraggable: false,
            pieceUpForPromotion: "",
            pieceUpForPromotionID: "",
            pieceUpForPromotionLoc: "",
            promotionScreenShow: false,
            winScreen: "",
            width: window.innerWidth,
            height: window.innerHeight,
            opponentUsername: ""
        }

    }

    /**
     * Opens all the sockets for disconnect, opponent's username and opponent's moves and requests the opponents username through the socket.
     */
    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);

        socket.on("opponent disconnect", () => {
            this.setState({
                pieceUpForPromotion: "",
                pieceUpForPromotionLoc: "",
                piecesDraggable: false,
                promotionScreenShow: false,
                winScreen: this.props.username
            })
        })

        socket.on("opponent username", (data) => {
            console.log(data)
            this.setState({
                opponentUsername: data.username,
                piecesDraggable: true
            })
        })

        socket.emit("request username", {
                color: (this.props.thisPlayerIsBlack ? '0' : '1'),
                gameId: this.props.gameId.gameid
        })

        this.setState({
            gameState: new ShogiGame(this.props.thisPlayerIsBlack)
        })

        socket.on('opponent move', move => {
            console.log(move)
            this.movePiece(move.selectedId, move.position, this.state.gameState, false, move.promote)
        })
    }
    /**
     * Removes the resize event listener.
     */
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    /**
     * Updates the dimensions in the state.
     */
    updateDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    };


    /**
     * Handles the beginning of the dragging interaction on a piece by
     * moving it to the top and setting it as the dragged piece.
     */
    startDragging = (e) => {
        e.target.moveToTop();
        this.setState({
            draggedPieceTargetId: e.target.attrs.id,
            tempGameState: this.state.gameState
        })
    }

    /**
     * Handles the placement of the piece when the player stops dragging.
     */
    endDragging = (e) => {
        const currentGame = this.state.gameState;
        const currentBoard = currentGame.getBoard();
        const position = this.triangulate(e.target.x()+77, e.target.y()+77, currentBoard);
        const selectedId = this.state.draggedPieceTargetId;
        
        this.movePiece(selectedId, position, currentGame, this.props.thisPlayerIsBlack === this.state.playersTurnIsBlack);
    }


    /**
     * Moves the piece with the selected id to the given position and updates the game state 
     * depending on any status messages from the game state's move piece function.
     */
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
                promote: false,
                gameId: this.props.gameId.gameid
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

    /**
     * Displays the wins screen based on whose move it was when the winning move was made.
     */
    checkmate = (isMyMove) => {
        this.setState({
            pieceUpForPromotion: "",
            pieceUpForPromotionLoc: "",
            piecesDraggable: false,
            promotionScreenShow: false,
            winScreen: isMyMove ? this.props.username : this.state.opponentUsername
        })
    }


    /**
     * Finds the nearest square on the board to the given coordinates x and y.
     */
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

    /**
     * Handles not promoting when you choose not to promote a piece.
     */
    handleNoPromotion = () => {

        socket.emit('move', {
            selectedId: this.state.pieceUpForPromotionID,
            position: this.state.pieceUpForPromotionLoc,
            promote: false,
            gameId: this.props.gameId.gameid
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

    /**
     * Handles the promotion when you choose to promote a piece.
     */ 
    handlePromotion = () => {
        const promoteStatus = this.state.gameState.promotePiece(this.state.pieceUpForPromotionLoc)

        socket.emit('move', {
            selectedId: this.state.pieceUpForPromotionID,
            position: this.state.pieceUpForPromotionLoc,
            promote: true,
            gameId: this.props.gameId.gameid
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

    /**
     * Handles the mouse hover on promotion selection screen.
     */
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
            <React.Fragment>
                <Stage y={this.state.width*(0.025)} width={this.state.width} height={this.state.height} scaleX={this.state.height*(0.9)/768} scaleY={this.state.height*(0.9)/768}>
                    <Layer>
                        <Image image={boardImage} x={299} />
                        <Rect width={250} height={250} x={43} y={10} fill="#9c7b62"/>
                        <Rect width={250} height={250} x={1073} y={508} fill="#9c7b62"/>
                        <Text fill={"#fff"} verticalAlign="middle" align="center" width={250} height={100} fontSize={35} x={1073} y={334} text={this.props.username}/>
                        <Text fill={"#fff"} verticalAlign="middle" align="center" width={250} height={100} fontSize={35} x={43} y={334} text={this.state.opponentUsername}/>
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
                            <Group>
                                <Rect width={1366} height={300} y={234} fill={"#000000AA"}/>
                                <PromotionImage
                                    id = {"left"}
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
                                    id = {"right"}
                                    imgurls = {imagemap[promoteMap[this.state.pieceUpForPromotion]]}
                                    gameKey = {this.state.gameKey}
                                    onClick = {this.handlePromotion}
                                    onMouseEnter = {this.handleMouseEnter}
                                    onMouseLeave = {this.handleMouseLeave}
                                    hoverTarget = {this.state.hoverTarget}
                                    x={833}
                                    y={384}

                                />
                            </Group> 
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
            </React.Fragment>
        )
    }
}

export default Game;