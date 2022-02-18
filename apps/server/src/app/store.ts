import { v4 } from 'uuid';
import { Socket } from 'socket.io';
import { Game, Player } from './types';
import config from '../../../../libs/config';

export default class Store {
  /**
   * Map with all players.
   */
  private players: Record<string, Player> = {};

  /**
   * Map with all running games.
   */
  private games: Record<string, Game> = {};

  /**
   * Map socket ID to player.
   */
  private socketIdToPlayer: Record<string, Player> = {};

  /**
   * Register player.
   *
   * @param player
   */
  registerPlayer(player: Player) {
    this.players[player.id] = player;
    this.socketIdToPlayer[player.socket.id] = player;
  }

  /**
   * Unregister player.
   *
   * @param player
   */
  unregisterPlayer(player: Player) {
    delete this.players[player.id];
    delete this.socketIdToPlayer[player.socket.id];
  }

  /**
   * Get player by ID.
   *
   * @param id
   * @returns
   */
  getPlayerById(id: string) {
    return this.players[id];
  }

  /**
   * Get player by socket.
   *
   * @param socket
   * @returns
   */
  getPlayerBySocket(socket: Socket) {
    return this.socketIdToPlayer[socket.id];
  }

  /**
   * Get game by ID.
   *
   * @param id
   * @returns
   */
  getGameById(id: string) {
    return this.games[id];
  }

  /**
   * Create a new game.
   *
   * @param player
   * @param bet
   * @param rounds
   * @returns
   */
  createGame(player: Player, bet: number, rounds: number) {
    if (player.game) {
      throw new Error('Player is already in a game.');
    }

    player.meta = {
      position: (config.height - config.padSize) / 2,
      score: 0,
    };

    const game: Game = {
      id: v4(),
      bet,
      rounds,
      ball: {
        x: config.width / 2,
        y: config.height / 2,
        dx: 1,
        dy: 1,
      },
      players: [player],
    };

    this.games[game.id] = game;

    player.game = game;

    return game;
  }

  /**
   * Delete an existing game.
   *
   * @param game
   */
  deleteGame(game: Game) {
    game.players.forEach((player) => (player.game = null));

    delete this.games[game.id];
  }

  /**
   * Join an existing game.
   *
   * @param game
   * @param player
   */
  joinGame(game: Game, player: Player) {
    if (game.players.length >= 2) {
      throw new Error('Game is full.');
    }

    player.meta = {
      position: (config.height - config.padSize) / 2,
      score: 0,
    };

    game.players.push(player);

    player.game = game;
  }

  /**
   * Leave an existing game.
   *
   * @param game
   * @param player
   */
  leaveGame(game: Game, player: Player) {
    if (player.game.id !== game.id) {
      throw new Error('Player is not in the game.');
    }

    const playerIndex = game.players.findIndex((p) => p.id === player.id);
    if (playerIndex === -1) {
      throw new Error('Player is not in the game.');
    }

    game.players.splice(playerIndex, 1);
    player.game = null;

    if (game.players.length < 2) {
      this.deleteGame(game);
    }
  }

  /**
   * Update player data.
   *
   * @param player
   * @param data
   */
  updatePlayer(player: Player, data: Partial<Player>) {
    Object.keys(data).forEach((key) => {
      player[key] = data[key];
    });
  }

  /**
   * Update game data.
   *
   * @param game
   * @param data
   */
  updateGame(game: Player, data: Partial<Player>) {
    Object.keys(data).forEach((key) => {
      game[key] = data[key];
    });
  }

  /**
   * Get players.
   *
   * @returns
   */
  getPlayers() {
    return Object.values(this.players);
  }

  /**
   * Get games.
   *
   * @returns
   */
  getGames() {
    return Object.values(this.games);
  }
}
