import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { LapTime } from '../types';

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: ms.toString().padStart(2, '0')
    };
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    setLaps([]);
  };

  const addLap = () => {
    if (time === 0) return;

    const newLap: LapTime = {
      id: Date.now().toString(),
      lapNumber: laps.length + 1,
      lapTime: laps.length > 0 ? time - laps[laps.length - 1].totalTime : time,
      totalTime: time
    };

    setLaps([...laps, newLap]);
  };

  const displayTime = formatTime(time);
  const fastestLap = laps.length > 0 ? laps.reduce((min, lap) => lap.lapTime < min.lapTime ? lap : min) : null;
  const slowestLap = laps.length > 0 ? laps.reduce((max, lap) => lap.lapTime > max.lapTime ? lap : max) : null;

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Stopwatch</h1>

          <div className="text-center mb-8">
            <div className="text-7xl font-bold text-gray-800 mb-2 font-mono">
              {displayTime.minutes}:{displayTime.seconds}
            </div>
            <div className="text-3xl font-semibold text-gray-500 font-mono">
              .{displayTime.milliseconds}
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={toggleRunning}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>

            {(isRunning || time > 0) && (
              <button
                onClick={addLap}
                className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium shadow-lg"
              >
                <Plus size={24} />
                Lap
              </button>
            )}

            {time > 0 && !isRunning && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-medium shadow-lg"
              >
                <RotateCcw size={24} />
                Reset
              </button>
            )}
          </div>
        </div>

        {laps.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Laps ({laps.length})</h2>
            <div className="max-h-96 overflow-auto space-y-2">
              {[...laps].reverse().map((lap) => {
                const lapTime = formatTime(lap.lapTime);
                const totalTime = formatTime(lap.totalTime);
                const isFastest = fastestLap?.id === lap.id && laps.length > 1;
                const isSlowest = slowestLap?.id === lap.id && laps.length > 1;

                return (
                  <div
                    key={lap.id}
                    className={`flex justify-between items-center p-4 rounded-xl transition-colors ${
                      isFastest
                        ? 'bg-green-50 border-2 border-green-500'
                        : isSlowest
                        ? 'bg-red-50 border-2 border-red-500'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-700 w-16">
                        Lap {lap.lapNumber}
                      </span>
                      <div>
                        <div className="font-mono text-lg font-semibold text-gray-800">
                          {lapTime.minutes}:{lapTime.seconds}.{lapTime.milliseconds}
                        </div>
                        <div className="font-mono text-sm text-gray-500">
                          Total: {totalTime.minutes}:{totalTime.seconds}.{totalTime.milliseconds}
                        </div>
                      </div>
                    </div>
                    {isFastest && (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        FASTEST
                      </span>
                    )}
                    {isSlowest && (
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        SLOWEST
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
