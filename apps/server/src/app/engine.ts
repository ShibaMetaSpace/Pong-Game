import { Server, Socket } from 'socket.io';
import Store from './store';
import {
  AcceptRequest,
  GameBrief,
  InviteRequest,
  MoveRequest,
  RegisterRequest,
} from '../../../../libs/api';
import config from '../../../../libs/config';
import { Game } from './types';

export default class Engine {
  /**
   * Engine constructor.
   *
   * @param store
   */
  constructor(private server: Server, private store: Store) {}

  /**
   * Start game engine.
   */
  start() {
    this.server.on('connect', (socket) => {
      socket.on('register', (data: RegisterRequest) =>
        this.handleSocketMessage(socket, () => this.register(socket, data))
      );
      socket.on('unregister', () =>
        this.handleSocketMessage(socket, () => this.unregister(socket))
      );
      socket.on('invite', (data: InviteRequest) =>
        this.handleSocketMessage(socket, () => this.invite(socket, data))
      );
      socket.on('accept', (data: AcceptRequest) =>
        this.handleSocketMessage(socket, () => this.accept(socket, data))
      );
      socket.on('move', (data: MoveRequest) =>
        this.handleSocketMessage(socket, () => this.move(socket, data))
      );
      socket.on('leave', () =>
        this.handleSocketMessage(socket, () => this.leave(socket))
      );
      socket.on('disconnect', () =>
        this.handleSocketMessage(socket, () => this.unregister(socket))
      );
    });

    this.run();
  }

  /**
   * Run the game loop.
   */
  run() {
    setInterval(() => {
      // Loop over each existing game and process them
      this.store.getGames().forEach((game) => {
        this.updateGame(game);
        this.emitGame(game);
      });
    }, config.tickInterval);
  }

  /**
   * Handle socket message.
   *
   * @param socket The websocket instance.
   * @param handler The handler to be wrapped.
   */
  handleSocketMessage(socket: Socket, handler: () => void) {
    try {
      handler();
    } catch (e) {
      socket.emit('error', e.toString());
    }
  }

  /**
   * Register new player.
   *
   * @param socket The websocket instance.
   * @param request The register requests.
   */
  private register(socket: Socket, request: RegisterRequest) {
    const player = this.store.getPlayerBySocket(socket);
    if (player) {
      throw new Error('Player already registered.');
    }

    this.store.registerPlayer({
      id: request.id,
      balance: request.balance,
      invites: {},
      socket,
      guest: request.guest,
    });

    this.emitPlayers();
  }

  /**
   * Unregister existing player.
   *
   * @param socket The websocket instance.
   */
  private unregister(socket: Socket) {
    const player = this.store.getPlayerBySocket(socket);
    if (!player) {
      return;
    }

    this.store.getPlayers().forEach((player) => {
      delete player.invites[player.id];
    });

    this.store.unregisterPlayer(player);

    this.emitPlayers();
  }

  /**
   * Invite a player.
   *
   * @param socket The websocket instance.
   * @param request The invitation request.
   */
  private invite(socket: Socket, request: InviteRequest) {
    const player = this.store.getPlayerBySocket(socket);
    if (!player) {
      throw new Error('Invalid player.');
    }

    const invitedPlayer = this.store.getPlayerById(request.id);
    if (!invitedPlayer) {
      throw new Error('Invalid player invited.');
    }

    if (player.id === invitedPlayer.id) {
      throw new Error('Cannot invite yourself.');
    }

    invitedPlayer.invites[player.id] = {
      player,
      bet: request.bet,
      rounds: request.rounds,
    };

    this.emitInvites(invitedPlayer.socket);
  }

  /**
   * Accept player invite.
   *
   * @param socket The websocket instance.
   * @param request The invitation accept request.
   */
  private accept(socket: Socket, request: AcceptRequest) {
    const player = this.store.getPlayerBySocket(socket);
    if (!player) {
      throw new Error('Invalid player.');
    }

    const hostPlayer = this.store.getPlayerById(request.id);
    if (!hostPlayer) {
      throw new Error('Invalid host player.');
    }

    const invite = player.invites[hostPlayer.id];
    if (!invite) {
      throw new Error('No invite found for the player.');
    }

    delete player.invites[hostPlayer.id];

    const game = this.store.createGame(hostPlayer, invite.bet, invite.rounds);
    this.store.joinGame(game, player);

    this.emitInvites(player.socket);
  }

