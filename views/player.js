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
  state: true,
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
  drawBg(
    game.paddleX,
    game.paddleX2,
    game.x,
    game.paddleY,
    game.paddleY2,
    game.y
  );

  requestAnimationFrame(drawBg);
};

socket.on("server:close", (r) => {
  if (r === room) {
    game.state = false;
  }
});

socket.on("server:playerMoveUp", (r, paddle) => {
  if (r === room) {
    game.paddleY = paddle;
  }
});

socket.on("server:playerMoveDown", (r, paddle) => {
  if (r === room) {
    game.paddleY = paddle;
  }
});

socket.on("server:player2MoveDown", (r, paddle) => {
  if (r === room) {
    game.paddleY2 = paddle;
  }
});

socket.on("server:player2MoveUp", (r, paddle) => {
  if (r === room) {
    game.paddleY2 = paddle;
  }
});

socket.on("server:renderball", (r, gamedata) => {
  if (room === r) {
    game = gamedata;

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

    play();
    activeArrow();
  }
});

socket.on("server:fullroom", () => {
  alert("Sala llena");
});

// funciones

function play() {
  if (game.state) {
    drawBg(
      game.paddleX,
      game.paddleX2,
      game.x,
      game.paddleY,
      game.paddleY2,
      game.y
    );
    // drawPaddle(game.paddleX, game.paddleY);
    // drawPaddle(game.paddleX2, game.paddleY2);
    // drawBall(game.x, game.y);
  }
  requestAnimationFrame(play);
}

function activeArrow() {
  if (game.players[0].id === socket.id) {
    document.addEventListener("keyup", (e) => {
      var p1 = game.paddleY;
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
    document.addEventListener("keyup", (e) => {
      var p2 = game.paddleY2;
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

function drawBg(x1, x2, xb, y1, y2, yb) {
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.beginPath();
  c.strokeStyle = "white";
  c.moveTo(400, 0);
  c.lineTo(400, 500);
  c.stroke();
  c.beginPath();
  c.rect(x1, y1, 10, game.paddleHeight);
  c.fillStyle = "blue";
  c.fill();
  c.beginPath();
  c.rect(x2, y2, 10, game.paddleHeight);
  c.fillStyle = "blue";
  c.fill();
  c.beginPath();
  c.arc(xb, yb, 5, 0, 7);
  c.fillStyle = "white";
  c.fill();
}

// function drawPaddle(x, y) {}

// function drawBall(x, y) {
//   c.beginPath();
//   c.arc(x, y, 5, 0, 7);
//   c.fillStyle = "white";
//   c.fill();
// }
