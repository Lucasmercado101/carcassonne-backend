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
};

export type TeamColor = "blue" | "red" | "yellow" | "green" | "purple";

export type PlayersData = Record<TeamColor, PlayerData>;

export type UserActionData<T> = {
  team: TeamColor;
  data: T;
};
