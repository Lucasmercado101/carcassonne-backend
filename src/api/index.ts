import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server({
  cors: { origin: "http://localhost:5173" }
});

export type TeamColor = "blue" | "red" | "yellow" | "green" | "purple";

type PlayerData = {
  score: number;
  origin: {
    x: number;
    y: number;
  };
  zoom: number;
  deviceDimensions: {
    width: number;
    height: number;
  };
};

type PlayersData = {
  blue: PlayerData;
  red: PlayerData;
  yellow: PlayerData;
  green: PlayerData;
  purple: PlayerData;
};

const playersData: PlayersData = {
  blue: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: {
      width: 0,
      height: 0
    }
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
    }
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
    }
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
    }
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
    }
  }
};

type UserActionData<T> = {
  team: TeamColor;
  data: T;
};

io.on("connection", (socket) => {
  socket.emit("playersData", playersData);
  console.log(`user ${socket.id} connected`);

  socket.on("user-panned", (data: UserActionData<{ x: number; y: number }>) => {
    const { x, y } = data.data;
    playersData[data.team].origin = { x, y };
    console.log(`user ${data.team} panned to (${x}, ${y})`);
    io.emit("playersData", playersData);
  });

  type UserTeamSelectedData = {
    width: number;
    height: number;
  };

  socket.on(
    "user-team-selected",
    (msg: UserActionData<UserTeamSelectedData>) => {
      console.log("user team selected", msg);
      playersData[msg.team].deviceDimensions = msg.data;
      io.emit("playersData", playersData);
    }
  );
});

io.listen(server);

server.listen(4000, () => {
  console.log("server is running on port 4000");
});
