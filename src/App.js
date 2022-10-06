import Game from './ui/game.js';
import './App.css';
import useSound from 'use-sound';
import move from './assets/move.mp3'

const socket = require('../../connection/socket').socket

function App() {
  const [play] = useSound(move)

  var thisPlayerSide;

  socket.emit('connect', socket.id)

  socket.on('side', side => {
    thisPlayerSide = side;
  })
  
  return (
      <Game 
        playAudio = {play}
        thisPlayerIsBlack = {thisPlayerSide}
      />

  );
}

export default App;
