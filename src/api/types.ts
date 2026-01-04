export type Coords = {
  x: number;
  y: number;
};

export type PlayerData = {
  score: number;
  origin: Coords;
  zoom: number;
  deviceDimensions: {
    width: number;
    height: number;
  };
  availableMeeples: number;
  placedMeeples: Coords[];
};

export type TeamColor = "blue" | "red" | "yellow" | "green" | "purple";

export type PlayersData = Record<TeamColor, PlayerData>;

export const playersData: PlayersData = {
  blue: {
    score: 0,
    origin: {
      x: 0,
      y: 0
    },
    zoom: 1,
    deviceDimensions: { width: 0, height: 0 },
    availableMeeples: 0,
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
    availableMeeples: 0,
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
    availableMeeples: 0,
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
    availableMeeples: 0,
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
    availableMeeples: 0,
    placedMeeples: []
  }
};

export type UserActionData<T> = {
  team: TeamColor;
  data: T;
};
