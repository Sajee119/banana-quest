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
```

The server dependencies are installed, but the backend entry point and start script are not configured yet.

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
