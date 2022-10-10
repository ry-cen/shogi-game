import React from "react";
import { socket } from "../connection/socket";
import Game from "./game";


/**
 * Handles joining a game on a game id url.
 */
class JoinGame extends React.Component {
    state = {
        textInput: "",
        gotUsername: false,
        bothPlayersReady: false,
        doesNotExist: false
    }


    constructor(props) {
        super(props);
        this.textBox = React.createRef();

    }

    /**
     * Opens sockets for joined, both players ready and if a game does not exist.
     * If a game is successfully joined it sends the username to the server.
     */
    componentDidMount = () => {
        const gameId = this.props.gameId.gameid;

        socket.on("joined", () => {
            socket.emit("send username", {
                username: this.state.textInput, 
                color: (this.props.didRedirect ? '1' : '0'),
                gameId: gameId
            })

            this.setState({
                gotUsername: true
            })
        })

        socket.on("both players ready", () => {
            this.setState({
                bothPlayersReady: true
            })
            console.log("both players ready")
        })

        socket.on("does not exist", () => {
            console.log("does not exist")
            this.setState({
                doesNotExist: true
            })
        })
        
        
    }

    /**
     * Sends the server the join game message with the game id to join this socket to the room.
     */
    join = () => {
        const gameId = this.props.gameId.gameid;
        
        socket.emit('joinGame', gameId)

    }

    /**
     * Handles text box typing.
     */
    typingUserName = () => {
        const typedText = this.textBox.current.value

        this.setState({
            textInput: typedText
        })
    }


    /**
     * If game does not exist it displays that the game does not exist.
     * 
     */
    render() {

        console.log(this.state.bothPlayersReady);
        return (
            this.state.doesNotExist ?
                <h1 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: String((window.innerHeight / 2)) + "px" }}>Game does not exist.</h1>
                :
                <React.Fragment>
                    {
                        this.state.gotUsername ?
                            this.state.bothPlayersReady ?
                                <Game username={this.state.textInput} thisPlayerIsBlack={this.props.didRedirect} playAudio={this.props.playAudio} gameId={this.props.gameId} />
                                :
                                <div>
                                    <h1 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: String((window.innerHeight / 3)) + "px" }}>Waiting for other player...</h1>
                                    <h2 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: "10px" }}>Send the url to a friend to play.</h2>
                                </div>
                            :
                            <div>
                                <h1 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: String((window.innerHeight / 6)) + "px" }}>Shogi Game</h1>
                                <h2 style={{ textAlign: "center", color: "rgb(255,255,255)"}}>by Ryan Cen</h2>
                                <h2 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: String((window.innerHeight / 6)) + "px" }}>Your Username:</h2>

                                <input style={{ marginLeft: String((window.innerWidth / 2) - 120) + "px", width: "240px", marginTop: "10px" }}
                                    ref={this.textBox}
                                    onInput={this.typingUserName}></input>

                                <button className="btn btn-primary"
                                    style={{ marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px", marginTop: "30px" }}
                                    disabled={!(this.state.textInput.length > 0)}
                                    onClick={() => {
                                        this.join()
                                        
                                        
                                    }}>Submit</button>
                            </div>
                    }
                </React.Fragment>)
    }
}

export default JoinGame