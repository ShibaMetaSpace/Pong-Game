import { Player } from '../../../../libs/api';

export interface OnlinePlayersProps {
  current: Player;
  players: Player[];
  select: (player: Player) => void;
}

function OnlinePlayers(props: OnlinePlayersProps) {
  return (
    <div>
      <div className="mb-1">Online users:</div>
      <div className="flex flex-row flex-wrap gap-1">
        {props.players.map((player) => (
          <div
            className={`online_users ${
              props.current.id === player.id
                ? 'bg-green-502'
                : 'bg-sky-600 cursor-pointer'
            }`}
            key={player.id}
            onClick={() =>
              player.id !== props.current.id ? props.select(player) : null
            }
          >
            {player.id} - {player.balance} SHIBMS 
            {player.guest ? ' (Guest)' : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OnlinePlayers;
