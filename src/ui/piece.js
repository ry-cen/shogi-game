import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

/**
 * Piece component that displays the pieces on the board and handles interactions.
 */
const Piece = (props) => {

    const color = props.isBlack ? 0 : 1;
    const [image] = useImage(props.imgurls[color]);
    const ownsPiece = props.thisPlayersColorBlack === props.isBlack;
    const playersTurn = props.thisPlayersColorBlack === props.playersTurnIsBlack && ownsPiece;

    const isDragged = props.draggedPieceTargetId === props.id

    const rotation = ownsPiece ? 0 : 180;


    return(
        <Image
            key = {props.gameKey}
            kind = {props.kind}
            draggable = {playersTurn}
            x={props.x}
            y={props.y}
            width = {isDragged ? 65 : 58}
            height = {isDragged ? 78 : 70}
            image={image}
            offsetX = {isDragged ? 33 : 29}
            offsetY = {isDragged ? 39 :35}
            rotation = {rotation}
            onDragStart = {props.onDragStart}
            onDragEnd = {props.onDragEnd}
            id = {props.id}
        />
    )
} 

export default Piece