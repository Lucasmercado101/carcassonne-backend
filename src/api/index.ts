import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type { PlayersData, UserActionData } from "./types";

const app = express();
const server = createServer(app);

const playersData: PlayersData = {
  blue: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: { width: 0, height: 0 },
    availableMeeples: 7,
    placedMeeples: []
  },
  red: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: {
      width: 0,
      height: 0
    },
    availableMeeples: 7,
    placedMeeples: []
  },
  yellow: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: {
      width: 0,
      height: 0
    },
    availableMeeples: 7,
    placedMeeples: []
  },
  green: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: {
      width: 0,
      height: 0
    },
    availableMeeples: 7,
    placedMeeples: []
  },
  purple: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: {
      width: 0,
      height: 0
    },
    availableMeeples: 7,
    placedMeeples: []
  }
};

const io = new Server({
  cors: { origin: "http://localhost:5173" }
});

io.on("connection", (socket) => {
  socket.emit("playersData", playersData);
  console.log(`user ${socket.id} connected`);

  socket.on("user-panned", (data: UserActionData<{ x: number; y: number }>) => {
    const { x, y } = data.data;
    playersData[data.team].origin = { x, y };
    console.log(`user ${data.team} panned to (${x}, ${y})`);
    io.emit("playersData", playersData);
  });

  type UserTeamSelectedData = UserActionData<{
    width: number;
    height: number;
  }>;

  socket.on("user-team-selected", (msg: UserTeamSelectedData) => {
    console.log("user team selected", msg);
    playersData[msg.team].deviceDimensions = msg.data;
    io.emit("playersData", playersData);
  });

  type UserZoomedData = UserActionData<{
    zoom: number;
    x: number;
    y: number;
  }>;

  socket.on("user-zoomed", (msg: UserZoomedData) => {
    console.log("user zoomed", msg);
    playersData[msg.team].zoom = msg.data.zoom;
    playersData[msg.team].origin = { x: msg.data.x, y: msg.data.y };
    io.emit("playersData", playersData);
  });

  type ResizedWindowData = UserActionData<{
    width: number;
    height: number;
  }>;

  socket.on("resized-window", (msg: ResizedWindowData) => {
    console.log("user resized window", msg);
    playersData[msg.team].deviceDimensions = msg.data;
    io.emit("playersData", playersData);
  });
});

io.listen(server);

server.listen(4000, () => {
  console.log("server is running on port 4000");
});
