import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const PromotionImage = (props) => {

    const [image] = useImage(props.imgurls[0]);


    return(
        <Image
            key = {props.gameKey}
            kind = {props.kind}
            x={props.x}
            y={props.y}
            offsetX={101}
            offsetY={120}
            width={202}
            height={240}
            image={image}
            onClick = {props.onClick}
        />
    )
} 

export default PromotionImage