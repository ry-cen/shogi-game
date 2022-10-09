import React from "react";
import { Navigate } from 'react-router-dom'
import { v4 as uuid } from "uuid";

const socket = require('../connection/socket').socket

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