import './App.css';
import useSound from 'use-sound';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import move from './assets/move.mp3'
import Game from './ui/game';
import CreateGame from './ui/creategame';
import JoinGameWrapper from './ui/joingamewrapper';
import React from 'react';



function App() {
    const [play] = useSound(move)

    const [didRedirect, setDidRedirect] = React.useState(false)

    const playerDidRedirect = React.useCallback(() => {
        setDidRedirect(true)
    }, [])

    const playerDidNotRedirect = React.useCallback(() => {
        setDidRedirect(false)
    }, [])

    const [username, setUsername] = React.useState('')

    return (
        <Router>
            <Routes>
                <Route path='/' element={<CreateGame
                    playerDidRedirect={playerDidRedirect}
                    playerDidNotRedirect={playerDidNotRedirect}
                />} exact />
                <Route path="/game/:gameid" element={<JoinGameWrapper didRedirect={didRedirect} playAudio={play}/>}exact />
            </Routes>
        </Router>
    )





}

export default App;
