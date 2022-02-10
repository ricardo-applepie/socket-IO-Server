const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.get('/', (req, res) => {
  res.send( 'hi');
});

let users = []
let dbMessages = [];

io.on('connection', (socket) => {

    let username = socket.handshake.query.username; 
    let userRoom= socket.handshake.query.userRoom; 
    users.push({id:socket.id,username:username})
    console.log(`${users.length} user are connected`); 

    socket.join(userRoom);
     
    socket.on("message", (msg) => {
        console.log(msg)
        let messageSender = users.find((user)=>user.id ===socket.id); 
        dbMessages.push({username : messageSender.username , content:msg}); 
        console.log(dbMessages)
        io.to(userRoom).emit("message", msg);
    });
    
         
    socket.on("get db messages", (msg) => {

        io.to(userRoom).emit("get db messages", dbMessages);
    });
   
    socket.on("get users", (room) => {
            if (room ===userRoom ) {
                io.to(userRoom).emit("get users", users);
            }

    });

    socket.on("disconnect", () => {
      let disconnectUser = users.find((user)=>user.id ===socket.id); 

      console.log(`${disconnectUser.username} is disconnected`)

      let onlineUsers = users.filter((user)=> user.id !== socket.id); 

      users = onlineUsers ; 

    })
});



server.listen(4000, () => {
  console.log('listening on *:4000');
});