import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BananaLogo from '../components/BananaLogo.jsx';
import Card from '../components/Card.jsx';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { if (user) navigate('/play', { replace: true }); }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md"
            >
                <Card className="text-center">
                    <BananaLogo size={100} className="mx-auto mb-4 animate-wiggle" />
                    <h1 className="font-display text-4xl font-extrabold text-banana-800 mb-2">
                        Welcome, Player!
                    </h1>
                    <p className="text-banana-700 mb-8">Sign in to save your score & streaks.</p>

                    <div className="space-y-3">
                        <a href={authApi.googleLoginUrl} className="block">
                        <button className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-2xl py-3 px-4 font-bold text-gray-700 shadow-game-sm transition active:translate-y-1 active:shadow-none">
                            <svg width="22" height="22" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
                                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.3 35.4 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
                            </svg>
                            Continue with Google
                        </button>
                        </a>
                        <a href={authApi.facebookLoginUrl} className="block">
                            <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe0] text-white rounded-2xl py-3 px-4 font-bold shadow-game-sm transition active:translate-y-1 active:shadow-none">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                                    <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z"/>
                                </svg>
                                Continue with Facebook
                            </button>
                        </a>
                    </div>

                    <p className="mt-6 text-xs text-banana-600">
                        We only store your name, email & avatar — never your password.
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}