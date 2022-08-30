var socket = io();
const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

var player1up = false;
var player1down = false;
var player2up = false;
var player2down = false;

// var score = 0;
// var otherscore = 0;
// var down = false;
// var up = false;
// var otherdown = false;
// var otherup = false;
// const paddleX = canvas.width - 20;
// var paddleY = canvas.height / 2 - 50;
// const otherPaddleX = 0;
// var otherPaddleY = canvas.height / 2 - 50;
// const paddleHeight = 100;
// const radius = 25;
// var x = canvas.width / 2;
// var y = canvas.height / 2;
// var dx = 10;
// var dy = 5;
// var otheruser;
// var leave;

window.onload = function () {
  switch (isPlayer2) {
    case "false":
      socket.emit("joined", room, "player1");

      document.addEventListener("keydown", (e) => {
        e.preventDefault();
        if (e.key == "ArrowDown") {
          player1down = true;
          socket.emit("player1down", room);
        }
        if (e.key == "ArrowUp") {
          player1up = true;
          socket.emit("player1up", room);
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.key == "ArrowDown") {
          down = false;
          socket.emit("player1enddown", room);
        }
        if (e.key == "ArrowUp") {
          up = false;
          socket.emit("player1endmoveup", room);
        }
      });

      break;

    case "true":
      socket.emit("joined", room, "player2");
      socket.emit("joinedOpponent", room, "player2");

      document.addEventListener("keydown", (e) => {
        e.preventDefault();
        if (e.key == "ArrowDown") {
          player2down = true;
          socket.emit("player2down", room);
        }
        if (e.key == "ArrowUp") {
          player2up = true;
          socket.emit("player2up", room);
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.key == "ArrowDown") {
          player2down = false;
          socket.emit("player2enddown", room);
        }
        if (e.key == "ArrowUp") {
          player2up = false;
          socket.emit("player2enddown", room);
        }
      });

      break;
  }

  socket.on("joinedOpponet", (username) => {
    otheruser = username;
    alertmodal(
      "Ingresado!",
      `${username} a ingresado al juego! empieza el juego!`
    );
    startGame();
  });

  socket.on("leave", (username) => {
    alertmodal("Salida", `${username} a dejado el juego!`).then(() =>
      socket.emit("gameover", {
        room,
        opponentScore: otherscore,
        myScore: score,
      })
    );
    leave = true;
  });

  // movimientos del player 2
  socket.on("player2down", () => {
    player2down = true;
  });
  socket.on("player2up", () => {
    player2up = true;
  });
  socket.on("player2enddown", () => {
    player2down = false;
  });
  socket.on("player2endup", () => {
    player2up = false;
  });
  // movimientos del player 1
  socket.on("player1down", () => {
    player1down = true;
  });
  socket.on("player1up", () => {
    player1up = true;
  });
  socket.on("player1enddown", () => {
    player1down = false;
  });
  socket.on("player1endup", () => {
    player1up = false;
  });
};

function drawBg() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.beginPath();
  c.strokeStyle = "white";
  c.moveTo(400, 0);
  c.lineTo(400, 500);
  c.stroke();
}

function drawPaddle(x, y) {
  c.beginPath();
  c.rect(x, y, 20, paddleHeight);
  c.fillStyle = "blue";
  c.fill();
}

function drawBall(x, y) {
  c.beginPath();
  c.arc(x, y, 25, 0, 7);
  c.fillStyle = "white";
  c.fill();
}

function animate() {
  if (leave) return;
  drawBg();
  if (
    y + radius > paddleY &&
    x + radius > paddleX &&
    y - radius < paddleY + 100
  ) {
    dx = Math.abs(dx) * -1;
    document.getElementById("pong_sound").play();
  } else if (
    y + radius > otherPaddleY &&
    x - radius < otherPaddleX + 20 &&
    y - radius < otherPaddleY + 100
  ) {
    dx = Math.abs(dx);
    document.getElementById("pong_sound").play();
  } else {
    if (x + radius > canvas.width) {
      otherscore += 1;
      dx = -dx;
    }
    if (x - radius < 0) {
      score += 1;
      dx = -dx;
    }
    if (y < radius || y + radius > canvas.height) {
      dy = -dy;
    }
  }
  x += dx;
  y += dy;
  if (up && paddleY > 0) {
    paddleY -= 7;
  } else if (down && paddleY < 400) {
    paddleY += 7;
  }
  if (otherup && otherPaddleY > 0) {
    otherPaddleY -= 7;
  } else if (otherdown && otherPaddleY < 400) {
    otherPaddleY += 7;
  }
  document.getElementById("firstscore").innerHTML = score;
  document.getElementById("secondscore").innerHTML = otherscore;

  if (score == 10 || otherscore == 10) {
    socket.emit("gameover", {
      room,
      opponentScore: otherscore,
      myScore: score,
    });
  }
  drawPaddle(paddleX, paddleY);
  drawPaddle(otherPaddleX, otherPaddleY);
  drawBall(x, y);
  requestAnimationFrame(animate);
}

function startGame() {
  setTimeout(() => {
    document.getElementById("status").innerHTML =
      "Usar flecha hacia arriba y hacia abajo para mover barra";
    animate();
  }, 1000);
}
