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

io.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("join_room");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye");
    });
  });
});

server.listen(PORT, handleListening);
