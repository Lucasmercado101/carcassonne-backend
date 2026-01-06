import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type { PlayersData, UserActionData } from "./types";

const app = express();
const server = createServer(app);

let meeplesId = 0;
const STARTING_MEEPLES = 7;

function genMeeples() {
  const meeples: {
    id: number;
    x: number;
    y: number;
  }[] = [];

  for (let i = 0; i < STARTING_MEEPLES; i++) {
    meeples.push({
      id: meeplesId++,
      x: 0,
      y: 0
    });
  }
  return meeples;
}

const playersData: PlayersData = {
  blue: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: { width: 0, height: 0 },
    availableMeeples: genMeeples(),
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
    availableMeeples: genMeeples(),
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
    availableMeeples: genMeeples(),
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
    availableMeeples: genMeeples(),
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
    availableMeeples: genMeeples(),
    placedMeeples: []
  }
};

const io = new Server({
  cors: { origin: "http://localhost:5175" }
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

  type UserPlacedMeepleData = UserActionData<{
    id: number;
    x: number;
    y: number;
  }>;

  socket.on("user-meeple-placed", (msg: UserPlacedMeepleData) => {
    console.log("user meeple placed", msg);
    playersData[msg.team].placedMeeples.push({
      id: msg.data.id,
      x: msg.data.x,
      y: msg.data.y
    });
    playersData[msg.team].availableMeeples = playersData[
      msg.team
    ].availableMeeples.filter((meeple) => meeple.id !== msg.data.id);
    io.emit("playersData", playersData);
  });

  type OnMeepleMovedData = UserActionData<{
    id: number;
    x: number;
    y: number;
  }>;

  socket.on("meeple-moved", (msg: OnMeepleMovedData) => {
    console.log("meeple moved", msg);
    playersData[msg.team].placedMeeples = playersData[
      msg.team
    ].placedMeeples.map((meeple) => {
      if (meeple.id === msg.data.id) {
        return { ...meeple, x: msg.data.x, y: msg.data.y };
      }
      return meeple;
    });
    io.emit("playersData", playersData);
  });
});

io.listen(server);

server.listen(4000, () => {
  console.log("server is running on port 4000");
});
