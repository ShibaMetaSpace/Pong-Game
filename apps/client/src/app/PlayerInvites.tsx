import { Invite } from '../../../../libs/api';

/**
 * The player invites props.
 */
export interface PlayerInvitesProps {
  accept: (invite: Invite) => void;
  invites: Invite[];
}

/**
 * Render the player invites component.
 *
 * @param props The component's props.
 * @returns The component.
 */
function PlayerInvites(props: PlayerInvitesProps) {
  if (props.invites.length > 0) {
    return (
      <div className="fixed flex flex-col justify-center px-4 py-5 -translate-x-1/2 -translate-y-1/2 bg-green-501 rounded-lg top-1/2 left-1/2 gap-x-2">
        {props.invites.map((invite) => (
          <div>
            <span>
              Player <b>[ {invite.id} ]</b> invited you to play{' '}
              <b>[ {invite.rounds} ]</b> games for <b>[ {invite.bet} SHIBMS]</b>:
            </span>
            <button
              className="px-2 py-1 ml-2 rounded-lg bg-sky-500"
              onClick={() => props.accept(invite)}
            >
              Accept
            </button>
          </div>
        ))}
      </div>
    );
  } else {
    return null;
  }
}

export default PlayerInvites;
