require('dotenv').config()

const express = require("express");
const cors = require("cors")
const app = express()
app.use(cors())
const http = require('http').createServer(app)

const SOCKET_PORT = process.env.SOCKET_PORT || 4000
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

app.get('/', (req, res)=>{
    res.send('Server Running');
})

io.on('connection', (socket) => {

    let userName =socket.handshake.query.userName;
    addUser(userName, socket.id)

    socket.broadcast.emit('user-list', [...userList.keys()])
    socket.emit('user-list', [...userList.keys()])

    socket.on('message', (msg)=>{
        console.log(msg)
        console.log(socket.id)
        socket.broadcast.emit('message-broadcast', {message: msg, userName: userName})
    })

    socket.on('join room' , (roomName) => {
        console.log(roomName)
        socket.join(roomName)
    })

    socket.on('send-message', ({content, to, sender})=> {
        console.log(content)
        console.log(to)
        console.log(sender)
        const payload = {
            content, sender
        }
        console.log(sender)
        socket.to(to).emit("new message", payload)
    })

    socket.on('disconnect', (reason) => {
        removeUser(userName, socket.id)
    })
});

let userList = new Map();

function addUser(userName, id){
    if (!userList.has(userName)){
        userList.set(userName, new Set(id));
    } else {
        userList.get(userName).add(id);
    }
}

function removeUser(userName, id){
    if(userList.has(userName)) {
        let userIds = userList.get(userName);
        if (userIds.size == 0){
            userList.delete(userName)
        }
    }
}

http.listen(SOCKET_PORT, () => {
    console.log(`server running! running on port ${SOCKET_PORT}`)
})