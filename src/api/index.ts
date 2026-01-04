import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server({
  cors: { origin: "http://localhost:5173" }
});

io.on("connection", (socket) => {
  console.log("a user connected");
});
io.listen(server);

server.listen(4000, () => {
  console.log("server is running on port 4000");
});
