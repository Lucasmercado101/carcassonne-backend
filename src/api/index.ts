import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server({
  cors: { origin: "http://localhost:5173" }
});

type PlayerData = {
  score: number;
  origin: {
    x: number;
    y: number;
  };
};

type PlayersData = {
  blue: PlayerData;
  red: PlayerData;
};

const playersData: PlayersData = {
  blue: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    }
  },
  red: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    }
  }
};

io.on("connection", (socket) => {
  console.log("a user connected");
});
io.listen(server);

server.listen(4000, () => {
  console.log("server is running on port 4000");
});
