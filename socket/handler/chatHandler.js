module.exports = function chatHandler(io, socket) {
  socket.on("send_message", (data) => {
    const msg = {
      from: socket.id,
      text: data,
      timestamp: Date.now(),
    };

    console.log("Received:",data,"data part", msg);
    io.emit("receive_message", msg);
  });

  // Add more chat events here in future
};
