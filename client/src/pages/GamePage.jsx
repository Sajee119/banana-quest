import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, LayoutDashboard, Timer, Banana, Leaf, ArrowLeftRight } from 'lucide-react';
import BananaLogo from '../components/BananaLogo.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import AppHeader from '../components/AppHeader.jsx';
import { gameApi } from '../api/client.js';
import { useAuth } from '../context/auth-context.js';
import { useSound } from '../hooks/useSound.js';
import Confetti from '../components/Confetti.jsx';
import { MODE_INFO } from '../lib/format.js';

const MODE_ICONS = { classic: Banana, blitz: Timer, zen: Leaf };

export default function GamePage() {
  const { stats, setStats } = useAuth();
  const { play } = useSound();
  const [searchParams] = useSearchParams();

  const requestedMode = searchParams.get('mode') || 'classic';
  const mode = MODE_INFO[requestedMode] || MODE_INFO.classic;
  const ModeIcon = MODE_ICONS[mode.id] || Banana;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | playing | correct | wrong | expired
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const deadlineRef = useRef(0);
  const inputRef = useRef(null);

  // ---- Start game ----
  const startGame = useCallback(async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setAnswer('');
    try {
      play('click');
      const { data } = await gameApi.start(mode.id);
      setSession(data);
      deadlineRef.current = Date.now() + data.timeLimitMs;
      setTimeLeft(Math.ceil(data.timeLimitMs / 1000));
      setPhase('playing');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.friendlyMessage || 'Could not load a puzzle. Try again.');
    } finally {
      setLoading(false);
    }
  }, [mode.id, play]);

  // ---- Countdown ----
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    timerRef.current = setInterval(() => {
      const next = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(next);

      if (next === 0) {
        clearInterval(timerRef.current);
        setPhase('expired');
        setResult({ isCorrect: false, pointsAwarded: 0, message: 'Time up!' });
        play('expire');
      } else if (next <= 5) {
        play('tick');
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, play]);

  // ---- Submit ----
  const submitAnswer = async (e) => {
    e?.preventDefault();
    if (!session || phase !== 'playing') return;
    const num = parseInt(answer, 10);
    if (Number.isNaN(num) || num < 0) {
      setError('Enter a valid number');
      return;
    }
    setLoading(true);
    try {
      const { data } = await gameApi.answer(session.sessionId, num);
      setResult(data);
      setPhase(data.isCorrect ? 'correct' : 'wrong');
      play(data.isCorrect ? 'correct' : 'wrong');
      if (data.stats) setStats(data.stats);
    } catch (err) {
      if (err.response?.status === 410) {
        setPhase('expired');
        setResult({ isCorrect: false, pointsAwarded: 0, message: 'Time up!' });
        play('expire');
      } else {
        setError(err.friendlyMessage || 'Submit failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const timerPct = session ? Math.max(0, (timeLeft / (session.timeLimitMs / 1000)) * 100) : 100;
  const activeMode = session?.mode?.label || mode.label;

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto max-w-4xl px-4 py-4 md:px-6 md:py-6">
        {/* HUD */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-xl border-2 border-banana-300 bg-white/90 px-3 py-1.5 text-sm font-extrabold text-banana-800 shadow-game-sm">
              <ModeIcon size={16} className="text-banana-500" /> {activeMode}
            </span>
            <Link
              to="/dashboard"
              title="Change play mode"
              className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-bold text-banana-600 hover:bg-banana-100"
            >
              <ArrowLeftRight size={14} /> Change
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <HUDStat icon={<Trophy size={16} />} label="Points" value={stats?.totalPoints ?? 0} accent />
            <HUDStat icon={<Flame size={16} />} label="Streak" value={stats?.currentStreak ?? 0} />
            <Link to="/dashboard" title="Dashboard">
              <Button variant="ghost" className="!p-2">
                <LayoutDashboard size={20} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main game panel */}
        <main className="flex flex-col">
          <Card className="!p-5 md:!p-8 flex flex-col">
            {/* Timer bar */}
            <div className="h-4 bg-banana-200 rounded-full overflow-hidden mb-4 relative">
              <motion.div
                className={`h-full ${timeLeft <= 5 && phase === 'playing' ? 'bg-red-500' : 'bg-gradient-to-r from-banana-400 to-banana-600'}`}
                animate={{ width: `${timerPct}%` }}
                transition={{ ease: 'linear', duration: 0.3 }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow">
                {phase === 'playing' ? `${timeLeft}s` : ''}
              </span>
            </div>

            {/* Puzzle area */}
            <div className="flex-1 flex items-center justify-center min-h-[280px]">
              {loading && !session && <Spinner />}
              {!session && !loading && (
                <div className="text-center">
                  <BananaLogo size={110} className="mx-auto mb-4 animate-float" />
                  <h2 className="font-display text-3xl font-extrabold text-banana-800 mb-1">
                    {mode.label} mode
                  </h2>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-banana-500">
                    {mode.time} per puzzle · {mode.multiplier} points
                  </p>
                  <p className="text-banana-700 mb-6 max-w-md mx-auto">{mode.description}</p>
                  <Button onClick={startGame} className="!px-10 !py-4 !text-xl">
                    ▶ Start {mode.label}
                  </Button>
                </div>
              )}

              {session && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full"
                  >
                    <img
                      src={session.imageUrl}
                      alt="Count the bananas"
                      className="mx-auto max-h-[340px] w-auto rounded-2xl border-4 border-banana-300 shadow-game-sm select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />

                    {/* Feedback overlay */}
                    <AnimatePresence>
                      {phase === 'correct' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-green-500 text-white font-display text-3xl font-extrabold px-8 py-4 rounded-3xl shadow-2xl">
                            ✅ CORRECT! +{result?.pointsAwarded}
                          </div>
                          <Confetti />
                        </motion.div>
                      )}
                      {phase === 'wrong' && (
                        <motion.div
                          initial={{ x: -10 }}
                          animate={{ x: [10, -10, 10, 0] }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-red-500 text-white font-display text-3xl font-extrabold px-8 py-4 rounded-3xl shadow-2xl">
                            ❌ WRONG
                          </div>
                        </motion.div>
                      )}
                      {phase === 'expired' && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-orange-500 text-white font-display text-3xl font-extrabold px-8 py-4 rounded-3xl shadow-2xl">
                            ⏰ TIME UP
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Error */}
            {error && <p className="text-red-600 text-center font-semibold mt-3">{error}</p>}

            {/* Answer form / Next */}
            {session && (
              <div className="mt-6">
                {phase === 'playing' ? (
                  <form onSubmit={submitAnswer} className="flex gap-3 items-stretch">
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="numeric"
                      value={answer}
                      onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                      placeholder="How many?"
                      className="flex-1 text-3xl text-center font-display font-extrabold rounded-2xl border-4 border-banana-300 focus:border-banana-500 outline-none px-4 py-3 bg-white"
                    />
                    <Button type="submit" disabled={loading || !answer} className="!text-xl">
                      {loading ? '...' : 'Submit'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {result && (
                      <div className="text-center">
                        {result.solution != null && (
                          <p className="text-banana-700 font-semibold">
                            Correct answer: <span className="text-banana-900 font-extrabold">{result.solution}</span>
                            {result.isCorrect === false && result.playerAnswer != null && (
                              <> — you said {result.playerAnswer}</>
                            )}
                          </p>
                        )}
                        <p className="text-sm text-banana-600 mt-1">
                          {result.answerMs ? `Answered in ${(result.answerMs / 1000).toFixed(1)}s` : null}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button onClick={startGame} disabled={loading} className="!px-8 !py-3 !text-lg">
                        {loading ? 'Loading...' : '▶ Next Banana'}
                      </Button>
                      <Link to="/dashboard">
                        <Button variant="secondary" className="!px-8 !py-3 !text-lg">
                          Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}

function HUDStat({ icon, label, value, accent }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 shadow-game-sm border-2 ${accent ? 'border-banana-400' : 'border-banana-200'}`}>
      <span className="text-banana-600">{icon}</span>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wide text-banana-600 font-bold">{label}</div>
        <motion.div key={value} initial={{ scale: 1.3, color: '#F5A800' }} animate={{ scale: 1, color: '#6B3200' }} className="font-display font-extrabold text-base">
          {value}
        </motion.div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="text-center">
      <div className="animate-spin w-16 h-16 border-4 border-banana-400 border-t-transparent rounded-full mx-auto mb-3" />
      <p className="font-display text-lg text-banana-700">Fetching a fresh banana puzzle…</p>
    </div>
  );
}
