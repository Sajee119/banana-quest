const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const gameRoutes = require('./routes/game.routes');

const app = express();

// Hide the framework fingerprint.
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 30,
    message: { success: false, message: 'Too many attempts, try again later' },
});
const gameLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Slow down! Too many game requests.' },
});
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { success: false, message: 'Too many password reset attempts, try again later.' },
});

// Only credential endpoints are rate limited. Session checks (`/auth/status`)
// run on every page load, so limiting them would sign active players out.
app.use(['/auth/login', '/auth/register'], authLimiter);
// Limit only the POST handlers. The GET token check must stay available so a
// freshly emailed link can still be opened after several requests.
app.post(['/auth/forgot-password', '/auth/reset-password'], passwordResetLimiter);
app.use('/api/game', gameLimiter);
// Session
app.use(
    session({
        name: 'sid',
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: env.MONGODB_URI,
            ttl: 14 * 24 * 60 * 60, // 14 days
            autoRemove: 'native',
            touchAfter: 24 * 3600,
        }),
        cookie: {
            httpOnly: true,
            secure: env.COOKIE_SECURE, // true in production w/ HTTPS
            sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
            maxAge: 14 * 24 * 60 * 60 * 1000,
        },
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Reject sessions whose auth version no longer matches the account. Password
// changes, resets and "sign out other devices" bump the account version.
app.use((req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) return next();

    const sessionVersion = req.session?.authVersion ?? 0;
    const userVersion = req.user.authVersion ?? 0;
    if (sessionVersion === userVersion) return next();

    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((destroyErr) => {
            if (destroyErr) return next(destroyErr);
            res.clearCookie('sid', { path: '/' });
            next();
        });
    });
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Banana Quiz API', endpoints: { auth: '/auth', user: '/api/users', game: '/api/game' } });
});
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Game routes
app.use('/api/game', gameRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;