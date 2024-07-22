const express = require('express');
const {createServer} = require('http');
const {Server} = require('socket.io');
const app = express();

const server = createServer(app);

const io = new Server(server,{
    cors:{
        origin:'http://localhost:5173',
        methods:["GET","POST"]
    }
});

let users = [];
  
  const addUser = (userId, socketId) => {
    !users.some((user) => user?.userId === userId) &&
      users.push({ userId, socketId });
  };
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user?.socketId !== socketId);
  };
  
  const getUser = (userId) => {
    return users.find((user) => user?.userId === userId);
  };
  
  io.on("connection", (socket) => {
    
    console.log("a user connected.");
  
    
    socket.on("addUser", (userId) => {
      addUser(userId, socket?.id);
      io.emit("getUsers", users);
    });
  
    
    socket.on("sendMessage", ({ sendUserId,receiveUserId,contentMessage,imgList,fileList,zoomId }) => {
      const user = getUser(receiveUserId);
      io.to(user?.socketId).emit("getMessage", {
        sendUserId,
        receiveUserId,
        contentMessage,
        imgList,
        fileList,
        zoomId,
      });
    });
  
    
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket?.id);
      io.emit("getUsers", users);
    });
  });

  server.listen(5050, () => {
    console.log("SERVER IS RUNNING");
  });