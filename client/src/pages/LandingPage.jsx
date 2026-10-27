import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BananaLogo from '../components/BananaLogo.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Floating bananas */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                <BananaLogo
                    key={i}
                    size={40 + (i % 3) * 20}
                    className="absolute opacity-20 animate-float"
                    style={{ left: `${10 + i * 11}%`, top: `${(i * 37) % 80}%`, animationDelay: `${i * 0.4}s` }}
                />
                ))}
            </div>

            <header className="p-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <BananaLogo size={48} className="animate-wiggle" />
                    <span className="font-display text-2xl font-extrabold text-banana-800">Banana Count</span>
                </div>
                <div className="flex gap-2">
                    <Link to="/leaderboard"><Button variant="ghost" className="!py-2 !text-base">🏆 Leaderboard</Button></Link>
                    {user ? (
                        <Link to="/play"><Button>Play Now</Button></Link>
                    ) : (
                        <Link to="/login"><Button>Sign In</Button></Link>
                    )}
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 relative z-10">
                <div className="max-w-3xl text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        className="mb-6"
                    >
                        <BananaLogo size={180} className="mx-auto drop-shadow-2xl animate-wiggle" />
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-6xl md:text-7xl font-extrabold text-banana-800 mb-4 drop-shadow-md"
                    >
                        Count the Bananas.<br />
                        <span className="text-banana-500">Beat the Clock.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-banana-700 mb-10 max-w-xl mx-auto"
                    >
                        Fast fingers and sharp eyes earn bonuses. Chain correct answers for streak
                        multipliers. How high can you climb?
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to={user ? '/play' : '/login'}>
                            <Button className="!px-10 !py-4 !text-2xl">
                                {user ? '▶ Continue Playing' : '▶ Start Playing'}
                            </Button>
                        </Link>
                        <Link to="/leaderboard">
                            <Button variant="secondary" className="!px-10 !py-4 !text-2xl">🏆 Rankings</Button>
                        </Link>
                    </motion.div>
                </div>
            </main>

            <footer className="text-center text-sm text-banana-700 py-6 relative z-10">
                Powered by <a href="https://marcconrad.com/uob/banana/doc.php" className="underline">Banana API</a>
            </footer>
        </div>
    );
}