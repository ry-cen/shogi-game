import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

/**
 * Promotion image component that handles interaction with the promotion menu.
 */
const PromotionImage = (props) => {

    const [image] = useImage(props.imgurls[0]);


    return(
        <Image
            id = {props.id}
            key = {props.gameKey}
            kind = {props.kind}
            x = {props.x}
            y = {props.y}
            offsetX = {(props.id === props.hoverTarget) ? 111 : 101}
            offsetY = {(props.id === props.hoverTarget) ? 132 : 120}
            width = {(props.id === props.hoverTarget) ? 222 : 202}
            height = {(props.id === props.hoverTarget) ? 264 : 240}
            image = {image}
            onClick = {props.onClick}
            onTap = {props.onClick}
            onMouseEnter = {props.onMouseEnter}
            onMouseLeave = {props.onMouseLeave}
        />
    )
} 

export default PromotionImage