import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Timer() {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const playSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    const total =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);

    if (total <= 0) return;

    setTotalSeconds(total);
    setTimeRemaining(total);
    setIsRunning(true);
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeRemaining(totalSeconds);
  };

  const clear = () => {
    setIsRunning(false);
    setHours('0');
    setMinutes('0');
    setSeconds('0');
    setTotalSeconds(0);
    setTimeRemaining(0);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const displayTime = timeRemaining > 0 ? formatTime(timeRemaining) : { hours: '00', minutes: '00', seconds: '00' };
  const progress = totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Timer</h1>

          {!isRunning && timeRemaining === 0 ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Set Timer</h2>
              <div className="flex gap-4 justify-center items-center">
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-gray-600 mb-2 text-center">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <span className="text-3xl font-bold text-gray-400 mt-6">:</span>
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-gray-600 mb-2 text-center">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <span className="text-3xl font-bold text-gray-400 mt-6">:</span>
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-gray-600 mb-2 text-center">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="text-7xl font-bold text-gray-800 mb-4 font-mono">
                  {displayTime.hours}:{displayTime.minutes}:{displayTime.seconds}
                </div>
                {timeRemaining === 0 && (
                  <div className="text-2xl font-semibold text-red-600 animate-pulse">
                    Time's Up!
                  </div>
                )}
              </div>

              {totalSeconds > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      timeRemaining === 0 ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            {!isRunning && timeRemaining === 0 && (
              <button
                onClick={startTimer}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
              >
                <Play size={24} />
                Start
              </button>
            )}

            {isRunning && timeRemaining > 0 && (
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
              >
                <Pause size={24} />
                Pause
              </button>
            )}

            {!isRunning && timeRemaining > 0 && timeRemaining < totalSeconds && (
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium shadow-lg"
              >
                <Play size={24} />
                Resume
              </button>
            )}

            {timeRemaining > 0 && timeRemaining < totalSeconds && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-medium shadow-lg"
              >
                <RotateCcw size={24} />
                Reset
              </button>
            )}

            {(timeRemaining > 0 || totalSeconds > 0) && (
              <button
                onClick={clear}
                className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-lg font-medium shadow-lg"
              >
                <RotateCcw size={24} />
                Clear
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Timers</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '1 min', value: 60 },
                { label: '3 min', value: 180 },
                { label: '5 min', value: 300 },
                { label: '10 min', value: 600 },
                { label: '15 min', value: 900 },
                { label: '30 min', value: 1800 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    const h = Math.floor(preset.value / 3600);
                    const m = Math.floor((preset.value % 3600) / 60);
                    const s = preset.value % 60;
                    setHours(h.toString());
                    setMinutes(m.toString());
                    setSeconds(s.toString());
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
