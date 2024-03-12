import http from "http";
import { Server } from "socket.io";
import express from "express";
import livereloadMiddleware from "connect-livereload";
import livereload from "livereload";
import { instrument } from "@socket.io/admin-ui";

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
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

function getPublicRooms() {
  const { sids, rooms } = io.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (!sids.get(key)) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName).size;
}

io.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    const newCount = countRoom(roomName);
    done(newCount);
    socket.to(roomName).emit("join", socket["nickname"], newCount);
    io.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("leave", socket["nickname"], countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", getPublicRooms());
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
