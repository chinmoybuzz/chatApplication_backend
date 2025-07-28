module.exports = function chatHandler(io, socket) {
  socket.on("chat:message", (data) => {
    console.log(data);
    const msg = {
      from: socket.id,
      text: data,
      timestamp: Date.now(),
    };

    console.log("Received:", data, "data part", msg);
    socket.emit("chat:message", `(you) ${msg}`);
  });

  // Add more chat events here in future
};
