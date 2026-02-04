const CYCLE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const COUNTDOWN_DURATION = 3.5 * 60 * 60 * 1000; // 3:30 in milliseconds
const SUBMISSION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const WAIT_DURATION = 28 * 60 * 1000; // 28 minutes in milliseconds

export interface GamePhase {
  phase: 'countdown' | 'submission' | 'wait';
  timeRemaining: number; // in milliseconds
  cycleNumber: number;
}

export function getGamePhase(serverTime: number): GamePhase {
  // Use a fixed start time for the first cycle (Unix epoch)
  const fixedCycleStart = 0;

  const timeSinceStart = serverTime - fixedCycleStart;
  const cyclePosition = timeSinceStart % CYCLE_DURATION;
  const cycleNumber = Math.floor(timeSinceStart / CYCLE_DURATION);

  let phase: 'countdown' | 'submission' | 'wait';
  let timeRemaining: number;

  if (cyclePosition < COUNTDOWN_DURATION) {
    phase = 'countdown';
    timeRemaining = COUNTDOWN_DURATION - cyclePosition;
  } else if (cyclePosition < COUNTDOWN_DURATION + SUBMISSION_DURATION) {
    phase = 'submission';
    timeRemaining = COUNTDOWN_DURATION + SUBMISSION_DURATION - cyclePosition;
  } else {
    phase = 'wait';
    timeRemaining = CYCLE_DURATION - cyclePosition;
  }

  return {
    phase,
    timeRemaining,
    cycleNumber,
  };
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
