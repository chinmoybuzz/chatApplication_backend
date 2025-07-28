module.exports = function continueDataHandler(io, socket) {
 // Simulate data
function generateData() {
  const queue = [];
  let counter = 1;
  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < 5; i++) {
      queue.push({
        message: `Sample data ${counter}`,
        createdAt: new Date().toISOString(),
        batch: round + 1,
        index: i + 1,
      });
      counter++;
    }
  }
  return queue;
}
      // 2) Emit ONE doc per second
    const queue = generateData();
    const tickTimer = setInterval(() => {
    const next = queue.shift();
    if (next) {
      socket.emit('tick', next);
    } else {
      clearInterval(tickTimer); // we're done
    }
  }, 1000);


  socket.on('chat:message', (msg) => {
    console.log('Received:', msg);
    socket.emit('chat:message', `(you) ${msg}`);
  });

  socket.on('disconnect', () => {
    clearInterval(tickTimer);
  });

  // Add more chat events here in future
};
