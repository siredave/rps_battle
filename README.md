# Rock Paper Scissors Battle - MERN Stack Multiplayer Betting Game

A real-time multiplayer Rock Paper Scissors game where users compete against each other for prizes using a MERN stack (MongoDB, Express, React, Node.js) with WebSocket support.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Real-time Multiplayer**: Live player matching and game play using Socket.io
- **Wallet System**: Users start with $1000 and can wager on matches
- **10-Round Matches**: Best of 10 rounds
- **Winner Takes All**: Winner receives the combined pot
- **Leaderboard**: Track top players by win rate and wins
- **Game History**: View past games and results
- **Responsive Design**: Works on all devices

## Project Structure

```
rock-paper-scissors-battle/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Game.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── gameController.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── game.js
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── GameContext.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── index.html
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and JWT secret:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rps-battle
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/wallet` - Update wallet balance
- `GET /api/auth/leaderboard` - Get top 50 players

### Game
- `POST /api/game/create` - Create new game
- `GET /api/game/:gameId` - Get game details
- `POST /api/game/round` - Record round result
- `GET /api/game/history` - Get user's game history

## WebSocket Events

### Client → Server
- `user_join` - User joins platform
- `challenge_player` - Challenge another player
- `challenge_accepted` - Accept a challenge
- `challenge_rejected` - Reject a challenge
- `play_round` - Submit round choice

### Server → Client
- `players_updated` - List of available players
- `challenge_received` - Challenge notification
- `game_started` - Game begins
- `round_complete` - Round results
- `game_ended` - Final game results

## Game Rules

1. **10 Rounds**: Each match consists of exactly 10 rounds
2. **Blind Choices**: Players submit choices simultaneously
3. **Standard RPS**: Rock beats Scissors, Scissors beats Paper, Paper beats Rock
4. **Ties**: If choices are the same, that round is a tie (no points awarded)
5. **Winner**: Most round wins after 10 rounds wins the pot
6. **Equal Bets**: Both players must bet the same amount

## Wallet System

- **Starting Balance**: $1000
- **Wagering**: Players choose bet amount before matching
- **Winner**: Receives player1 bet + player2 bet (minus any platform fee)
- **Loser**: Loses their bet amount
- **Tie**: Each player gets half the pot back

## User Statistics

- Total Games Played
- Total Wins/Losses
- Win Rate
- Total Amount Wagered
- Total Amount Won
- Leaderboard Position

## Future Enhancements

- [ ] Tournament mode
- [ ] Seasonal rankings
- [ ] Daily/weekly challenges
- [ ] In-game chat
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Payment gateway integration (Stripe)
- [ ] Spectator mode
- [ ] Replay system
- [ ] Achievement badges

## Deployment

### Backend (Node.js)
```bash
# Build for production
npm run build

# Deploy to Heroku, Railway, DigitalOcean, etc.
```

### Frontend (React)
```bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, GitHub Pages, etc.
```

## Environment Variables

### Server
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS

### Client
- `VITE_API_URL` - Backend API URL

## Security Considerations

- [ ] Implement rate limiting
- [ ] Add input validation/sanitization
- [ ] Use HTTPS in production
- [ ] Implement CSRF protection
- [ ] Add DDoS protection
- [ ] Encrypt sensitive data
- [ ] Regular security audits

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
