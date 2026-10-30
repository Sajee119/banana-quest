# Banana Quiz

Banana Quiz is a free browser counting game. A bunch of bananas appears, you type
how many you can see, and correct answers earn points, streaks and achievements.
It is built with a React/Vite client and an Express/MongoDB server.

## Project Structure

- `client/` - React frontend powered by Vite
- `server/` - Express backend (Passport sessions, MongoDB via Mongoose)
- `docs/` - Project documentation

## Getting Started

### Client

```bash
cd client
npm install
npm run dev
```

The Vite development server will print the local URL in the terminal
(`http://localhost:5173` by default). It proxies `/auth` and `/api` to the server.

### Server

```bash
cd server
npm install
npm run dev      # Start with nodemon
# or
npm start        # Start with Node
```

Create a `server/.env` file based on `server/.env.example` before starting the server.

## Available Server Commands

From `server/`:

```bash
npm run dev      # Start the development server with nodemon
npm start        # Start the server
npm run lint     # Run Oxlint
npm test         # Run the test suite
```

## Available Client Commands

From `client/`:

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the production build
```

## Pages

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page with features, modes, achievements, FAQ and a live leaderboard preview |
| `/login` | Public | Sign in, create an account, or continue with Google/Facebook |
| `/dashboard` | Signed in | Post-login hub: player status, mode picker, audio controls, achievements preview |
| `/play?mode=classic\|blitz\|zen` | Signed in | The counting game |
| `/achievements` | Signed in | Full achievement cabinet with progress filters |
| `/leaderboard` | Public | Global rankings |
| `/profile` | Signed in | Account details, preferences, password, devices and login history |

A successful sign-in redirects to `/dashboard`.

## Player accounts

Players can sign up and sign in in two ways:

- **Email + password** on `/login` (the Create Account tab). Passwords are hashed
  with bcrypt and never returned by the API. Single-word names are supported;
  first and last name are optional profile fields.
- **Google / Facebook OAuth** using the buttons on the same page.

### Auth endpoints

- `POST /auth/register` with `{ "name", "email", "password" }` (password: 8–72
  characters) — creates the account and starts a session.
- `POST /auth/login` with `{ "email", "password" }` — starts a session.
- `POST /auth/logout` — ends the session.
- `GET /auth/status` — returns `{ authenticated, user }` for the current session.
- `GET /auth/google` / `GET /auth/facebook` — begin the OAuth flow.

If an email is already linked to a social account, password login returns a
message telling the player to use Google or Facebook instead.

### Account endpoints

All account endpoints require an authenticated session.

- `GET /api/users/me` — profile plus current stats.
- `PATCH /api/users/me` — update `name`, `bio` (max 160 chars), `avatar` (http(s)
  URL), `favoriteMode` (`classic`, `blitz`, `zen`) and `preferences`
  (`reducedMotion`, `showOnLeaderboard`).
- `PATCH /api/users/me/password` — set or change the password. Existing passwords
  require `currentPassword`; social-only accounts can add one.
- `GET /api/users/me/logins` — recent sign-ins and grouped devices. The current
  device is marked, and IP addresses are masked.
- `GET /api/users/me/achievements` — achievement list, progress and summary.
- `GET /api/users/leaderboard?limit=25` — public rankings. Players who turn off
  `showOnLeaderboard` are excluded.

Login history is stored in a separate `LoginEvent` collection. Each event keeps
the sign-in method, a parsed browser/OS label, a coarse device type and a SHA-256
hash of the session id (never the raw cookie). The last 50 events per player are
kept.

## Game modes

Modes are defined in `server/src/config/gameModes.js` and exposed publicly via
`GET /api/game/modes`.

| Mode | Time per puzzle | Points multiplier | Speed bonus |
| --- | --- | --- | --- |
| Classic | 120 s | 1× | Yes |
| Blitz | 30 s | 1.5× | Yes |
| Zen | 300 s | 1× | No |

### Game endpoints

- `GET /api/game/modes` — public list of modes.
- `POST /api/game/start` with `{ "mode": "classic" }` — starts a round and returns
  the puzzle image, time limit and mode.
- `POST /api/game/answer` with `{ "sessionId", "answer" }` — scores the answer and
  returns the solution, points and updated stats.
- `POST /api/game/expire` with `{ "sessionId" }` — ends a round whose timer ran
  out. The round is recorded as a played loss and the solution is returned.
- `GET /api/game/stats` — the signed-in player's stats.

A round that times out still counts as a played game, so win rate and per-mode
achievements stay accurate. The start response includes `serverNow` and
`remainingMs`, which the client uses to keep its countdown aligned with the
server clock.

### Scoring

A correct answer earns:

```
(base 100 + speed bonus) × streak multiplier × mode multiplier
```

- **Speed bonus**: up to 50 extra points, scaled by how far under the 10-second
  threshold the answer lands.
- **Streak multiplier**: `1 + 0.1 × current streak`, capped at 2×.
- **Mode multiplier**: 1.5× in Blitz, 1× elsewhere.

## Achievements

Fourteen achievements are evaluated on read from the player's stats — there is no
separate unlock bookkeeping. They cover first rounds and wins, streaks (3/10/25),
fast answers (under 5 s and 2 s), point milestones (500/2,500/10,000), games
played/won, and completing a Blitz or Zen round. Per-mode play counts are stored on
the score document so they survive game-session cleanup.

## Audio

Sound effects and background music are synthesised with the Web Audio API, so there
are no external MP3 files or CDN requests. The audio engine is a singleton that
keeps music playing across page changes. Browsers block audio until a user gesture,
so the first click, tap or keypress unlocks the context.

Settings (SFX on/off, music on/off, master volume) are stored in `localStorage`
under `bq-audio-settings` and can be changed from the header or the account page.
They are device-local rather than account-level.

## OAuth provider setup

For local development, configure the provider applications with these exact
callback URLs:

- Google: `http://localhost:3000/auth/google/callback`
- Facebook: `http://localhost:3000/auth/facebook/callback`

Set `CLIENT_URL` to the client URL (`http://localhost:5173`) and
`AUTH_CALLBACK_URL` to the server URL (`http://localhost:3000`). Facebook login
requests the `public_profile` permission; email is optional because some Facebook
applications do not grant the email permission.

## Development notes

Run the client and server in separate terminals. Keep secrets and local
configuration in `.env` files; these files are excluded from Git.

MongoDB Atlas can take a few seconds to accept the first connection, so the client
retries `/auth/status` once before treating a player as signed out.
