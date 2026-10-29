import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BananaLogo from '../components/BananaLogo.jsx';
import Card from '../components/Card.jsx';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/auth-context.js';

const inputClass =
    'w-full rounded-2xl border-2 border-banana-200 bg-white px-4 py-3 font-semibold text-banana-900 placeholder:text-banana-400 focus:border-banana-400 focus:outline-none';

export default function LoginPage() {
    const { user, loading, signIn } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(
        searchParams.get('error') === 'oauth_failed' ? 'Login failed. Please try again.' : ''
    );
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) navigate('/play', { replace: true });
    }, [user, loading, navigate]);

    const updateField = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        setError('');
        setSubmitting(true);
        try {
            if (mode === 'register') {
                await signIn(() => authApi.register(form));
            } else {
                await signIn(() => authApi.login({ email: form.email, password: form.password }));
            }
            navigate('/play', { replace: true });
        } catch (err) {
            setError(err.friendlyMessage || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-8">
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
                    <p className="text-banana-700 mb-6">Sign in to save your score & streaks.</p>

                    <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-banana-100 p-1">
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                                mode === 'login'
                                    ? 'bg-white text-banana-800 shadow-game-sm'
                                    : 'text-banana-600 hover:text-banana-800'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('register')}
                            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                                mode === 'register'
                                    ? 'bg-white text-banana-800 shadow-game-sm'
                                    : 'text-banana-600 hover:text-banana-800'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {error && (
                        <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3 text-left">
                        {mode === 'register' && (
                            <div>
                                <label htmlFor="name" className="sr-only">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={60}
                                    autoComplete="name"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={updateField('name')}
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={updateField('email')}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={mode === 'register' ? 8 : undefined}
                                maxLength={72}
                                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                placeholder={mode === 'register' ? 'Password (min 8 characters)' : 'Password'}
                                value={form.password}
                                onChange={updateField('password')}
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-2xl bg-gradient-to-b from-banana-400 to-banana-600 px-4 py-3 font-display text-lg font-bold text-white shadow-game-sm transition hover:brightness-105 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting
                                ? 'Please wait…'
                                : mode === 'login'
                                    ? 'Sign In'
                                    : 'Create Account'}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-banana-400">
                        <span className="h-px flex-1 bg-banana-200" />
                        or continue with
                        <span className="h-px flex-1 bg-banana-200" />
                    </div>

                    <div className="space-y-3">
                        <a
                            href={authApi.googleLoginUrl}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-2xl py-3 px-4 font-bold text-gray-700 shadow-game-sm transition active:translate-y-1 active:shadow-none"
                        >
                            <svg width="22" height="22" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
                                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.3 35.4 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
                            </svg>
                            Continue with Google
                        </a>
                        <a
                            href={authApi.facebookLoginUrl}
                            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe0] text-white rounded-2xl py-3 px-4 font-bold shadow-game-sm transition active:translate-y-1 active:shadow-none"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                                <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z"/>
                            </svg>
                            Continue with Facebook
                        </a>
                    </div>

                    <p className="mt-6 text-xs text-banana-600">
                        Passwords are hashed and never stored in plain text.
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}
