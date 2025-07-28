module.exports = function notificationHandler(io, socket) {
  socket.on("notify", (data) => {
    console.log("Notification:", data);
    io.emit("notify_all", {
      message: data,
      timestamp: new Date(),
    });
  });
};
