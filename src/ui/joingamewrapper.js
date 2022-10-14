import React from "react"
import JoinGame from "./joingame"
import { useParams } from "react-router-dom"

/**
 * Wrapper that extracts the game id from the url path.
 */
const JoinGameWrapper = (props) => {
    const gameId = useParams()

    return(
        <JoinGame 
            didRedirect={props.didRedirect} 
            playAudio={props.playAudio}
            gameId = {gameId}
            />
    )
}

export default JoinGameWrapper;