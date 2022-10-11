import React from "react";
import { Navigate } from 'react-router-dom'
import { v4 as uuid } from "uuid";

const socket = require('../connection/socket').socket

/**
 * Component that redirects to a new game id url and creates the game on the server.
 */
class CreateGame extends React.Component {
    state = {
        textInput: "",
        gameId: "",
        gotUsername: false,
        secondPlayerReady: false
    }


    constructor(props) {
        super(props);
        this.textBox = React.createRef();

    }

    /**
     * When the component mounts it creates a new uuid and updates the redirect state.
     */
    componentDidMount = () => {

        const newId = uuid();

        this.setState({
            gameId: newId
        })

        socket.emit('createGame', newId)
        this.props.playerDidRedirect()

    }

    render() {

        return (
        <React.Fragment>
            <Navigate to={"/game/" + this.state.gameId} />
        </React.Fragment>)
    }
}

export default CreateGame