import React from "react";
import { socket } from "../connection/socket";
import { Navigate } from "react-router-dom";
import Game from "./game";

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

    join = () => {
        const gameId = this.props.gameId.gameid;
        
        socket.emit('joinGame', gameId)

    }

    typingUserName = () => {
        const typedText = this.textBox.current.value

        this.setState({
            textInput: typedText
        })
    }

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
                                <h1 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: String((window.innerHeight / 2)) + "px" }}>Waiting for other player...</h1>

                            :
                            <div>
                                <h1 style={{ textAlign: "center", color: "rgb(255,255,255)", marginTop: String((window.innerHeight / 3)) + "px" }}>Your Username:</h1>

                                <input style={{ marginLeft: String((window.innerWidth / 2) - 120) + "px", width: "240px", marginTop: "62px" }}
                                    ref={this.textBox}
                                    onInput={this.typingUserName}></input>

                                <button className="btn btn-primary"
                                    style={{ marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px", marginTop: "62px" }}
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