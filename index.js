const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const bodyParser = require("body-parser");

const f = require("./functions");
const users = {};

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:room", (req, res) => {
  let room = req.params.room;
  if (!Object.keys(users).includes(room)) {
    users[room] = {};
  }
  length = Object.keys(users[room]).length;
  if (length < 2) {
    if (length == 0) {
      res.render("game/multiplayer/player.html", {
        user: "Player1",
        room: room,
        loggedIn: true,
        isPlayer2: false,
      });
    } else {
      res.render("game/multiplayer/player.html", {
        user: "Player2",
        room: room,
        otheruser: Object.values(users[room])[0],
        loggedIn: true,
        isPlayer2: true,
      });
    }
  } else {
    res.render("error.html", {
      title: "Connect 4",
      content: `<h1 style="margin-0top:50px;">Sorry, this room already has 2 players. Go join another.</h1>`,
      loggedIn: true,
      user: "None",
    });
  }
});

app.get("/*", (req, res) => {
  res.status(404).render("error.html", {
    loggedIn: true,
    user: "None",
    title: "Page Not Found",
    content: `<h1>Error 404</h1><h2>Page Not Found</h2><img src="/img/robot.jpeg" width="400px" style="border:none"><br><br><a href="/" style="color:white; font-size:20px">Go to home</a>`,
  });
});

io.on("connection", (socket) => {
  socket.on("joined", (room, user) => {
    console.log(room);
    console.log(user);
    if (!users[room]) users[room] = {};
    users[room][socket.id] = user;
    socket.join(room);
    console.log(`${user} joined the room ${room}`);
  });

  socket.on("gameover", (response) => {
    io.emit("gameclose", response);
  });
  socket.on("joinedOponent", (room, user) => {
    socket.broadcast.to(room).emit("joinedOponent", user);
  });
  socket.on("player1down", (room) => {
    socket.broadcast.to(room).emit("player1down");
  });
  socket.on("player1up", (room) => {
    socket.broadcast.to(room).emit("player1up");
  });
  socket.on("player1enddown", (room) => {
    socket.broadcast.to(room).emit("player1enddown");
  });
  socket.on("player1endup", (room) => {
    socket.broadcast.to(room).emit("player1endup");
  });
  socket.on("player2down", (room) => {
    socket.broadcast.to(room).emit("player2down");
  });
  socket.on("player2up", (room) => {
    socket.broadcast.to(room).emit("player2up");
  });
  socket.on("player2enddown", (room) => {
    socket.broadcast.to(room).emit("player2enddown");
  });
  socket.on("player2endup", (room) => {
    socket.broadcast.to(room).emit("player2endup");
  });

  socket.on("disconnect", () => {
    for (i of Object.keys(users)) {
      if (Object.keys(users[i]).includes(socket.id)) {
        let left = users[i][socket.id];
        delete users[i][socket.id];
        io.to(i).emit("leave", left);
        console.log(`${left} left the room ${i}`);
        return;
      }
    }
  });
});

server.listen(5000, () => {
  console.log("server started");
});
