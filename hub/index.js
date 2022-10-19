"use strict";

const io = require("socket.io");
const eventPool = require("./eventPool");
const PORT = process.env.PORT || 3002;
const randomWords = require("random-words");

const server = io(PORT);
const hangout = server.of("/hangout");
console.log(`Server is listening on port: ${PORT}/hangout`);

hangout.on("connection", (socket) => {
  console.log(`New Player connected!!!`, socket.id);

  socket.on("gameStart", (payload) => {
    payload = {
      turn: "player1",
      lives,
      currentWord: currentWord,
    };

    socket.emit("gameStart", payload);
  });

  socket.on("join", (payload) => {
    console.log("join", payload);

    socket.join(payload);
    hangout.emit("newRoom", "1234");
  });

  socket.on("chat", (message) => {
    console.log(message);
    hangout.to("1234").emit("chat", message);
    // hangout.emit("chat", message);
  });

  socket.on("letterSubmit", (payload) => {
    console.log(payload);

    // Creating a variable for the new word
    let newWord = handleLetterSubmit(payload);
    let anyX = currentWord.includes("X");
    console.log("I'm Here", currentWord);
    console.log(anyX);
    if (anyX === true && lives > 0) {
      socket.emit("nextTurn", "Your're Next!");
    } else {
      if (anyX === false) {
        socket.emit("gameOver", "Congratulations, YOU WON!");
      } else {
        socket.emit("gameOver", "Sorry, you lost");
      }
    }
  });
});

// Creating a function that will continue to run until we get the desired number of letters.
function getRandomString(length) {
  let str = "";
  do {
    str = randomWords({ exactly: 1, maxLength: length })[0];
    console.log(str);
  } while (str.length !== length);
  return str;
}

let secretString = getRandomString(5);
console.log(secretString);
let currentWord = "XXXXX";
let strLeft = secretString;
let lives = 3;

function handleLetterSubmit(letter) {
  console.log("handleLetter", letter);

  if (strLeft.includes(letter)) {
    let newWord = currentWord;
    let tempStr = secretString;

    while (tempStr.includes(letter)) {
      let index = tempStr.indexOf(letter);
      // let index2 = newWord.indexOf(letter);
      tempStr =
        tempStr.substring(0, index) +
        "X" +
        tempStr.substring(index + 1, tempStr.length);

      newWord =
        newWord.substring(0, index) +
        letter +
        newWord.substring(index + 1, currentWord.length);
    }

    console.log(tempStr, newWord);
    strLeft = tempStr;
    currentWord = newWord;
    return newWord;
  } else {
    --lives;
    let message = "Sorry, no letter in word";
    console.log(message, `You have ${lives} left`);
    return message;
  }
}