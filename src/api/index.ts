import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import type { PlayersData, UserActionData } from "./types";

const app = express();
const server = createServer(app);

const TILES_DATA = "tiles-data";

let meeplesId = 0;
const STARTING_MEEPLES = 7;

export const DEFAULT_UNDRAWN_TILES = [
  { imageId: 1, amount: 2 },
  { imageId: 2, amount: 4 },
  { imageId: 3, amount: 5 },
  { imageId: 4, amount: 1 },
  { imageId: 5, amount: 1 },
  { imageId: 6, amount: 1 },
  { imageId: 7, amount: 1 },
  { imageId: 8, amount: 3 },
  { imageId: 9, amount: 2 },
  { imageId: 10, amount: 3 },
  { imageId: 11, amount: 3 },
  { imageId: 12, amount: 3 },
  { imageId: 13, amount: 2 },
  { imageId: 14, amount: 3 },
  { imageId: 15, amount: 2 },
  { imageId: 16, amount: 3 },
  { imageId: 17, amount: 1 },
  { imageId: 18, amount: 3 },
  { imageId: 19, amount: 2 },
  { imageId: 20, amount: 1 },
  { imageId: 21, amount: 8 },
  { imageId: 22, amount: 9 },
  { imageId: 23, amount: 4 },
  { imageId: 24, amount: 1 }
];

let currUndrawnTiles = [...DEFAULT_UNDRAWN_TILES];

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

type DrawnTile = {
  imageId: number;
  uid: string;
  x: number;
  y: number;
  rotationDegree: number;
};

let drawnTiles: DrawnTile[] = [];

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.emit("playersData", playersData);
  socket.emit(TILES_DATA, {
    drawnTiles,
    undrawnTiles: currUndrawnTiles
  });
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
    io.emit(TILES_DATA, {
      drawnTiles,
      undrawnTiles: currUndrawnTiles
    });
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

  socket.on("meeple-placed", (msg: UserPlacedMeepleData) => {
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

  type OnDrawTileAction = UserActionData<{
    imageId: number;
    uid: string;
    x: number;
    y: number;
  }>;

  socket.on("tile-drawn", (msg: OnDrawTileAction) => {
    console.log("tile drawn", msg);
    const drawnTile = currUndrawnTiles.find(
      (tile) => tile.imageId === msg.data.imageId
    );

    currUndrawnTiles = currUndrawnTiles
      .map((tile) => {
        if (tile.imageId === drawnTile?.imageId) {
          return { ...tile, amount: tile.amount - 1 };
        }
        return tile;
      })
      .filter((tile) => tile.amount > 0);

    drawnTiles.push({
      imageId: msg.data.imageId,
      uid: msg.data.uid,
      x: msg.data.x,
      y: msg.data.y,
      rotationDegree: 0
    });
    io.emit(TILES_DATA, { drawnTiles, undrawnTiles: currUndrawnTiles });
  });

  type TileMovedData = UserActionData<{
    uid: string;
    x: number;
    y: number;
  }>;

  socket.on("tile-moved", (msg: TileMovedData) => {
    console.log("tile moved", msg);

    drawnTiles = drawnTiles.map((tile) => {
      if (tile.uid === msg.data.uid) {
        return { ...tile, x: msg.data.x, y: msg.data.y };
      }
      return tile;
    });
    io.emit(TILES_DATA, { drawnTiles, undrawnTiles: currUndrawnTiles });
  });

  type TileRotatedData = UserActionData<{
    uid: string;
    rotationDegree: number;
  }>;

  socket.on("tile-rotated", (msg: TileRotatedData) => {
    console.log("tile rotated", msg);
    drawnTiles = drawnTiles.map((tile) => {
      if (tile.uid === msg.data.uid) {
        return { ...tile, rotationDegree: msg.data.rotationDegree };
      }
      return tile;
    });
    io.emit(TILES_DATA, { drawnTiles, undrawnTiles: currUndrawnTiles });
  });

  type UserCursorMovedData = UserActionData<{
    worldX: number;
    worldY: number;
  }>;

  socket.on("cursor-moved", ({ team, data }: UserCursorMovedData) => {
    console.log("cursor moved", data);
    playersData[team].cursorPosition = {
      x: data.worldX,
      y: data.worldY
    };
    socket.broadcast.emit("playersData", playersData);
  });
});

app.use(express.static("src/built_front"));

app.get("/api/get-current-play-data", (req, res) => {
  res.json({
    playersData,
    undrawnTiles: currUndrawnTiles,
    drawnTiles
  });
});

// Serve index.html for all routes (SPA fallback)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), "src/built_front", "index.html"));
});

const PORT = process.env.PORT || 4123;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
