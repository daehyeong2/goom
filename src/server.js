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
app.get("/*", (_, res) => res.redirect("/"));

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.use("/public", express.static(__dirname + "/public"));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

server.listen(PORT, handleListening);
