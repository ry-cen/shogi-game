import io from 'socket.io-client';

const socket = io('http://localhost:8000')

socket.on("connect", () => {
    console.log(`Connected with ${socket.id}`)
})


export {
    socket
}