import http from "http";
import WebSocket from "ws";
import express from "express";
import morgan from "morgan";
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
app.use(morgan("dev"));

app.get("/", (_, res) => res.render("home"));

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.use("/public", express.static(__dirname + "/public"));

app.get("/*", (req, res) => {
  res.redirect("/");
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("✅ Connected to Browser");
  socket.on("close", () => console.log("❌ Disconnected from Browser"));
  socket.on("message", (message) => {
    console.log("📬 Got a message from the Browser:", message.toString());
  });
  socket.send("Hello!");
});

server.listen(PORT, handleListening);
