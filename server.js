//requires
const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:room", (req, res) => {
  res.render("player.html", {
    room: req.params.room,
  });
});

// app.get("/*", (req, res) => {
//   res.status(404).render("error.html", {
//     loggedIn: true,
//     user: "None",
//     title: "Page Not Found",
//     content: `<h1>Error 404</h1><h2>Page Not Found</h2><img src="/img/robot.jpeg" width="400px" style="border:none"><br><br><a href="/" style="color:white; font-size:20px">Go to home</a>`,
//   });
// });

function createRoom(room) {
  if (!Object.keys(rooms).includes(room)) {
    rooms[room] = {};
    rooms[room].game = {
      paddleX: 800 - 10,
      paddleX2: 0,
      paddleY: 500 / 2 - 50,
      paddleY2: 500 / 2 - 50,
      paddleHeight: 100,
      radius: 15,
      x: 800 / 2,
      y: 500 / 2,
      dx: 10,
      dy: 5,
      leave: false,
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
  }
}

io.on("connection", (socket) => {
  //function de sala llena
  function fullRoom() {
    socket.emit("server:fullroom");
  }

  //funcion mover bola
  function animate(room) {
    if (rooms[room] === (undefined || null) || rooms[room].game.leave) {
      return;
    }

    if (
      rooms[room].game.y + rooms[room].game.radius > rooms[room].game.paddleY &&
      rooms[room].game.x + rooms[room].game.radius > rooms[room].game.paddleX &&
      rooms[room].game.y - rooms[room].game.radius <
        rooms[room].game.paddleY + 100
    ) {
      rooms[room].game.dx = Math.abs(rooms[room].game.dx) * -1;

      // Emitir sonido de gol
    } else if (
      rooms[room].game.y + rooms[room].game.radius >
        rooms[room].game.paddleY2 &&
      rooms[room].game.x - rooms[room].game.radius <
        rooms[room].game.paddleX2 + 5 &&
      rooms[room].game.y - rooms[room].game.radius <
        rooms[room].game.paddleY2 + 100
    ) {
      rooms[room].game.dx = Math.abs(rooms[room].game.dx);
    } else {
      if (rooms[room].game.x + rooms[room].game.radius > 800) {
        rooms[room].game.players[1].puntos += 1;
        rooms[room].game.dx = -rooms[room].game.dx;
        rooms[room].game.x = 800 / 2;
        rooms[room].game.y = 500 / 2;
      }
      if (rooms[room].game.x - rooms[room].game.radius < 0) {
        rooms[room].game.players[0].puntos += 1;
        rooms[room].game.dx = -rooms[room].game.dx;
        rooms[room].game.x = 800 / 2;
        rooms[room].game.y = 500 / 2;
      }
      if (
        rooms[room].game.y < rooms[room].game.radius ||
        rooms[room].game.y + rooms[room].game.radius > 500
      ) {
        rooms[room].game.dy = -rooms[room].game.dy;
      }
    }
    rooms[room].game.x += rooms[room].game.dx;
    rooms[room].game.y += rooms[room].game.dy;

    if (
      rooms[room].game.players[0].puntos === 15 ||
      rooms[room].game.players[1].puntos === 15
    ) {
      if (rooms[room].game.sets < 2) {
        console.log(rooms[room].game.sets);
        rooms[room].game.sets++;
        rooms[room].game.x = 800 / 2;
        rooms[room].game.y = 500 / 2;
        rooms[room].game.paddleY = 500 / 2 - 50;
        rooms[room].game.paddleY2 = 500 / 2 - 50;
        if (
          rooms[room].game.players[0].puntos >
          rooms[room].game.players[1].puntos
        ) {
          rooms[room].game.players[0].sets++;
        } else {
          rooms[room].game.players[1].sets++;
        }
        rooms[room].game.players[0].puntos = 0;
        rooms[room].game.players[1].puntos = 0;
      } else {
        if (
          rooms[room].game.players[0].puntos >
          rooms[room].game.players[1].puntos
        ) {
          rooms[room].game.players[0].sets++;
        } else {
          rooms[room].game.players[1].sets++;
        }
        rooms[room].game.leave = true;
        rooms[room].game.x = 800 / 2;
        rooms[room].game.y = 500 / 2;
        rooms[room].game.paddleY = 500 / 2 - 50;
        rooms[room].game.paddleY2 = 500 / 2 - 50;

        socket.to(room).emit("server:renderball", rooms[room].game);
        io.emit("server:gameover", room, rooms[room].game.players);
        return;
      }
    }

    setTimeout(() => {
      io.emit("server:renderball", room, rooms[room].game);
      animate(room);
    }, 10);
  }

  socket.on("client:connect", (room, username) => {
    createRoom(room, socket.id);

    if (rooms[room].game.players[0].id === null) {
      socket.join(room);
      rooms[room].game.players[0] = {
        id: socket.id,
        username,
        puntos: 0,
        sets: 0,
      };
      console.log(`El usuario ${username} ingreso a la sala ${room}`);
    } else if (rooms[room].game.players[1].id === null) {
      socket.join(room);

      rooms[room].game.players[1] = {
        id: socket.id,
        username,
        puntos: 0,
        sets: 0,
      };

      console.log(`El usuario ${username} ingreso a la sala ${room}`);

      animate(room);
    } else {
      fullRoom();
    }
  });

  // -------------------------------- Movimientos --------------------------------

  socket.on("client:playerMoveUp", (room, newValue) => {
    rooms[room].game.paddleY = newValue;
    // socket.broadcast
    //   .to(room)
    //   .emit("server:playerMoveUp", rooms[room].game.paddleY);
  });
  socket.on("client:playerMoveDown", (room, newValue) => {
    rooms[room].game.paddleY = newValue;
    // socket.broadcast
    //   .to(room)
    //   .emit("server:playerMoveDown", rooms[room].game.paddleY);
  });
  socket.on("client:player2MoveUp", (room, newValue) => {
    rooms[room].game.paddleY2 = newValue;
    // socket.broadcast
    //   .to(room)
    //   .emit("server:player2MoveUp", rooms[room].game.paddleY2);
  });
  socket.on("client:player2MoveDown", (room, newValue) => {
    rooms[room].game.paddleY2 = newValue;
    // socket.broadcast
    //   .to(room)
    //   .emit("server:player2MoveDown", rooms[room].game.paddleY2);
  });

  // -------------------------------- Movimientos --------------------------------

  //al desconectarse
  socket.on("disconnect", () => {
    //recorrer salas en busca del usuario
    for (r of Object.keys(rooms)) {
      // verificar que la sala contenga al usuario obteniendo el indice
      if (
        rooms[r].game.players[0].id === socket.id ||
        rooms[r].game.players[1].id === socket.id
      ) {
        io.emit("server:leave", r, rooms[r].game.players);

        rooms[r].game.leave = true;
        rooms[r].game.players[0] = {
          id: null,
          username: null,
          puntos: 0,
          sets: 0,
        };

        rooms[r].game.players[1] = {
          id: null,
          username: null,
          puntos: 0,
          sets: 0,
        };

        // delete rooms[r];
      }
    }
  });
});

server.listen(5000, () => {
  console.log("server started in port 5000");
});

// io.on("connection", (socket) => {
//   socket.on("joined", (room, user) => {
//     console.log(room);
//     console.log(user);
//     if (!users[room]) users[room] = {};
//     users[room][socket.id] = user;
//     socket.join(room);
//     console.log(`${user} joined the room ${room}`);
//   });

//   socket.on("gameover", (response) => {
//     io.emit("gameclose", response);
//   });
//   socket.on("joinedOponent", (room, user) => {
//     socket.broadcast.to(room).emit("joinedOponent", user);
//   });
//   socket.on("player1down", (room) => {
//     socket.broadcast.to(room).emit("player1down");
//   });
//   socket.on("player1up", (room) => {
//     socket.broadcast.to(room).emit("player1up");
//   });
//   socket.on("player1enddown", (room) => {
//     socket.broadcast.to(room).emit("player1enddown");
//   });
//   socket.on("player1endup", (room) => {
//     socket.broadcast.to(room).emit("player1endup");
//   });
//   socket.on("player2down", (room) => {
//     socket.broadcast.to(room).emit("player2down");
//   });
//   socket.on("player2up", (room) => {
//     socket.broadcast.to(room).emit("player2up");
//   });
//   socket.on("player2enddown", (room) => {
//     socket.broadcast.to(room).emit("player2enddown");
//   });
//   socket.on("player2endup", (room) => {
//     socket.broadcast.to(room).emit("player2endup");
//   });

//   socket.on("disconnect", () => {
//     for (i of Object.keys(users)) {
//       if (Object.keys(users[i]).includes(socket.id)) {
//         let left = users[i][socket.id];
//         delete users[i][socket.id];
//         io.to(i).emit("leave", left);
//         console.log(`${left} left the room ${i}`);
//         return;
//       }
//     }
//   });
// });
