import { useState, useEffect, useRef } from 'react';

const WORDS = ['APPLE','BANNANA','GRAPE','MANGO','PEACH','LEMON','LYCHEE','MELON','PAPAYA','GUAVA','PIkachu','Charizard','Bulbasaur','Squirtle','Eevee','Snorlax','Mewtwo','Gengar','Pikachu','Lapras'];
const LEVELS = [
  { label:'Easy', speed: 3000, bonus: 1 },
  { label:'Medium', speed: 2000, bonus: 2 },
  { label:'Hard', speed: 1200, bonus: 3 },
  { label:'Insane', speed: 700, bonus: 5 },
];

export default function App() {
  const [screen, setScreen] = useState<'home'|'game'>('home');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [word, setWord] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('tb_hs') || '0'));
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const spawnWord = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setInput('');
    inputRef.current?.focus();
  };

  const startGame = () => {
    setScore(0); setCombo(0); setTimeLeft(60);
    spawnWord();
    setScreen('game');
  };

  useEffect(() => {
    if (screen !== 'game') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setScreen('home');
          if (score > highScore) { setHighScore(score); localStorage.setItem('tb_hs', String(score)); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game') return;
    const timeout = setTimeout(() => {
      if (input.toUpperCase() === word) {
        const pts = word.length * LEVELS[level].bonus * (1 + Math.floor(combo / 3));
        setScore(s => s + pts);
        setCombo(c => c + 1);
        spawnWord();
      } else if (input.length >= word.length) {
        setCombo(0);
      }
    }, LEVELS[level].speed);
    return () => clearTimeout(timeout);
  }, [input, word, combo, level, screen]);

  if (screen === 'home') return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-2">⌨️</div>
        <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">TYPE RACE</h1>
        <p className="text-gray-400 mt-2">Race the clock. Master the words.</p>
      </div>
      <div className="bg-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l, i) => (
            <button key={i} onClick={() => setLevel(i)} className={`py-3 rounded-xl font-bold text-sm ${level===i ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{l.label}</button>
          ))}
        </div>
        <div className="text-center text-2xl font-mono">🏆 Best: {highScore}</div>
        <button onClick={startGame} className="w-full py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl font-black text-xl hover:scale-105 transition-transform">
          ▶ START
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/30">
        <span className="text-lg font-mono">SCORE: <span className="text-yellow-400 font-black">{score}</span></span>
        <span className="text-lg font-mono">⏱️ {timeLeft}s</span>
        <span className="text-lg">🔥 x{combo}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-6xl font-black text-center mb-8 animate-pulse">{word}</div>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value.toUpperCase())} className="w-full max-w-md text-center text-3xl font-mono bg-white/10 border-2 border-yellow-400 rounded-2xl p-4 outline-none text-white placeholder-gray-500" placeholder="TYPE HERE..." autoFocus />
      </div>
    </div>
  );
}
