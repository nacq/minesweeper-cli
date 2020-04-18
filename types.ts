export type ColumnsConfig = {
  [key: number]: string;
}

type Response = {
  success: boolean;
  status: number;
}

export type ClickResponse = {
  result: {
    game?: {
      name: string;
      rows: number;
      cols: number;
      mines: number;
      status: string;
      grid: any[];
    },
    clicked?: {
      row: number;
      col: number;
      click_type: string;
    },
    // the existence of these two props mean the game is lost
    message?: string;
    clicks?: number;
  };
} & Response;

export type CreateGameResponse = {
  result: {
    name: string;
    rows: number;
    cols: number;
    mines: number;
    status: string;
    username: string;
  };
} & Response;

export type CreateUserResponse = {
  result: {
    username: string;
  };
} & Response;

export type CreateUserError = {
  type: string;
  message: string;
}

export type GameConfig = {
  name: string;
  rows: number;
  cols: number;
  mines: number;
  username: string;
};

export type Cell = {
  mine: boolean;
  clicked: boolean;
  coordinates: string;
  flagged: boolean;
  marked: boolean;
};

export type Row = Cell[];

export type Grid = Row[];

export type DrewGrid = ColumnsConfig[];
