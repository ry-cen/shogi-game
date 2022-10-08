import React from "react";
import Game from "../ui/game";

const Wrapper = (props) => {

    return (
        <Game 
          playAudio = {props.playAudio}
          thisPlayerIsBlack = {props.thisPlayerIsBlack}
        />
    
    );
}

export default Wrapper;