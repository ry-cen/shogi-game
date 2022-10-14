import './App.css';
import useSound from 'use-sound';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import move from './assets/move.mp3'
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
