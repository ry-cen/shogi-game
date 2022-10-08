import './App.css';
import useSound from 'use-sound';
import move from './assets/move.mp3'
import Wrapper from './connection/wrapper.js';

const socket = require('./connection/socket').socket

socket.emit('join', socket.id)

var thisPlayerSide = true;

socket.on('side', side => {
  socket.off('side')
  thisPlayerSide = side;
  console.log(thisPlayerSide)

})


function App() {
  const [play] = useSound(move)


  if (thisPlayerSide !== null) {
    return (
      <Wrapper 
        playAudio = {play}
        thisPlayerIsBlack = {thisPlayerSide}
      />
  
    );
  }
  

  
  
  
}

export default App;
