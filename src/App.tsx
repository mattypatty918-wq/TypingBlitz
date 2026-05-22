import { useState, useEffect, useRef } from 'react';

const WORDS: Record<string, string[]> = {
  Easy: ['CAT', 'DOG', 'RUN', 'JUMP', 'PLAY', 'CODE', 'GAME', 'FAST', 'TYPE', 'WORD', 'STAR', 'MOON', 'TREE', 'FIRE', 'BOOK'],
  Medium: ['CODING', 'LAPTOP', 'KEYBOARD', 'MONITOR', 'PYTHON', 'COFFEE', 'GARDEN', 'BRIDGE', 'ORANGE', 'WINTER', 'JUNGLE', 'ROCKET'],
  Hard: ['ALGORITHM', 'JAVASCRIPT', 'KEYBOARD', 'EXCELLENT', 'CHALLENGE', 'DEVELOPER', 'COMPUTING', 'STRUCTURE', 'NETWORKED'],
  Insane: ['SYNCHRONIZED', 'EXTRAVAGANCE', 'CONFIGURATION', 'INTERNATIONAL', 'ARCHITECTURE', 'PROFESSIONAL', 'SUPERCALIFRAGILISTIC'],
};

const LEVELS = [
  { label: 'Easy', timeLimit: 90, bonus: 1, color: 'from-green-400 to-emerald-600' },
  { label: 'Medium', timeLimit: 60, bonus: 2, color: 'from-yellow-400 to-orange-500' },
  { label: 'Hard', timeLimit: 45, bonus: 3, color: 'from-pink-500 to-red-600' },
  { label: 'Insane', timeLimit: 30, bonus: 5, color: 'from-purple-500 to-fuchsia-700' },
];

export default function App() {
  const [screen, setScreen] = useState<'home' | 'game' | 'over'>('home');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [word, setWord] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('tb_hs') || '0', 10));
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnWord = () => {
    const pool = WORDS[LEVELS[level].label];
    setWord(pool[Math.floor(Math.random() * pool.length)]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setWordsTyped(0);
    setTimeLeft(LEVELS[level].timeLimit);
    spawnWord();
    setScreen('game');
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('over');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tb_hs', String(score));
    }
  };

  useEffect(() => {
    if (screen !== 'game') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  useEffect(() => {
    if (screen === 'game' && timeLeft === 0) endGame();
  }, [timeLeft, screen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase() === word) {
      const pts = word.length * LEVELS[level].bonus * (1 + Math.floor(combo / 3));
      setScore(s => s + pts);
      setCombo(c => {
        const nc = c + 1;
        setMaxCombo(m => Math.max(m, nc));
        return nc;
      });
      setWordsTyped(w => w + 1);
      spawnWord();
    } else {
      setCombo(0);
      // Visual shake feedback
      const el = inputRef.current;
      if (el) {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 400);
      }
      setInput('');
    }
  };

  if (screen === 'home') return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-7xl mb-2">⌨️</div>
        <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          TYPE RACE
        </h1>
        <p className="text-gray-400 mt-2">Race the clock. Master the words.</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 w-full max-w-sm space-y-4 border border-white/10">
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l, i) => (
            <button
              key={i}
              onClick={() => setLevel(i)}
              aria-label={`Select ${l.label} difficulty`}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                level === i ? `bg-gradient-to-r ${l.color} text-white scale-105 shadow-lg` : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="text-center text-2xl font-mono py-2 bg-black/30 rounded-xl">🏆 Best: <span className="text-yellow-400 font-bold">{highScore}</span></div>
        <button
          onClick={startGame}
          aria-label="Start game"
          className="w-full py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-xl"
        >
          ▶ START
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-6 max-w-xs text-center">
        Type the word and press <kbd className="px-2 py-0.5 bg-white/10 rounded">Enter</kbd>. Build combos for bonus points!
      </p>
    </div>
  );

  if (screen === 'over') return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full border border-white/10 text-center">
        <h2 className="text-4xl font-black mb-4">Time's Up!</h2>
        <div className="space-y-3 mb-6">
          <div>
            <div className="text-xs uppercase text-gray-400 tracking-wider">Final Score</div>
            <div className="text-5xl font-black text-yellow-400">{score}</div>
          </div>
          {score === highScore && score > 0 && (
            <div className="text-yellow-300 font-bold">🏆 New High Score!</div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-4">
            <div className="bg-white/5 rounded-xl py-3">
              <div className="text-xs text-gray-400">Words</div>
              <div className="text-2xl font-bold">{wordsTyped}</div>
            </div>
            <div className="bg-white/5 rounded-xl py-3">
              <div className="text-xs text-gray-400">Max Combo</div>
              <div className="text-2xl font-bold">x{maxCombo}</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl font-black hover:scale-105 transition-transform"
        >
          Play Again
        </button>
        <button
          onClick={() => setScreen('home')}
          className="w-full py-3 mt-2 bg-white/10 hover:bg-white/20 rounded-2xl font-bold"
        >
          Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white flex flex-col">
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} } .animate-shake { animation: shake 0.3s ease-in-out; border-color: rgb(239 68 68) !important; }`}</style>
      <div className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm">
        <span className="text-base sm:text-lg font-mono">
          <span className="text-gray-400">SCORE</span> <span className="text-yellow-400 font-black">{score}</span>
        </span>
        <span className={`text-base sm:text-lg font-mono font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}`}>
          ⏱️ {timeLeft}s
        </span>
        <span className="text-base sm:text-lg">🔥 x{combo}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-5xl sm:text-6xl font-black text-center mb-8 tracking-wider drop-shadow-lg">
          {word}
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            className="w-full text-center text-2xl sm:text-3xl font-mono bg-white/10 border-2 border-yellow-400 rounded-2xl p-4 outline-none text-white placeholder-gray-500"
            placeholder="TYPE & PRESS ENTER..."
            aria-label="Type the word shown above"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </form>
        <button
          onClick={() => setScreen('home')}
          className="mt-8 text-gray-400 hover:text-white text-sm underline"
        >
          Quit to menu
        </button>
      </div>
    </div>
  );
}
