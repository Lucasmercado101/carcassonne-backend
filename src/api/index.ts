import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(4000, () => {
  console.log("server is running on port 4000");
});