  /**
   * Move player.
   *
   * @param socket The websocket instance.
   * @param request The player move request.
   */
  private move(socket: Socket, request: MoveRequest) {
    const player = this.store.getPlayerBySocket(socket);
    if (!player) {
      throw new Error('Invalid player.');
    }

    player.meta.position += request.position;

    if (player.meta.position < 0) {
      player.meta.position = 0;
    }

    if (player.meta.position + config.padSize > config.height) {
      player.meta.position = config.height - config.padSize;
    }
  }

  /**
   * Leave game.
   *
   * @param socket The websocket instance.
   */
  private leave(socket: Socket) {
    const player = this.store.getPlayerBySocket(socket);
    if (!player) {
      throw new Error('Invalid player.');
    }

    player.game.players.forEach((p) => {
      if (p.id !== player.id) {
        p.socket.emit('close');
      }
    });

    this.store.leaveGame(player.game, player);
  }

  /**
   * Emit players.
   *
   * @param socket The websocket instance.
   */
  private emitPlayers() {
    this.store.getPlayers().forEach((player) =>
      player.socket.emit(
        'players',
        this.store.getPlayers().map((player) => ({
          id: player.id,
          balance: player.balance,
          guest: player.guest,
        }))
      )
    );
  }

  /**
   * Emit invites.
   *
   * @param socket The websocket instance.
   */
  private emitInvites(socket: Socket) {
    const player = this.store.getPlayerBySocket(socket);
    if (!player) {
      throw new Error('Invalid player.');
    }

    socket.emit(
      'invites',
      Object.values(player.invites).map((invite) => ({
        id: invite.player.id,
        bet: invite.bet,
        rounds: invite.rounds,
      }))
    );
  }

  /**
   * Update game.
   *
   * @param game The game to be updated.
   */
  private updateGame(game: Game) {
    // Skip finished games
    if (
      game.players[0].meta.score + game.players[1].meta.score >=
      game.rounds
    ) {
      return;
    }

    // Move the ball
    game.ball.x += game.ball.dx;
    game.ball.y += game.ball.dy;

    // Check for exceeding player bounds
    if (game.ball.x < 0 || game.ball.x > config.width) {
      // Player 0 loses the ball
      if (game.ball.x < 0) {
        game.players[1].meta.score++;
      }

      // Player 1 loses the ball
      if (game.ball.x > config.width) {
        game.players[0].meta.score++;
      }

      // Reinitialize ball position to the center
      game.ball.x = config.width / 2;
      game.ball.y = config.height / 2;

      // Randomize direction
      game.ball.dx = Math.random() < 0.5 ? 1 : -1;
      game.ball.dy = Math.random() < 0.5 ? 1 : -1;
    }

    // Check for exceeding table upper and lower bounds
    // and change the ball's DY direction.
    if (game.ball.y < 0 || game.ball.y > config.height) {
      game.ball.dy *= -1;
    }

    // Check if Player 0's pad catched the ball
    // and change the ball's DX direction.
    if (
      game.ball.x < 8 &&
      game.ball.y + config.ballSize > game.players[0].meta.position &&
      game.ball.y < game.players[0].meta.position + config.padSize
    ) {
      game.ball.dx *= -1;
    }

    // Check if Player 1's pad catched the ball
    // and change the ball's DX direction.
    if (
      game.ball.x > config.width - 8 &&
      game.ball.y + config.ballSize > game.players[1].meta.position &&
      game.ball.y < game.players[1].meta.position + config.padSize
    ) {
      game.ball.dx *= -1;
    }
  }

  /**
   * Emit game to it's participants by using individual viewpoints.
   *
   * @param game The game to be emitted.
   */
  private emitGame(game: Game) {
    game.players.forEach((player) => {
      player.socket.emit('game', {
        id: game.id,
        rounds: game.rounds,
        bet: game.bet,
        opponentId:
          game.players[1].id === player.id
            ? game.players[0].id
            : game.players[1].id,
        ball: {
          x:
            game.players[0].id === player.id
              ? game.ball.x
              : config.width - game.ball.x,
          y: game.ball.y,
        },
        you:
          game.players[0].id === player.id
            ? game.players[0].meta?.position
            : game.players[1].meta?.position,
        opponent:
          game.players[1].id === player.id
            ? game.players[0].meta?.position
            : game.players[1].meta?.position,
        yourScore:
          game.players[0].id === player.id
            ? game.players[0].meta?.score
            : game.players[1].meta?.score,
        oppenentScore:
          game.players[1].id === player.id
            ? game.players[0].meta?.score
            : game.players[1].meta?.score,
      } as GameBrief);
    });
  }
}
