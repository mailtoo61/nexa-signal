import { useEffect } from 'react';

export function useGameLoop(
  active: boolean,
  tickMs: number,
  onTick: () => void,
): void {
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => onTick(), tickMs);
    return () => clearInterval(id);
  }, [active, onTick, tickMs]);
}
