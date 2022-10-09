import JoinGame from "./joingame"
import { useParams } from "react-router-dom"

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