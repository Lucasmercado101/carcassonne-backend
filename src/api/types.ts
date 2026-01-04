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

export type UserActionData<T> = {
  team: TeamColor;
  data: T;
};
