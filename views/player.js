var socket = io();

const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

let game = {
  paddleX: 800 - 10,
  paddleX2: 0,
  paddleY: 500 / 2 - 50,
  paddleY2: 500 / 2 - 50,
  paddleHeight: 100,
  radius: 5,
  x: 800 / 2,
  y: 500 / 2,
  dx: 10,
  dy: 5,
  leave: false,
  scores: [0, 0],
  sets: 0,
  players: [
    {
      id: null,
      username: null,
      puntos: 0,
      sets: 0,
    },
    {
      id: null,
      username: null,
      puntos: 0,
      sets: 0,
    },
  ],
};

window.onload = () => {
  socket.emit("client:connect", room, "player");
  drawBg();
  drawPaddle(game.paddleX, game.paddleY);
  drawPaddle(game.paddleX2, game.paddleY2);
  drawBall(game.x, game.y);
};

// socket.on("server:start", (gamedata) => {
//   game = gamedata;
//   activeArrow();
// });

socket.on("server:renderball", (r, gamedata) => {
  if (room === r) {
    game = gamedata;
    activeArrow();
    drawBg();
    drawPaddle(game.paddleX, game.paddleY);
    drawPaddle(game.paddleX2, game.paddleY2);
    drawBall(game.x, game.y);

    document.getElementById("set").innerText = game.sets + 1;

    document.getElementById(
      "player2-puntos"
    ).innerText = `Puntos: ${game.players[1].puntos}`;
    document.getElementById(
      "player1-puntos"
    ).innerText = `Puntos: ${game.players[0].puntos}`;
    document.getElementById(
      "player2-sets"
    ).innerText = `sets: ${game.players[1].sets}`;
    document.getElementById(
      "player1-sets"
    ).innerText = `sets: ${game.players[0].sets}`;
  }
});

socket.on("server:fullroom", () => {
  alert("Sala llena");
});

// funciones

function activeArrow() {
  if (game.players[0].id === socket.id) {
    document.addEventListener("keydown", (e) => {
      let p1 = game.paddleY;
      e.preventDefault();
      if (e.key == "ArrowDown") {
        if (p1 < 400) {
          p1 += 50;
        }

        socket.emit("client:playerMoveDown", room, p1);
      }
      if (e.key == "ArrowUp") {
        if (p1 > 0) {
          p1 -= 50;
        }
        socket.emit("client:playerMoveUp", room, p1);
      }
    });
  } else if (game.players[1].id === socket.id) {
    document.addEventListener("keydown", (e) => {
      let p2 = game.paddleY2;
      e.preventDefault();
      if (e.key == "ArrowDown") {
        if (p2 < 400) {
          p2 += 50;
        }
        socket.emit("client:player2MoveDown", room, p2);
      }
      if (e.key == "ArrowUp") {
        if (p2 > 0) {
          p2 -= 50;
        }
        socket.emit("client:player2MoveUp", room, p2);
      }
    });
  }
}

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
  c.rect(x, y, 10, game.paddleHeight);
  c.fillStyle = "blue";
  c.fill();
}

function drawBall(x, y) {
  c.beginPath();
  c.arc(x, y, 5, 0, 7);
  c.fillStyle = "white";
  c.fill();
}
