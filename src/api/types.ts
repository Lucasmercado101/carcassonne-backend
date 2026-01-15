export type Coords = {
  x: number;
  y: number;
};

export type Meeple = {
  id: number;
  x: number;
  y: number;
};

export type PlayerData = {
  team: TeamColor;
  score: number;
  origin: Coords;
  zoom: number;
  deviceDimensions: {
    width: number;
    height: number;
  };
  availableMeeples: Meeple[];
  placedMeeples: Meeple[];
  cursorPosition?: Coords;
  isOnTouchScreen: boolean;
  isPlaying: boolean;
  isTurn: boolean;
};

export type TeamColor = "blue" | "red" | "yellow" | "green" | "purple";

export type UserActionData<T> = {
  team: TeamColor;
  data: T;
};
