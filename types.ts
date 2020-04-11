export type ColumnsConfig = {
  [key: number]: string;
}

export type Response = {
  success: boolean;
  status: number;
}

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

export type Grid = ColumnsConfig[]
