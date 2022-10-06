import io from 'socket.io-client';

const socket = io('http://localhost:3000')

var mySocketId;


export {
    socket,
    mySocketId
}