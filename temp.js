const express = require("express");
const app = express();
const dotenv = require("dotenv");
const axios = require("axios");
const FormData = require("form-data");
dotenv.config();
connectDB = require("./config/db");
const http = require("http");
const cors = require("cors");
app.use(cors());
const db = connectDB();
const server = http.createServer(app);
app.use(express.json());
var io = require("socket.io")(server);
const tripleChance = require("./model/room");
const myData = require("./allData");
const moment = require("moment-timezone");
// const cron = require('node-cron');
async function sleep(timer) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timer);
  });
}
io.on("connection", (socket) => {
  console.log(socket.id);
  // console.log(myData)
  socket.on("joinRoom", async (body) => {
    try {
      let playerId = body.playerId;
      let name = body.name;
      let totalCoin = body.totalCoin;
      let profileImageUrl = body.profileImageUrl;
      let playerStatus = body.playerStatus;
      let gameName = body.gameName;

      let all = await tripleChance.find();
      let roomId = " ";

      all.every((element) => {
        if (element.isJoin == false) {
          roomId = element._id.toString();
          return false;
        }
        return true;
      });
      console.log("+++++++++roomId+++++++++++", roomId);

      if (roomId == " ") {
        //CREATES A NEW ROOM IF NO EMPTY ROOM IS FOUND

        console.log(`${name}`);

        let roomJJ = new tripleChance();

        let player = {
          socketID: socket.id,
          playerId: playerId,
          name: name,
          playerType: "Real Player",
          totalCoin: totalCoin,
          profileImageUrl: profileImageUrl,
          playerStatus: playerStatus,
        };

        roomJJ.players.push(player);
        // roomJJ.gameName=gameName

        let roomId = roomJJ._id.toString();

        socket.join(roomId);

        socket.emit("createRoomSuccess", roomJJ);
        roomJJ.isJoin = false;
        roomJJ = await roomJJ.save();
        io.to(roomId).emit("startGame", true);

        console.log(roomJJ);
      } else {
        //JOINS A ROOM WHICH IS NOT FULL
        roomJJ = await tripleChance.findById(roomId);
        console.log("kkkkkkkkkkkkkkkkkk");
        if (roomJJ.isJoin == false) {
          let player = {
            socketID: socket.id,
            playerId: playerId,
            name: name,
            playerType: "Real Player",
            totalCoin: totalCoin,
            profileImageUrl: profileImageUrl,
            playerStatus: playerStatus,
          };

          let players = roomJJ.players;
          console.log(players, "ooooooooooooooooooooooo");

          let flagging = 0;
          let index = 0;

          players.every((element) => {
            if (element.playerId == playerId) {
              // players.filter((element) => {
              //     return element.playerId != playerId
              // })
              // players.remove(element);
              flagging++;
              return false;
            }
            index++;
            return true;
          });

          if (flagging == 0) {
            roomJJ.players.push(player);
          } else {
            roomJJ.players[index] = player;
          }

          socket.join(roomId);

          roomJJ = await roomJJ.save();

          io.to(roomId).emit("updatedPlayers", roomJJ.players);
          socket.emit("updatedPlayer", player);
          io.to(roomId).emit("updatedRoom", roomJJ);
          io.to(roomId).emit("roomMessage", `${name} has joined the room.`);
          io.to(roomId).emit("GameId", roomJJ.gameId);
          io.to(roomId).emit("drawTime", roomJJ.draw_time);
        } else {
          socket.emit("errorOccured", "Sorry! The Room is full. Please try again.");
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("start", async (body) => {
    try {
      console.log("---------------------------game started----------------------------");
      let roomId = body.roomId;
      let gameName = body.gameName;
      var room = await tripleChance.findById(roomId);
      socket.join(roomId);
      const now = Math.floor(Date.now() / 1000);
      if (room.draw_time && room.draw_time > now) {
        // Game already running, just emit current info
        io.to(roomId).emit("draw_time", room.draw_time);
        io.to(roomId).emit("gameId", room.gameId);
        io.to(roomId).emit("startBet", true);
        return;
      }
      // let mediumCounter = 0
      do {
        var gameId = Math.floor(Date.now() / 1000).toString();
        var draw_time = Math.floor(Date.now() / 1000 + 90);
        console.log("draw_time", draw_time);
        room.draw_time = draw_time;
        room.gameId = gameId;

        const istMoment = moment().tz("Asia/Kolkata");
        let currentTime = istMoment.format("HH:mm"); // Current time in HH:mm
        // Format the IST date to 'YYYY-MM-DD'
        const date = istMoment.format("YYYY-MM-DD");
        // const date="2025-03-09"
        //  let currentMinutes = parseInt(istMoment.format("mm")); // Extract minutes only
        //  let minutesPassedInHour = currentMinutes % 60;
        //  let remainingTimeInCycle = (60 - minutesPassedInHour)*60; // Remaining time in the current hour cycle
        //old
        // let currentMinutes = parseInt(istMoment.format("mm")); // Extract minutes only
        // let minutesPassedInHour = currentMinutes % 60;
        // let remainingTimeInCycle = (60 - minutesPassedInHour) * 60; // Remaining time in the current hour cycle
        //old
        //new
        const nextHour = istMoment.clone().add(1, "hour").startOf("hour").add(5, "minutes");
        const remainingTimeInCycle = Math.floor(nextHour.unix() - istMoment.unix());

        //new
        // const currentTime="10:20"
        io.to(roomId).emit("startBet", true);
        io.to(roomId).emit("draw_time", room.draw_time);
        io.to(roomId).emit("gameId", room.gameId);
        room = await room.save();
        var modeValue;

        const getModeCall = async () => {
          try {
            const response = await axios.get("https://rajeshreekeno.com/api/winning-hotlist");
            const data = response.data;
            // Do something with the data
            return data;
          } catch (error) {
            console.error("Error fetching data: ", error);
            throw error;
          }
        };

        const modeData = getModeCall();

        modeData
          .then((data) => {
            var winType = data.list[0].win_type;
            modeValue = winType;
            console.log(winType); // This will log "Medium"
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        for (let i = 0; i < remainingTimeInCycle; i++) {
          io.to(roomId).emit("timer", remainingTimeInCycle - i);
          let roomJJ = await tripleChance.findById(roomId);
          roomJJ.currentTime = (remainingTimeInCycle - i).toString();
          roomJJ = await roomJJ.save();
          await sleep(400); //chinmoy
          let betTime = remainingTimeInCycle - 10;
          if (i === betTime && gameName == "tripleChancePrint") {
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            async function sendBetSumRequest() {
              try {
                const formData = new URLSearchParams();

                formData.append("gameName", "tripleChance"); // Added 'game' parameter
                formData.append("slot_date", date);
                formData.append("recent_time", currentTime);
                formData.append("GameId", gameId); // No newline character

                const response = await axios.post("https://rajeshreekeno.com/api/player-bet-sum", formData, {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                });

                console.log("+++++++API Response+++++++++++:", response.data);
                roomJJ.totalBetSum = response.data.totalValueSum;
                roomJJ.cardsValue1 = response.data.cardValueSet;
                roomJJ = await roomJJ.save();
                console.log(roomJJ.totalBetSum, "kkkkkkkkkkkkkkkkkkk");
              } catch (error) {
                console.error("API Error:", error.response ? error.response.data : error.message);
              }
            }
            sendBetSumRequest();

            // io.to(roomId).emit("timer", 4)
            break;
          }

          if (roomJJ === null) {
            break;
          }
        }

        // io.to(roomId).emit("roomData", room)
        io.to(roomId).emit("timer", 9);
        console.log(3);
        await sleep(400);
        io.to(roomId).emit("timer", 8);
        console.log(2);
        await sleep(400);
        io.to(roomId).emit("timer", 8);
        console.log(1);
        await sleep(400);
        io.to(roomId).emit("timer", 7);
        await sleep(400);
        io.to(roomId).emit("timer", 6);
        await sleep(400);
        io.to(roomId).emit("timer", 5);
        await sleep(400);
        io.to(roomId).emit("timer", 4);
        await sleep(400);
        io.to(roomId).emit("timer", 3);
        await sleep(400);
        io.to(roomId).emit("timer", 2);
        await sleep(400);
        console.log(modeValue, "jjjjj");
        room = await tripleChance.findById(roomId);
        room.mode = modeValue;
        console.log(room.mode, "hhhhhhhhhh");
        room = await tripleChance.findById(roomId);
        room = await room.save();
        let count = 0;
        console.log(room.mode, "++++++++++++++mode mil ya +++++++++++++");
        if (modeValue == "none" || modeValue === "" || modeValue === " " || modeValue == "Medium") {
          if (count == 3) {
            mode = "HighMedium";
            count = 0;
          } else if (count >= 0 && count < 3) {
            mode = "Medium";
            count++;
          }

          console.log(count, "+++++++count+++++++++++");
          if (mode == "Medium") {
            // console.log("+++++++++++no setMode is on+++++++++")
            // console.log("+++++++++++++++++++medium++++++++++++++++++++++++++++++++")
            var room = await tripleChance.findById(roomId);
            function findCardsInRange(arr) {
              var array = arr;
              // console.log(array, "++++187++++++")
              let final = array.length - 1;
              // console.log(final, "+++++final++++++++")
              let initial = array.length - 1000;
              // console.log(initial, "+++++++++++++initial++++++++++++++++++")
              // let totalSum = array.reduce((sum, num) => {
              //     return sum + num.value
              // }, 0)

              var totalSum = room.totalBetSum;
              // console.log(totalSum, "++++++++++totalSum++++++++++")
              let finalArray = [];
              let playerSumArray = [];
              for (let i = final; i >= initial; i--) {
                var card = array[i].card;
                let value = array[i].value;
                let tripleDigit = card;
                let doubleDigit = card.slice(1);
                let singleDigit = card.slice(2);
                // console.log(tripleDigit,doubleDigit,singleDigit,"1633333333333333")

                let sum1 = 0,
                  sum2 = 0,
                  sum3 = 0;
                let data1 = array.find((element) => element.card === tripleDigit);
                sum1 = data1.value * 900;
                // console.log(sum1,"sum111111111111")
                let data2 = array.find((element) => element.card === doubleDigit);
                sum2 = data2.value * 90;
                // console.log(sum2,"sum22222222")
                let data3 = array.find((element) => element.card === singleDigit);
                sum3 = data3.value * 9;
                // console.log(sum3,"sum3333333333")
                let sum = sum1 + sum2 + sum3;
                // console.log(sum)
                if (sum <= 1 * totalSum && sum > 0 * totalSum) {
                  finalArray.push(card);
                  playerSumArray.push(sum);
                }
              }
              return { finalArray, playerSumArray };
            }
            // Usage:
            // console.log(room.cardsValue1, "+++229+++++")
            let result = findCardsInRange(room.cardsValue1);
            let output = result.finalArray;
            let outputPlayerSumArray = result.playerSumArray;
            console.log(output);
            let randomIndex = Math.floor(Math.random() * output.length);
            if (output.length == 0) {
              var slot = Math.floor(Math.random() * (900 - 101 + 1)) + 101;
              console.log(slot);
              io.to(roomId).emit("slot", slot);
              console.log(slot, "+++++++++++slottttttttttttttt+++++++++");
            } else {
              // // const randomBet=loweArray[randomIndex]
              console.log(randomIndex, "kkkkkk");
              // const index=output.indexOf(randomBet)
              if (randomIndex == -1) {
                var slot = Math.floor(Math.random() * (900 - 101 + 1)) + 101;
                console.log(slot);
                io.to(roomId).emit("slot", slot);
                console.log(slot, "+++++++++++slottttttttttttttt+++++++++");
              } else {
                var slot = output[randomIndex];
                io.to(roomId).emit("slot", slot);
                console.log(slot, "+++++++++++slottttttttttttttt+++++++++");
              }
            }

            //    game_data_insert
            const apiUrl1 = "https://rajeshreekeno.com/api/live-data-from-node";
            const requestData1 = {
              win_number: slot.toString(),
              game_name: "tripleChance",
            };

            axios
              .post(apiUrl1, requestData1)
              .then((response) => {
                console.log(response.data, "+++++++game Data insert data+++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });

            const apiUrl2 = "https://rajeshreekeno.com/api/result-from-node";
            const requestData2 = {
              win_number: slot.toString(),
              game_id: gameId,
            };
            console.log("Request Data:", requestData2);
            //   console.log(room.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
            axios
              .post(apiUrl2, requestData2)
              .then((response) => {
                console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });
          }
          if (modeValue == "HighMedium") {
            // mode will be high Medium
            console.log("+++++++++++ setMode is on+++++++++");
            console.log("+++++++++++++++++++High Medium++++++++++++++++++++++++++++++++");
            var room = await tripleChance.findById(roomId);
            function findCardsInRange(arr) {
              var array = arr;
              console.log("++++++++++ghus gya  mai+++++++++++++");
              let final = array.length - 1;
              console.log(final, "+++++final++++++++");
              let initial = array.length - 1000;
              console.log(initial, "+++++++++++++initial++++++++++++++++++");
              // let totalSum = array.reduce((sum, num) => {
              //     return sum + num.value
              // }, 0)

              var totalSum = room.totalBetSum;
              console.log(totalSum, "++++++++++totalSum++++++++++");
              let finalArray = [];
              let playerSumArray = [];
              for (let i = final; i >= initial; i--) {
                var card = array[i].card;
                let value = array[i].value;
                let tripleDigit = card;
                let doubleDigit = card.slice(1);
                let singleDigit = card.slice(2);
                // console.log(tripleDigit,doubleDigit,singleDigit,"1633333333333333")
                let sum1 = 0;
                let sum2 = 0;
                let sum3 = 0;
                let data1 = array.find((element) => element.card === tripleDigit);
                sum1 = data1.value * 900;
                // console.log(sum1,"sum111111111111")
                let data2 = array.find((element) => element.card === doubleDigit);
                sum2 = data2.value * 90;
                // console.log(sum2,"sum22222222")
                let data3 = array.find((element) => element.card === singleDigit);
                sum3 = data3.value * 9;
                // console.log(sum3,"sum3333333333")
                let sum = sum1 + sum2 + sum3;
                // console.log(sum)
                if ((sum < 1 * totalSum && sum > 0.8 * totalSum) || (sum > 0.5 * totalSum && sum < 1.1 * totalSum) || (sum > 0.4 * totalSum && sum < 1.1 * totalSum) || (sum > 0.0 * totalSum && sum < 1.1 * totalSum) || (sum > 0.5 * totalSum && sum < 2 * totalSum)) {
                  finalArray.push(card);
                  playerSumArray.push(sum);
                }
              }
              return { finalArray, playerSumArray };
            }
            // Usage:
            let result = findCardsInRange(room.cardsValue1);
            let output = result.finalArray;
            let outputPlayerSumArray = result.playerSumArray;
            console.log(outputPlayerSumArray, "+++++outplayerSumArray++++++++");
            let filterElement = [];
            let filterElementCorrespondingSlot = [];
            var room = await tripleChance.findById(roomId);
            var totalSum = room.totalBetSum;
            for (let i = 0; i < outputPlayerSumArray.length; i++) {
              if (outputPlayerSumArray[i] < totalSum) {
                filterElement.push(outputPlayerSumArray[i]);
                filterElementCorrespondingSlot.push(i);
              }
            }
            console.log(filterElement, "+++++++++++filterElament++++++++");
            if (filterElement.length > 0) {
              console.log("++++filter wla amai enter kar gaya+++++");
              // const sortedArray1 = filterElement.sort((a, b) => a - b);
              const randomNumber = Math.floor(Math.random() * filterElement.length - 1);
              console.log(randomNumber, "ppppppppppp");
              const thirdMax = filterElementCorrespondingSlot[randomNumber];
              // const thirdMaxIndex = outputPlayerSumArray.indexOf(thirdMax);
              console.log(output);
              // Step 2: Get the corresponding slot from array2 using the index obtained from array1
              var slot = output[thirdMax];
              console.log(slot, "kkkkkk");
            } else if (output.length == 0) {
              console.log("output length is zero");
              let RandomNumber = Math.floor(Math.random() * 800) + 100;
              let stringRandomNumber = RandomNumber.toString();
              console.log(typeof stringRandomNumber, "RandomIndex");
              var slot = stringRandomNumber;
              console.log(slot, "LLLLL");
            } else {
              const randomNumber = Math.floor(Math.random() * output.length);
              const slot = output[randomNumber];

              console.log(slot, "MMMMMMMM");
            }
            io.to(roomId).emit("slot", slot);
            console.log(slot);
            // game_data_insert
            const apiUrl1 = "https://rajeshreekeno.com/api/live-data-from-node";
            const requestData1 = {
              win_number: slot.toString(),
              game_name: "tripleChance",
              GameId: gameId,
            };

            axios
              .post(apiUrl1, requestData1)
              .then((response) => {
                console.log(response.data, "+++++++game Data insert data+++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });
            // all data of the user

            const apiUrl2 = "https://rajeshreekeno.com/api/result-from-node";
            const requestData2 = {
              win_number: slot.toString(),
              game_id: gameId,
            };
            console.log("Request Data:", requestData2);
            //   console.log(room.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
            axios
              .post(apiUrl2, requestData2)
              .then((response) => {
                console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });
          }
        } else {
          console.log("else part mai agya hai");
          if (modeValue == "Medium") {
            console.log(modeValue, "309");
            // console.log("+++++++++++no setMode is on+++++++++")
            // console.log("+++++++++++++++++++medium++++++++++++++++++++++++++++++++")
            var room = await tripleChance.findById(roomId);
            function findCardsInRange(arr) {
              var array = arr;
              // console.log(array, "++++187++++++")
              let final = array.length - 1;
              // console.log(final, "+++++final++++++++")
              let initial = array.length - 1000;
              // console.log(initial, "+++++++++++++initial++++++++++++++++++")
              // let totalSum = array.reduce((sum, num) => {
              //     return sum + num.value
              // }, 0)

              var totalSum = room.totalBetSum;
              // console.log(totalSum, "++++++++++totalSum++++++++++")
              let finalArray = [];
              let playerSumArray = [];
              for (let i = final; i >= initial; i--) {
                var card = array[i].card;
                let value = array[i].value;
                let tripleDigit = card;
                let doubleDigit = card.slice(1);
                let singleDigit = card.slice(2);
                // console.log(tripleDigit,doubleDigit,singleDigit,"1633333333333333")

                let sum1 = 0,
                  sum2 = 0,
                  sum3 = 0;
                let data1 = array.find((element) => element.card === tripleDigit);
                sum1 = data1.value * 900;
                // console.log(sum1,"sum111111111111")
                let data2 = array.find((element) => element.card === doubleDigit);
                sum2 = data2.value * 90;
                // console.log(sum2,"sum22222222")
                let data3 = array.find((element) => element.card === singleDigit);
                sum3 = data3.value * 9;
                // console.log(sum3,"sum3333333333")
                let sum = sum1 + sum2 + sum3;
                // console.log(sum)
                if (sum <= 1 * totalSum && sum > 0 * totalSum) {
                  finalArray.push(card);
                  playerSumArray.push(sum);
                }
              }
              return { finalArray, playerSumArray };
            }
            // Usage:
            // console.log(room.cardsValue1, "+++229+++++")
            let result = findCardsInRange(room.cardsValue1);
            let output = result.finalArray;
            let = result.playerSumArray;

            let randomIndex = Math.floor(Math.random() * output.length);
            // // const randomBet=loweArray[randomIndex]
            console.log(randomIndex, "kkkkkk");
            // const index=output.indexOf(randomBet)
            if (randomIndex == -1 || output.length == 0) {
              var slot = Math.floor(Math.random() * (900 - 101 + 1)) + 101;
              console.log(slot);
              io.to(roomId).emit("slot", slot);
              console.log(slot, "+++++++++++slottttttttttttttt+++++++++");
            } else {
              var slot = output[randomIndex];
              io.to(roomId).emit("slot", slot);
              console.log(slot, "+++++++++++slottttttttttttttt+++++++++");
            }

            //    game_data_insert
            const apiUrl1 = "https://rajeshreekeno.com/api/live-data-from-node";
            const requestData1 = {
              win_number: slot.toString(),
              game_name: "tripleChance",
              GameId: gameId,
            };

            axios
              .post(apiUrl1, requestData1)
              .then((response) => {
                console.log(response.data, "+++++++game Data insert data+++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });

            const apiUrl2 = "https://rajeshreekeno.com/api/result-from-node";
            const requestData2 = {
              win_number: slot.toString(),
              game_id: gameId,
            };
            console.log("Request Data:", requestData2);
            //   console.log(room.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
            axios
              .post(apiUrl2, requestData2)
              .then((response) => {
                console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });
          } else if (modeValue == "High") {
            console.log(modeValue, "396");
            console.log("+++++++++++setMode is on+++++++++");
            console.log("+++++++++++++++++++High++++++++++++++++++++++++++++++++");
            var room = await tripleChance.findById(roomId);
            function findCardsInRange(arr) {
              var array = arr;
              // console.log("++++++++++ghus gya  mai+++++++++++++")
              let final = array.length - 1;
              // console.log(final, "+++++final++++++++")
              let initial = array.length - 1000;
              // console.log(initial, "+++++++++++++initial++++++++++++++++++")
              // let totalSum = array.reduce((sum, num) => {
              //     return sum + num.value
              // }, 0)
              var totalSum = room.totalBetSum;
              // console.log(totalSum, "++++++++++totalSum++++++++++")
              let finalArray = [];
              let playerSumArray = [];
              for (let i = final; i >= initial; i--) {
                var card = array[i].card;
                let value = array[i].value;
                let tripleDigit = card;
                let doubleDigit = card.slice(1);
                let singleDigit = card.slice(2);
                // console.log(tripleDigit,doubleDigit,singleDigit,"1633333333333333")

                let sum1 = 0;
                let sum2 = 0;
                let sum3 = 0;
                let data1 = array.find((element) => element.card === tripleDigit);
                sum1 = data1.value * 900;
                // console.log(sum1,"sum111111111111")
                let data2 = array.find((element) => element.card === doubleDigit);
                sum2 = data2.value * 90;
                // console.log(sum2,"sum22222222")
                let data3 = array.find((element) => element.card === singleDigit);
                sum3 = data3.value * 9;
                // console.log(sum3,"sum3333333333")
                let sum = sum1 + sum2 + sum3;
                // console.log(sum)

                finalArray.push(card);
                playerSumArray.push(sum);
              }
              return { finalArray, playerSumArray };
            }
            // Usage:
            let result = findCardsInRange(room.cardsValue1);
            let output = result.finalArray;
            console.log(output.length, "kkkk");
            let outputPlayerSumArray = result.playerSumArray;

            //checking if bet==0then random result will be shouwn
            var room = await tripleChance.findById(roomId);
            var totalSum = room.totalBetSum;
            var slot;
            if (totalSum == 0) {
              console.log("sum is zero");
              let RandomIndex = Math.floor(Math.random() * output.length);
              console.log(typeof RandomIndex, "RandomIndex");
              // console.log( RandomIndex )
              slot = output[RandomIndex];
              console.log(typeof slot, "kkkkk");
            } else if (output.length == 0) {
              console.log("output length is zero");
              let RandomNumber = Math.floor(Math.random() * 800) + 100;
              let stringRandomNumber = RandomNumber.toString();
              console.log(typeof stringRandomNumber, "RandomIndex");
              slot = stringRandomNumber;
            } else {
              let correspondingIndex = [];

              let maxNumber = Math.max(...outputPlayerSumArray);
              for (let element of outputPlayerSumArray) {
                if (element == maxNumber) {
                  let index = outputPlayerSumArray.indexOf(element);
                  correspondingIndex.push(output[index]);
                  outputPlayerSumArray.splice(index, 1);
                  output.splice(index, 1);
                }
              }

              console.log(correspondingIndex, "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
              let indexes = Math.floor(Math.random() * correspondingIndex.length);
              console.log(correspondingIndex[indexes]);
              slot = correspondingIndex[indexes];
            }
            io.to(roomId).emit("slot", slot);
            console.log(slot, "+++++++++++slottttttttttttttt+++++++++");

            //    game_data_insert
            const apiUrl1 = "https://rajeshreekeno.com/api/live-data-from-node";
            const requestData1 = {
              win_number: slot.toString(),
              game_name: "tripleChance",
              GameId: gameId,
            };

            axios
              .post(apiUrl1, requestData1)
              .then((response) => {
                console.log(response.data, "+++++++game Data insert data+++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });

            // all data of the user

            const apiUrl2 = "https://rajeshreekeno.com/api/result-from-node";
            const requestData2 = {
              win_number: slot.toString(),
              game_id: gameId,
            };
            console.log("Request Data:", requestData2);
            //   console.log(room.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
            axios
              .post(apiUrl2, requestData2)
              .then((response) => {
                console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });
          } else if (modeValue == "Low") {
            console.log("+++++++++++low setMode is on+++++++++");
            console.log("+++++++++++++++++++low++++++++++++++++++++++++++++++++");
            room = await tripleChance.findById(roomId);
            function findCardsInRange(arr) {
              var array = arr;
              // console.log("++++++++++ghus gya  mai+++++++++++++")
              let final = array.length - 1;
              // console.log(final, "+++++final++++++++")
              let initial = array.length - 1000;
              // console.log(initial, "+++++++++++++initial++++++++++++++++++")
              let totalSum = array.reduce((sum, num) => {
                return sum + num.value;
              }, 0);

              // var totalSum=room.totalBetSum
              // console.log(totalSum, "++++++++++totalSum++++++++++")
              let finalArray = [];
              let playerSumArray = [];
              for (let i = final; i >= initial; i--) {
                var card = array[i].card;
                let value = array[i].value;
                let tripleDigit = card;
                let doubleDigit = card.slice(1);
                let singleDigit = card.slice(2);
                // console.log(tripleDigit,doubleDigit,singleDigit,"1633333333333333")

                let sum1 = 0;
                let sum2 = 0;
                let sum3 = 0;
                let data1 = array.find((element) => element.card === tripleDigit);
                sum1 = data1.value * 900;
                // console.log(sum1,"sum111111111111")
                let data2 = array.find((element) => element.card === doubleDigit);
                sum2 = data2.value * 90;
                // console.log(sum2,"sum22222222")
                let data3 = array.find((element) => element.card === singleDigit);
                sum3 = data3.value * 9;
                // console.log(sum3,"sum3333333333")
                let sum = sum1 + sum2 + sum3;
                // console.log(sum)

                finalArray.push(card);
                playerSumArray.push(sum);
              }
              return { finalArray, playerSumArray };
            }
            // Usage:
            let result = findCardsInRange(room.cardsValue1);
            let output = result.finalArray;
            let outputPlayerSumArray = result.playerSumArray;
            // console.log(output, "186666666666")
            // console.log(outputPlayerSumArray, "17666666666666")

            const minNumber = Math.min(...outputPlayerSumArray);
            // console.log("Minimum Number:", minNumber);
            let indexArray = [];
            for (let i = 0; i < outputPlayerSumArray.length; i++) {
              if (outputPlayerSumArray[i] === minNumber) {
                indexArray.push(i);
              }
            }

            // console.log("Indices of minimum number:", indexArray);

            let n = Math.floor(Math.random() * indexArray.length); // Removed -1
            // console.log("Random index:", n);

            const randomIndex = indexArray[n];
            // console.log("Corresponding random index from array1:", randomIndex);

            const slot = output[randomIndex];
            // console.log("Corresponding value from output:", slot);

            io.to(roomId).emit("slot", slot);
            console.log(slot, "+++++++++++slottttttttttttttt+++++++++");

            //    game_data_insert
            const apiUrl1 = "https://rajeshreekeno.com/api/live-data-from-node";
            const requestData1 = {
              win_number: slot.toString(),
              game_name: "tripleChance",
              GameId: gameId,
            };

            axios
              .post(apiUrl1, requestData1)
              .then((response) => {
                console.log(response.data, "+++++++game Data insert data+++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });

            // all data of the user

            const apiUrl2 = "https://rajeshreekeno.com/api/result-from-node";
            const requestData2 = {
              win_number: slot.toString(),
              game_id: gameId,
            };
            console.log("Request Data:", requestData2);
            //   console.log(room.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
            axios
              .post(apiUrl2, requestData2)
              .then((response) => {
                console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
              })
              .catch((error) => {
                console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
              });
          } else {
            if (modeValue == "HighMedium") {
              // mode will be high Medium
              console.log("+++++++++++ setMode is on+++++++++");
              console.log("+++++++++++++++++++High Medium++++++++++++++++++++++++++++++++");
              var room = await tripleChance.findById(roomId);
              function findCardsInRange(arr) {
                var array = arr;
                console.log("++++++++++ghus gya  mai+++++++++++++");
                let final = array.length - 1;
                console.log(final, "+++++final++++++++");
                let initial = array.length - 1000;
                console.log(initial, "+++++++++++++initial++++++++++++++++++");
                // let totalSum = array.reduce((sum, num) => {
                //     return sum + num.value
                // }, 0)

                var totalSum = room.totalBetSum;
                console.log(totalSum, "++++++++++totalSum++++++++++");
                let finalArray = [];
                let playerSumArray = [];
                for (let i = final; i >= initial; i--) {
                  var card = array[i].card;
                  let value = array[i].value;
                  let tripleDigit = card;
                  let doubleDigit = card.slice(1);
                  let singleDigit = card.slice(2);
                  // console.log(tripleDigit,doubleDigit,singleDigit,"1633333333333333")
                  let sum1 = 0;
                  let sum2 = 0;
                  let sum3 = 0;
                  let data1 = array.find((element) => element.card === tripleDigit);
                  sum1 = data1.value * 900;
                  // console.log(sum1,"sum111111111111")
                  let data2 = array.find((element) => element.card === doubleDigit);
                  sum2 = data2.value * 90;
                  // console.log(sum2,"sum22222222")
                  let data3 = array.find((element) => element.card === singleDigit);
                  sum3 = data3.value * 9;
                  // console.log(sum3,"sum3333333333")
                  let sum = sum1 + sum2 + sum3;
                  // console.log(sum)
                  if ((sum < 1 * totalSum && sum > 0.8 * totalSum) || (sum > 0.5 * totalSum && sum < 1.1 * totalSum) || (sum > 0.4 * totalSum && sum < 1.1 * totalSum) || (sum > 0.0 * totalSum && sum < 1.1 * totalSum) || (sum > 0.5 * totalSum && sum < 2 * totalSum)) {
                    finalArray.push(card);
                    playerSumArray.push(sum);
                  }
                }
                return { finalArray, playerSumArray };
              }
              // Usage:
              let result = findCardsInRange(room.cardsValue1);
              let output = result.finalArray;
              let outputPlayerSumArray = result.playerSumArray;
              console.log(outputPlayerSumArray, "+++++outplayerSumArray++++++++");
              let filterElement = [];
              let filterElementCorrespondingSlot = [];
              var room = await tripleChance.findById(roomId);
              var totalSum = room.totalBetSum;
              for (let i = 0; i < outputPlayerSumArray.length; i++) {
                if (outputPlayerSumArray[i] < totalSum) {
                  filterElement.push(outputPlayerSumArray[i]);
                  filterElementCorrespondingSlot.push(i);
                }
              }
              console.log(filterElement, "+++++++++++filterElament++++++++");
              if (filterElement.length > 0) {
                console.log("++++filter wla amai enter kar gaya+++++");
                // const sortedArray1 = filterElement.sort((a, b) => a - b);
                const randomNumber = Math.floor(Math.random() * filterElement.length - 1);
                console.log(randomNumber, "ppppppppppp");
                const thirdMax = filterElementCorrespondingSlot[randomNumber];
                // const thirdMaxIndex = outputPlayerSumArray.indexOf(thirdMax);
                console.log(output);
                // Step 2: Get the corresponding slot from array2 using the index obtained from array1
                var slot = output[thirdMax];
                console.log(slot, "kkkkkk");
              } else if (output.length == 0) {
                console.log("output length is zero");
                let RandomNumber = Math.floor(Math.random() * 800) + 100;
                let stringRandomNumber = RandomNumber.toString();
                console.log(typeof stringRandomNumber, "RandomIndex");
                var slot = stringRandomNumber;
                console.log(slot, "LLLLL");
              } else {
                const randomNumber = Math.floor(Math.random() * output.length);
                const slot = output[randomNumber];

                console.log(slot, "MMMMMMMM");
              }
              io.to(roomId).emit("slot", slot);
              console.log(slot);
              // game_data_insert
              const apiUrl1 = "https://rajeshreekeno.com/api/live-data-from-node";
              const requestData1 = {
                win_number: slot.toString(),
                game_name: "tripleChance",
                GameId: gameId,
              };

              axios
                .post(apiUrl1, requestData1)
                .then((response) => {
                  console.log(response.data, "+++++++game Data insert data+++++++"); // Print the response data
                })
                .catch((error) => {
                  console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
                });
              // all data of the user

              const apiUrl2 = "https://rajeshreekeno.com/api/result-from-node";
              const requestData2 = {
                win_number: slot.toString(),
                game_id: gameId,
              };
              console.log("Request Data:", requestData2);
              //   console.log(room.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
              axios
                .post(apiUrl2, requestData2)
                .then((response) => {
                  console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                })
                .catch((error) => {
                  console.error(error, "++++++data nahi ayya error khaya++++++++"); // Print any errors
                });
            }
          }
        }

        room.cardsValue1 = myData;
        room.totalBetSum = 0;
        room.mode = "Medium";

        await room.save();

        console.log("one round complete");
        await sleep(1000); //18000 previous
      } while (room != null);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("bet", async (body) => {
    const data = JSON.parse(body);
    const { roomId, playerId, cardValueSet, start_point, playerBetSum } = data;
    let room = await tripleChance.findById(roomId);

    console.log(playerBetSum, cardValueSet, "++++playerBetSum1139++++++++");
    room = await tripleChance.findById(roomId);

    const updateAllCards = (array, cardValueSet) => {
      for (const item of array) {
        const cardValue = cardValueSet.find((card) => card.card === item.card);
        if (cardValue) {
          item.value = item.value + cardValue.value;
        }
      }
    };
    room = await room.save();
    updateAllCards(room.cardsValue1, cardValueSet);
    room.totalBetSum += playerBetSum;

    room = await room.save();
    io.to(roomId).emit("playersBetInfo", room.players);
  });
  socket.on("clearAll", async () => {
    try {
      await tripleChance.deleteMany({});
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("leave", async (body) => {
    try {
      console.log("+++++++++++++leaved room called++++++++++++");
      var roomId = body.roomId;
      var playerId = body.playerId;
      var room = await tripleChance.findById(roomId);
      console.log(room.players.length, "hiiiiiiiiiii");

      room.players = room.players.filter((item) => {
        return item.playerId != playerId;
      });

      room = await room.save();
    } catch (error) {
      console.log(error);
    }
  });

  async function leaveRoom(playerId) {
    try {
      console.log(playerId, "hhhhhhhhhhhh");

      let userId = playerId;

      // Find the room that contains this player
      let roomJJ = await tripleChance.findOne({ "players.playerId": userId });

      if (!roomJJ) {
        console.log("Room not found for player:", userId);
        return;
      }

      console.log(roomJJ, "kkk");

      // Remove the player from the room
      roomJJ.players = roomJJ.players.filter((item) => item.playerId !== userId);

      // Save the updated room
      await roomJJ.save();
      console.log("hogayayayayayay");
    } catch (error) {
      console.error("Error in leaveRoom:", error);
    }
  }

  socket.on("disconnect", async () => {
    try {
      console.log(`one socket disconnected:${socket.id}`);

      const playerData = await tripleChance.aggregate([
        {
          $match: {
            players: {
              $elemMatch: {
                socketID: socket.id,
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            playerId: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$players",
                    as: "player",
                    cond: { $eq: ["$$player.socketID", socket.id] },
                  },
                },
                0,
              ],
            },
          },
        },
      ]);
      let playerId;
      if (playerData.length > 0 && playerData[0].playerId) {
        playerId = playerData[0].playerId.playerId;
        console.log("Player ID:", playerId);

        console.log(playerId, typeof playerId, Number(playerId), "klkkk");
        // Call logout API with playerId

        const logoutApiUrl = `https://rajeshreekeno.com/api/logout-from-node?user_id=${Number(playerId)}`;

        const response = await axios.get(logoutApiUrl);

        console.log("Logout API Response:", response.data);

        await leaveRoom(playerId);
      }
    } catch (error) {
      console.log(error.message);
    }
  });
});

// Endpoint to clear the database
app.post("/clear-database", async (req, res) => {
  try {
    console.log("hiiiiiii");
    await tripleChance.deleteMany({});
    res.status(200).send("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error.message, error.stack);
    res.status(500).send("Error clearing database");
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// gameId 1754487347
