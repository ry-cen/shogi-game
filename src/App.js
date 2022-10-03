import Game from './ui/game.js';
import './App.css';
import useSound from 'use-sound';
import move from './assets/move.mp3'

function App() {
  const [play] = useSound(move)
  
  return (
    <Game 
      playAudio = {play} 
      thisPlayerIsBlack = {false}
    />
  );
}

export default App;
