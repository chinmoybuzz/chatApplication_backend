module.exports=function roomHanlder(io,socket){
//join room 
  socket.on("joinRoom",(roomName)=>{
    socket.join(roomName);
    console.log(`${socket.id} joined room ${roomName}`);
    socket.to(roomName).emit("message",`User ${socket.id} joinded ${roomName}`)
  })

  socket.on("sendMessage",({roomName,message})=>{
    io.to(roomName).emit("message",`[${roomName}]${socket.id}: ${message}`)
  })

  socket.on("leaveRoom",(roomName)=>{
    socket.leave(roomName);
    socket.to(roomName).emit("message", `User ${socket.id} left ${roomName}`);
  })
}