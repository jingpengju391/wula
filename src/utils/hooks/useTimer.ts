import { useLatest } from "ahooks";
import { useState, useRef } from "react";

function useTimer(initial: number, interval = 1000) {
  const [time, setTime] = useState(initial);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const latestTime = useLatest(time);

  const setTimer = () => {
    if (timer.current) clearTimer();
    timer.current = setInterval(() => {
      if (latestTime.current != 0) {
        setTime((t) => t - 1);
      } else {
        clearTimer();
      }
    }, interval);
  };

  const clearTimer = () => {
    timer.current && clearInterval(timer.current);
    setTime(0);
  };

  return { time: latestTime.current, setTimer, clearTimer };
}

export default useTimer;
