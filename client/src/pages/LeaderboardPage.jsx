import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { userApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userApi.leaderboard(50)
        .then((res) => setEntries(res.data || []))
        .catch(() => setEntries([]))
        .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <Link to="/"><Button variant="ghost"><ArrowLeft size={18} /> Home</Button></Link>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="text-center mb-8">
            <Trophy size={48} className="mx-auto text-banana-500 mb-2" />
            <h1 className="font-display text-4xl font-extrabold text-banana-800">Hall of Bananas</h1>
            <p className="text-banana-600">Top banana counters</p>
            </div>

            <Card className="!p-2 md:!p-4">
            {loading && (
                <div className="py-12 text-center text-banana-600">
                <div className="animate-spin w-12 h-12 border-4 border-banana-400 border-t-transparent rounded-full mx-auto mb-3" />
                Loading…
                </div>
            )}
            {!loading && entries.length === 0 && (
                <div className="py-12 text-center text-banana-600">
                <Medal size={40} className="mx-auto mb-2 opacity-50" />
                No scores yet — be the first!
                </div>
            )}
            {!loading && entries.map((entry, i) => {
                const isMe = user?.displayName === entry.displayName;
                return (
                <motion.div
                    key={`${entry.displayName}-${i}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-xl mb-1 ${isMe ? 'bg-banana-200 border-2 border-banana-400' : 'hover:bg-banana-50'}`}
                >
                    <div className="w-10 text-center font-display font-extrabold text-xl text-banana-700">
                    {MEDAL[i] || entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-banana-200 flex-shrink-0">
                    {entry.avatar ? (
                        <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-banana-700">
                        {entry.displayName?.[0]}
                        </div>
                    )}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="font-bold text-banana-800 truncate">{entry.displayName}</div>
                    <div className="text-xs text-banana-600">
                        🏆 {entry.gamesWon} wins · 🔥 best {entry.bestStreak}
                    </div>
                    </div>
                    <div className="font-display font-extrabold text-xl text-banana-700">{entry.totalPoints}</div>
                </motion.div>
                );
            })}
            </Card>

            <div className="text-center mt-6">
            <Link to={user ? '/play' : '/login'}>
                <Button className="!px-8">▶ {user ? 'Play Now' : 'Sign In to Play'}</Button>
            </Link>
            </div>
        </motion.div>
        </div>
    );
}