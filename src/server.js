import http from "http";
import SocketIO from "socket.io";
import express from "express";
import livereloadMiddleware from "connect-livereload";
import livereload from "livereload";

const liveServer = livereload.createServer({
  exts: ["js", "pug", "css"],
});

liveServer.watch(__dirname);

const app = express();

const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use(livereloadMiddleware());

app.get("/", (_, res) => res.render("home"));

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.use("/public", express.static(__dirname + "/public"));

app.get("/*", (req, res) => {
  res.redirect("/");
});

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("join", `${socket["nickname"]} joined!`);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("leave", `${socket["nickname"]} left!`)
    );
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket["nickname"]}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});

// const wss = new WebSocket.Server({ server });

// const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   console.log("✅ Connected to Browser");
//   socket["nickname"] = "익명";
//   socket.on("close", () => {
//     sockets.splice(sockets.indexOf(socket), 1);
//     console.log("❌ Disconnected from Browser");
//   });
//   socket.on("message", (message) => {
//     const parsedMessage = JSON.parse(message);
//     switch (parsedMessage.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => {
//           if (aSocket !== socket) {
//             aSocket.send(`${socket.nickname}: ${parsedMessage.payload}`);
//           }
//         });
//         break;
//       case "nickname":
//         socket["nickname"] = parsedMessage.payload;
//         break;
//     }
//   });
// });

server.listen(PORT, handleListening);
