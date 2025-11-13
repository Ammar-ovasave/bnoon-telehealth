import { useEffect, useState } from "react";

export default function useTimer({ timeInSeconds }: { timeInSeconds: number }) {
  const [remainingTime, setRemainingTime] = useState(Math.max(timeInSeconds, 0));

  useEffect(() => {
    if (timeInSeconds && timeInSeconds >= 0) {
      setRemainingTime(timeInSeconds);
    }
  }, [timeInSeconds]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime((val) => {
        if (val <= 0) return val;
        return val - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return { remainingTime };
}
