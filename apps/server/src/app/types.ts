import { Position } from '../../../../libs/api';
import { Socket } from 'socket.io';

export type PlayerMeta = {
  score: number;
  position: number;
};

export type PlayerInvite = {
  player: Player;
  bet: number;
  rounds: number;
};

export type PlayerInvites = Record<string, PlayerInvite>;

export type Player = {
  id: string;
  balance: number;
  socket: Socket;
  invites: PlayerInvites;
  guest: boolean;
  meta?: PlayerMeta;
  game?: Game;
};

export type Game = {
  id: string;
  bet: number;
  rounds: number;
  ball: Position;
  players: Player[];
};
