import { useEffect, useState } from 'react';
import { GameBrief } from '../../../../libs/api';
import config from '../../../../libs/config';

/**
 * The game component's props.
 */
export interface GameProps {
  game: GameBrief;
  move: (position: number) => void;
}

/**
 * Render the game component.
 *
 * @param props The component's props.
 * @returns The component.
 */
function Game(props: GameProps) {
  // Define states
  const [win, setWin] = useState<boolean | null>(null);

  // Register key listeners
  useEffect(() => {
    let keyInterval: NodeJS.Timeout | null = null;

    const createKeyInterval = (padSpeed: number) =>
      (keyInterval = setInterval(() => props.move(padSpeed)));

    const clearKeyInterval = () => {
      clearInterval(keyInterval!);
      keyInterval = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (keyInterval) {
        return;
      }

      if (e.key === 'ArrowDown') {
        createKeyInterval(config.padSpeed);
      }

      if (e.key === 'ArrowUp') {
        createKeyInterval(-config.padSpeed);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (keyInterval && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        clearKeyInterval();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Check for the winner
  if (
    win === null &&
    props.game.yourScore + props.game.oppenentScore >= props.game.rounds
  ) {
    setWin(props.game.yourScore >= props.game.oppenentScore);
  }

  return (
    <div
      className="box-content relative border-black bg-yellow-50"
      style={{ width: `${config.width}px`, height: `${config.height}px` }}
    >
      <div className="absolute flex flex-row justify-around w-32 text-2xl text-black -translate-x-1/2 top-2 left-1/2">
        <div>{props.game.yourScore}</div>
        <div>{props.game.oppenentScore}</div>
      </div>
      <div className="absolute top-0 bottom-0 -translate-x-1/2 border-2 border-black border-dashed left-1/2"></div>
      <div
        className="absolute top-0 left-0 origin-center bg-blue-800 rounded-full"
        style={{
          width: `${config.ballSize}px`,
          height: `${config.ballSize}px`,
          transform: `translate(${props.game.ball.x - config.ballSize / 2}px, ${
            props.game.ball.y - config.ballSize / 2
          }px)`,
        }}
      ></div>
      <div
        className="absolute top-0 left-0 origin-center bg-red-500"
        style={{
          width: '8px',
          height: config.padSize,
          transform: `translateY(${props.game.you}px)`,
        }}
      ></div>
      <div
        className="absolute top-0 right-0 origin-center bg-red-500"
        style={{
          width: '8px',
          height: config.padSize,
          transform: `translateY(${props.game.opponent}px)`,
        }}
      ></div>
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 p-3 ${
          win === true ? 'bg-green-500' : win === false ? 'bg-red-500' : null
        }`}
      >
        <div className={`text-white ${win === true ? 'block' : 'hidden'}`}>
          Yow win <b>[{props.game.bet} SHIBMS]</b>...
          <i>
            {' '}
            (The game is BETA. After upgrade the auto-send will be available)
          </i>
        </div>
        <div className={`text-white ${win === false ? 'block' : 'hidden'}`}>
          You lost <b>[{props.game.bet} SHIBMS]</b>...{' '}
          <i>
            (The game is BETA. Your tokens are in your account. After upgrade
            the auto-send will be available)
          </i>
        </div>
      </div>
    </div>
  );
}

export default Game;
