module.exports = function chatHandler(io, socket) {
    
  socket.on("send_message", (data) => {
let players = [];
let deck = [];
let gameStarted = false;

// Shuffle cards
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "J", "Q", "K", "A"
  ];
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}
function dealCards(deck, numPlayers) {
  const hands = [];
  for (let i = 0; i < numPlayers; i++) {
    hands.push(deck.splice(0, 3));
  }
  return hands;
}
    console.log("Received:",data,"data part", msg);
    io.emit("receive_message", msg);
  });

  // Add more chat events here in future
};
