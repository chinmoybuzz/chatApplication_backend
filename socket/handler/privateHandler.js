module.exports = function privateMessageHandler(io, socket) {
  socket.on("private_message", ({ to, message }) => {
    const msg = {
      from: socket.id,
      to,
      text: message,
      timestamp: Date.now(),
    };

    console.log("Private Message:", msg);
    io.to(to).emit("private_message", msg); // Send directly to target socket ID
  });
};
