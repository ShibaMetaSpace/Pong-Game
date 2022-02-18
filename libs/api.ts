export type Player = {
  id: string;
  balance: number;
  guest: boolean;
};

export type RegisterRequest = {
  id: string;
  balance: number;
  guest: boolean;
};

export type InviteRequest = {
  id: string;
  bet: number;
  rounds: number;
};

export type AcceptRequest = {
  id: string;
};

export type MoveRequest = {
  position: number;
};

export type Position = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export type GameBrief = {
  id: string;
  rounds: number;
  opponentId: string;
  bet: number;
  ball: Position;
  you: number;
  opponent: number;
  yourScore: number;
  oppenentScore: number;
};

export type PlayersResponse = Player[];
export type Invite = InviteRequest;
