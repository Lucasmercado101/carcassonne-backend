import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import type {
  PlayerData,
  PlayersData,
  TeamColor,
  UserActionData
} from "./types";

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

const playersData: PlayersData = [];

function mapPlayer(team: TeamColor, mapFn: (player: PlayerData) => PlayerData) {
  return playersData.map((player) => {
    if (player.team === team) {
      return mapFn(player);
    }
    return player;
  });
}

type DrawnTile = {
  imageId: number;
  uid: string;
  x: number;
  y: number;
  rotationDegree: number;
  isHighlighted: boolean;
};

let drawnTiles: DrawnTile[] = [];

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);

  socket.on("user-panned", (data: UserActionData<{ x: number; y: number }>) => {
    const { x, y } = data.data;
    console.log(`user ${data.team} panned to (${x}, ${y})`);
    mapPlayer(data.team, (player) => ({ ...player, origin: { x, y } }));
    const resp: UserActionData<{ x: number; y: number }> = {
      team: data.team,
      data: { x, y }
    };
    socket.broadcast.emit("user-panned", resp);
  });

  type UserTeamSelectedData = UserActionData<{
    width: number;
    height: number;
    zoom: number;
    x: number;
    y: number;
    isOnTouchScreen: boolean;
  }>;

  socket.on("team-selected", ({ team, data }: UserTeamSelectedData) => {
    console.log("user team selected", data);
    if (!playersData.find((player) => player.team === team)) {
      playersData.push({
        team: team,
        score: 0,
        origin: { x: 0, y: 0 },
        zoom: 1,
        deviceDimensions: { width: 0, height: 0 },
        availableMeeples: genMeeples(),
        placedMeeples: [],
        isOnTouchScreen: data.isOnTouchScreen,
        isPlaying: true
      });
    } else {
      mapPlayer(team, (player) => ({
        ...player,
        deviceDimensions: data,
        zoom: data.zoom,
        origin: { x: data.x, y: data.y },
        isOnTouchScreen: data.isOnTouchScreen
      }));
    }
    console.log("PLAYERS DATA", playersData);

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

  socket.on("user-zoomed", ({ team, data }: UserZoomedData) => {
    console.log("user zoomed", data);
    mapPlayer(team, (player) => ({
      ...player,
      zoom: data.zoom,
      origin: { x: data.x, y: data.y }
    }));

    type UserZoomedResponse = UserActionData<{
      zoom: number;
      x: number;
      y: number;
    }>;

    const resp: UserZoomedResponse = {
      team: team,
      data: {
        zoom: data.zoom,
        x: data.x,
        y: data.y
      }
    };

    socket.broadcast.emit("user-zoomed", resp);
  });

  type ResizedWindowData = UserActionData<{
    width: number;
    height: number;
  }>;

  socket.on("resized-window", ({ team, data }: ResizedWindowData) => {
    console.log("user resized window", data);
    mapPlayer(team, (player) => ({ ...player, deviceDimensions: data }));

    type ResizedWindowResponse = UserActionData<{
      width: number;
      height: number;
    }>;

    const response: ResizedWindowResponse = {
      team: team,
      data: data
    };

    socket.broadcast.emit("resized-window", response);
  });

  type UserPlacedMeepleData = UserActionData<{
    id: number;
    x: number;
    y: number;
  }>;

  socket.on("meeple-placed", ({ team, data }: UserPlacedMeepleData) => {
    console.log("user meeple placed", data);
    mapPlayer(team, (player) => ({
      ...player,
      placedMeeples: [
        ...player.placedMeeples,
        { id: data.id, x: data.x, y: data.y }
      ],
      availableMeeples: player.availableMeeples.filter(
        (meeple) => meeple.id !== data.id
      )
    }));
    socket.broadcast.emit("meeple-placed", { team, data });
  });

  type OnMeepleMovedData = UserActionData<{
    id: number;
    x: number;
    y: number;
  }>;

  socket.on("meeple-moved", ({ team, data }: OnMeepleMovedData) => {
    console.log("meeple moved", data);
    mapPlayer(team, (player) => ({
      ...player,
      placedMeeples: player.placedMeeples.map((meeple) => {
        if (meeple.id === data.id) {
          return { ...meeple, x: data.x, y: data.y };
        }
        return meeple;
      })
    }));
    socket.broadcast.emit("meeple-moved", { team, data });
  });

  type OnDrawTileAction = UserActionData<{
    imageId: number;
    uid: string;
    x: number;
    y: number;
  }>;

  socket.on("tile-drawn", ({ team, data }: OnDrawTileAction) => {
    console.log("tile drawn", data);
    const drawnTile = currUndrawnTiles.find(
      (tile) => tile.imageId === data.imageId
    );

    currUndrawnTiles = currUndrawnTiles
      .map((tile) => {
        if (tile.imageId === drawnTile?.imageId) {
          return { ...tile, amount: tile.amount - 1 };
        }
        return tile;
      })
      .filter((tile) => tile.amount > 0);

    drawnTiles = drawnTiles.map((tile) => ({ ...tile, isHighlighted: false }));
    drawnTiles.push({
      imageId: data.imageId,
      uid: data.uid,
      x: data.x,
      y: data.y,
      rotationDegree: 0,
      isHighlighted: true
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

    type TileMovedResponse = UserActionData<{
      uid: string;
      x: number;
      y: number;
    }>;

    const response: TileMovedResponse = {
      team: msg.team,
      data: {
        uid: msg.data.uid,
        x: msg.data.x,
        y: msg.data.y
      }
    };
    socket.broadcast.emit("tile-moved", response);
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

    type TileRotatedResponse = UserActionData<{
      uid: string;
      rotationDegree: number;
    }>;

    const response: TileRotatedResponse = {
      team: msg.team,
      data: {
        uid: msg.data.uid,
        rotationDegree: msg.data.rotationDegree
      }
    };
    socket.broadcast.emit("tile-rotated", response);
  });

  type UserCursorMovedData = UserActionData<{
    worldX: number;
    worldY: number;
  }>;

  socket.on("cursor-moved", ({ team, data }: UserCursorMovedData) => {
    console.log("cursor moved", data);
    mapPlayer(team, (player) => ({
      ...player,
      cursorPosition: { x: data.worldX, y: data.worldY }
    }));

    const response: UserActionData<{
      x: number;
      y: number;
    }> = {
      team: team,
      data: {
        x: data.worldX,
        y: data.worldY
      }
    };
    socket.broadcast.emit("cursor-moved", response);
  });

  type UserScoreChangedData = UserActionData<number>;

  socket.on("score-changed", ({ team, data }: UserScoreChangedData) => {
    console.log("score changed", data);
    mapPlayer(team, (player) => ({ ...player, score: data }));
    socket.broadcast.emit("score-changed", data);
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

// setInterval(() => {
//   // console.log("sending -> mocking lots of players changes");
//   const cursorMovedMockData = {
//     x: Math.random() * 1000,
//     y: Math.random() * 1000
//   };
//   // console.log("Mock data", cursorMovedMockData);
//   socket.broadcast.emit("cursor-moved", {
//     team: "blue",
//     data: cursorMovedMockData
//   });

//   const userPannedMockData = {
//     x: Math.random() * 100,
//     y: Math.random() * 100
//   };
//   socket.broadcast.emit("user-panned", {
//     team: "blue",
//     data: userPannedMockData
//   });

//   const userZoomedMockData = {
//     zoom: Math.random() * 1 + 0.5,
//     x: userPannedMockData.x,
//     y: userPannedMockData.y
//   };
//   socket.broadcast.emit("user-zoomed", {
//     team: "blue",
//     data: userZoomedMockData
//   });
// }, 2000);
