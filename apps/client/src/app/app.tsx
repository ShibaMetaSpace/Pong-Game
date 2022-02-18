import { connect } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { GameBrief, Invite, Player } from '../../../../libs/api';
import OnlinePlayers from './OnlinePlayers';
import ConnectionStatus from './ConnectionStatus';
import { Socket } from 'socket.io-client';
import PlayerInvites from './PlayerInvites';
import InvitingForm from './InvitingForm';
import Game from './Game';
import { ERC20 } from '../utils/erc20';
import MetaMaskConnect from './MetaMaskConnect';
import { environment } from '../environments/environment';
import NoMetaMask from './NoMetaMask';
import PlayerInvited from './PlayerInvited';

/**
 * App props.
 */
export interface AppProps {
  provider?: any;
  erc20: ERC20;
}

/**
 * Render app component.
 *
 * @param props The app component props.
 * @returns The app component.
 */
export function App(props: AppProps) {
  // Define app state
  const [metaMaskConnected, setMetaMaskConnected] = useState<boolean>(false);
  const [metaMaskError, setMetaMaskError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [game, setGame] = useState<GameBrief | null>(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviting, setInviting] = useState<Player | null>(null);
  const [invited, setInvited] = useState<Player | null>(null);

  const socket = useRef<Socket | null>();

  useEffect(() => {
    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = connect(environment.production ? '' : ':3333');

    // Handle connection ready state
    socket.current.on('connect', async () => {
      setConnected(true);

      let player: Player | null = null;

      try {
        const erc20Info = await props.erc20.getInfo();

        setMetaMaskConnected(true);

        // Build player object
        player = {
          id: erc20Info.address,
          balance: erc20Info.balance,
          guest: false,
        } as Player;
      } catch (e: any) {
        setMetaMaskError(e.toString());
        setMetaMaskConnected(false);

        // Build guest player object
        player = {
          id: (Math.random() + 1).toString(36).substring(6),
          balance: 0,
          guest: true,
        } as Player;
      } finally {
        setPlayer(player);

        // Emit register event to server with the
        // built player object above.
        socket.current!.emit('register', player);
      }
    });

    // Listen for server events
    socket.current.on('players', setPlayers);
    socket.current.on('invites', setInvites);
    socket.current.on('game', (game) => {
      setGame(game);
      setInvited(null);
    });
    socket.current.on('close', () => setGame(null));

    // Disable MetaMask if there are no accounts
    props.provider?.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        setMetaMaskConnected(false);
      }
    });
  }, [metaMaskConnected]);

  /**
   * Invite player to play.
   *
   * @param player The player to be invited.
   * @param bet The bet value.
   * @param rounds The number of rounds to play.
   */
  const invite = (player: Player, bet: number, rounds: number) => {
    socket.current!.emit('invite', { id: player.id, bet, rounds });
    setInviting(null);
    setInvited(player);
  };

  /**
   * Accept invitation.
   *
   * @param invite The invitation sent by another player.
   */
  const accept = (invite: Invite) => {
    socket.current!.emit('accept', { id: invite.id });
  };

  /**
   * Move player.
   *
   * @param position The position offset to move to.
   */
  const move = (position: number) => {
    socket.current!.emit('move', { position });
  };

  /**
   * Leave the game.
   */
  const leave = () => {
    setGame(null);
    socket.current!.emit('leave');
  };

  // Leave the game if the opponent disconnects
  if (game && !players.some((player) => player.id === game.opponentId)) {
    leave();
    setInviting(null);
  }

  // Build the MetaMask connect component
  const metaMaskConnectComponent = metaMaskConnected ? null : props.provider ? (
    <MetaMaskConnect
      provider={props.provider}
      success={() => setMetaMaskConnected(true)}
      error={() => setMetaMaskConnected(false)}
      errorMessage={metaMaskError}
    />
  ) : (
    <NoMetaMask />
  );

  // Build game component based on the game state
  const gameComponent = game ? <Game game={game} move={move} /> : null;

  // Build online players component based on the game state
  const onlinePlayersComponent = game ? null : (
    <OnlinePlayers current={player!} players={players} select={setInviting} />
  );

  // Build player invited component based on the invited state
  const playerInvitedComponent = invited ? (
    <PlayerInvited player={invited} />
  ) : null;

  // Build player invites component based on the game state
  const playerInvitesComponent = game ? null : (
    <PlayerInvites invites={invites} accept={accept} />
  );

  // Build leave button component based on the game state
  const leaveButtonComponent = game ? (
    <button className="px-2 py-1 bg-red-500" onClick={leave}>
      Leave
    </button>
  ) : null;

  // Build invite form component based on the game state
  const inviteFormComponent = inviting ? (
    <InvitingForm
      you={player!}
      oppenent={inviting}
      submit={invite}
      close={() => setInviting(null)}
    />
  ) : null;

  // Build the app component
  return (
    <div>
      {metaMaskConnectComponent} <ConnectionStatus connected={connected} />
      <hr className="my-3 text-white" />
      {onlinePlayersComponent}
      <hr className="my-3 text-white" />
      
      {playerInvitedComponent}
      {playerInvitesComponent}
      {gameComponent}
      {leaveButtonComponent}
      {inviteFormComponent}
    </div>
  );
}

export default App;
