import { useEffect, useState } from 'react';
import { getGamePhase, formatTime, GamePhase } from '../lib/gameTimer';
import EmailSubmissionForm from './EmailSubmissionForm';
import SubmissionsList from './SubmissionsList';

export default function GamePhaseDisplay() {
  const [gamePhase, setGamePhase] = useState<GamePhase | null>(null);

  useEffect(() => {
    const updatePhase = () => {
      const serverTime = Date.now();
      setGamePhase(getGamePhase(serverTime));
    };

    updatePhase();
    const interval = setInterval(updatePhase, 100);

    return () => clearInterval(interval);
  }, []);

  if (!gamePhase) {
    return <div className="text-center text-cyan-400">Loading...</div>;
  }

  return (
    <div className="w-full">
      {gamePhase.phase === 'countdown' && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest">
              Next Round Starts In
            </h2>
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-red-500 to-blue-500 font-mono">
              {formatTime(gamePhase.timeRemaining)}
            </div>
          </div>
        </div>
      )}

      {gamePhase.phase === 'submission' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest animate-pulse">
              STRIKE NOW!
            </h2>
            <p className="text-cyan-400">Time to submit your email</p>
            <div className="text-6xl font-black text-red-500 font-mono">
              {formatTime(gamePhase.timeRemaining)}
            </div>
          </div>

          <EmailSubmissionForm cycleNumber={gamePhase.cycleNumber} />
          <SubmissionsList cycleNumber={gamePhase.cycleNumber} />
        </div>
      )}

      {gamePhase.phase === 'wait' && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest">
              Round In Progress
            </h2>
            <p className="text-gray-400">Next submission window opens in:</p>
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">
              {formatTime(gamePhase.timeRemaining)}
            </div>
          </div>

          <SubmissionsList cycleNumber={gamePhase.cycleNumber} />
        </div>
      )}
    </div>
  );
}
