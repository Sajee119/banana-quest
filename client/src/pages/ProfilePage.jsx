import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Target, Flame, Zap, Crown, Gamepad2 } from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/auth-context.js';

export default function ProfilePage() {
    const { user, stats } = useAuth();
    if (!user) return null;

    const winRate = stats?.gamesPlayed ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

    const cards = [
        { icon: <Trophy />, label: 'Total Points', value: stats?.totalPoints ?? 0, color: 'from-banana-300 to-banana-500' },
        { icon: <Gamepad2 />, label: 'Games Played', value: stats?.gamesPlayed ?? 0, color: 'from-sky-300 to-sky-500' },
        { icon: <Target />, label: 'Win Rate', value: `${winRate}%`, color: 'from-emerald-300 to-emerald-500' },
        { icon: <Flame />, label: 'Current Streak', value: stats?.currentStreak ?? 0, color: 'from-orange-300 to-orange-500' },
        { icon: <Crown />, label: 'Best Streak', value: stats?.bestStreak ?? 0, color: 'from-violet-300 to-violet-500' },
        { icon: <Zap />, label: 'Fastest Answer', value: stats?.fastestAnswerMs ? `${(stats.fastestAnswerMs / 1000).toFixed(1)}s` : '—', color: 'from-pink-300 to-pink-500' },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link to="/play"><Button variant="ghost"><ArrowLeft size={18} /> Back to Game</Button></Link>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Card className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-banana-300 bg-banana-100 mb-4 shadow-game-sm">
                        {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center font-display text-4xl text-banana-600">
                            {user.displayName?.[0]?.toUpperCase()}
                        </div>
                        )}
                    </div>
                    <h1 className="font-display text-3xl font-extrabold text-banana-800">{user.displayName}</h1>
                    <p className="text-banana-600">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {user.providerNames?.map((p) => (
                            <span key={p} className="text-xs px-3 py-1 rounded-full bg-banana-200 text-banana-800 font-bold capitalize">
                                {p}
                            </span>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cards.map((c, i) => (
                    <motion.div
                    key={c.label}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    >
                    <Card className="!p-4">
                        <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center text-white bg-gradient-to-br ${c.color}`}>
                        {c.icon}
                        </div>
                        <div className="text-xs uppercase tracking-wide text-banana-600 font-bold">{c.label}</div>
                        <div className="font-display text-2xl font-extrabold text-banana-800">{c.value}</div>
                    </Card>
                    </motion.div>
                ))}
                </div>

                <div className="flex gap-3 mt-6 justify-center">
                <Link to="/play"><Button className="!px-8">▶ Play Now</Button></Link>
                <Link to="/leaderboard"><Button variant="secondary" className="!px-8">🏆 Leaderboard</Button></Link>
                </div>
            </motion.div>
        </div>
    );
}