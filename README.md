# Banana Quest

Banana Quest is a game development project with a React/Vite client and an Express server.

## Project Structure

- `client/` - React frontend powered by Vite
- `server/` - Express backend
- `docs/` - Project documentation

## Getting Started

### Client

```bash
cd client
npm install
npm run dev
```

The Vite development server will print the local URL in the terminal.

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

## Development

Run the client and server in separate terminals. Keep secrets and local configuration in `.env` files; these files are excluded from Git.

### OAuth provider setup

For local development, configure the provider applications with these exact callback URLs:

- Google: `http://localhost:3000/auth/google/callback`
- Facebook: `http://localhost:3000/auth/facebook/callback`

Set `CLIENT_URL` to the client URL (`http://localhost:5173`) and
`AUTH_CALLBACK_URL` to the server URL (`http://localhost:3000`). Facebook login
requests the `public_profile` permission; email is optional because some
Facebook applications do not grant the email permission.
