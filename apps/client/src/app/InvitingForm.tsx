import { useState } from 'react';
import { Player } from '../../../../libs/api';

/**
 * Inviting form props.
 */
export type InvitingFormProps = {
  you: Player;
  oppenent: Player;
  submit: (player: Player, bet: number, rounds: number) => void;
  close: () => void;
};

/**
 * Render inviting form.
 *
 * @param props The props to be passed to the form.
 * @returns The inviting form component.
 */
function InvitingForm(props: InvitingFormProps) {
  // Define states
  const [bet, setBet] = useState(0);
  const [rounds, setRounds] = useState(0);

  const canBetForFree = props.you.guest || props.oppenent.guest;

  // Balance checking
  const sufficientFundsYou = bet <= props.you.balance;
  const sufficientFundsOpponent = bet <= props.oppenent.balance;

  // Check if the form is valid
  const isValid =
    sufficientFundsYou &&
    sufficientFundsOpponent &&
    (canBetForFree || bet >= 0) &&
    rounds > 0;

  return (
    <div className="invite">
      <div className="flex flex-row items-center justify-between">
        Bet amount
        <button
          className="w-8 h-8 text-white bg-red-500 right"
          onClick={props.close}
        >
          &times;
        </button>
      </div>
      <input
        type="text"
        placeholder={canBetForFree ? '0 (Guests)' : '0.00'}
        disabled={canBetForFree}
        className={`pl-2 h-8 border-[1px] border-green ${
          canBetForFree ? 'bg-gray-100' : null
        }`}
        onInput={(e) => setBet(parseInt(e.currentTarget.value) || 0)}
      />
      {!sufficientFundsYou ? (
        <div className="text-red-500">You have insufficient funds.</div>
      ) : !sufficientFundsOpponent ? (
        <div className="text-red-500">
          The opponent have insufficient funds.
        </div>
      ) : null}
      <div className="flex flex-row items-center justify-between">
        Number of rounds
      </div>
      <input
        type="text"
        placeholder="0"
        className="pl-2 h-8 border-[1px] border-green "
        onInput={(e) => setRounds(parseInt(e.currentTarget.value))}
      />
      <button
        className={`button_invite ${!isValid ? 'opacity-60' : null}`}
        disabled={!isValid}
        onClick={() => props.submit(props.oppenent, bet, rounds)}
      >
        Invite
      </button>
    </div>
  );
}

export default InvitingForm;
