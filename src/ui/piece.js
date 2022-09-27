import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const Piece = (props) => {

    const color = props.isBlack ? 0 : 1;
    const [image] = useImage(props.imgurls[color]);
    const ownsPiece = props.thisPlayersColorBlack === props.isBlack;
    const playersTurn = props.thisPlayersColorBlack === props.playersTurnIsBlack;
    const currentTurnTEMP = props.isBlack === props.playersTurnIsBlack;

    const isDragged = props.draggedPieceTargetId === props.id

    const rotation = ownsPiece ? 0 : 180;


    return(
        <Image
            key = {props.gameKey}
            name = {props.name}
            draggable = {currentTurnTEMP}
            x={props.x}
            y={props.y}
            width = {isDragged ? 65 : 58}
            height = {isDragged ? 78 : 70}
            image={image}
            offsetX = {29}
            offsetY = {35}
            rotation = {rotation}
            onDragStart = {props.onDragStart}
            onDragEnd = {props.onDragEnd}
            id = {props.id}
        />
    )
} 

export default Piece