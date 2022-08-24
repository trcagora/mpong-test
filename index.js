const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const bodyParser = require('body-parser');
const Database = require("@replit/database");

const db = new Database();
const f = require("./functions");
const users = {};

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.render("index.html");
});






app.get("/join", (req, res) => {
  res.render("join.html");
});

app.get("/game/:room", (req, res) => {
  let room = req.params.room;
  if(!Object.keys(users).includes(room)){
      users[room] = {};
    }
    length = Object.keys(users[room]).length;
    if(length < 2){
      if(length == 0){
        res.render("game/multiplayer/player1.html", {user:'User1', room:room, loggedIn:true});
      } else {
        res.render("game/multiplayer/player2.html", {user:'User2', room:room, otheruser:Object.values(users[room])[0], loggedIn:true});
      }
    } else {
      res.render("error.html", {title:"Connect 4", content:`<h1 style="margin-0top:50px;">Sorry, this room already has 2 players. Go join another.</h1>`, loggedIn:true, user:f.getUser(req)});
    };
});

app.get("/game", (req, res) => {
  res.redirect("/join");
});

app.get("/*", (req, res) => {
  res.status(404).render("error.html", {loggedIn:f.loggedIn(req), user:f.getUser(req), title:"Page Not Found", content:`<h1>Error 404</h1><h2>Page Not Found</h2><img src="/img/robot.jpeg" width="400px" style="border:none"><br><br><a href="/" style="color:white; font-size:20px">Go to home</a>`});
});

io.on("connection", socket => {

  socket.on("joined", (room, user) => {
    console.log(room)
    console.log(user)
    if(!users[room]) users[room] = {};
    users[room][socket.id] = user;
    socket.join(room);
    socket.broadcast.to(room).emit("joined", user);
    console.log(`${user} joined the room ${room}`);
  });
  socket.on("movedown", room => {
    socket.broadcast.to(room).emit("movedown");
  });
  socket.on("moveup", room => {
    socket.broadcast.to(room).emit("moveup");
  });
  socket.on("endmovedown", room => {
    socket.broadcast.to(room).emit("endmovedown");
  });
  socket.on("endmoveup", room => {
    socket.broadcast.to(room).emit("endmoveup");
  });
  socket.on("disconnect", () => {
    for(i of Object.keys(users)){
      if(Object.keys(users[i]).includes(socket.id)){
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
