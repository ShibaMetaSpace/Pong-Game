import { Player } from '../../../../libs/api';

/**
 * The player inviting props.
 */
export interface PlayerInvitedProps {
  player: Player;
}

/**
 * Render the player invited component.
 *
 * @param props The component's props.
 * @returns The component.
 */
function PlayerInvited(props: PlayerInvitedProps) {
  return (
    <div className="inline-block px-3 py-2 text-white bg-blue-500 rounded-md">
      You invited <strong>{props.player.id}</strong>. Wait for him to accept
      your invitation...
    </div>
  );
}

export default PlayerInvited;
