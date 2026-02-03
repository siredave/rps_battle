# RPS Battle - Complete Setup Guide

## Quick Start

### 1. Clone/Download the Project
```bash
cd rock-paper-scissors-battle
```

### 2. Backend Setup (Terminal 1)

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```bash
cp .env.example .env
```

Edit `.env` with your details:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rps-battle
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start MongoDB (if local):
```bash
# Mac with Homebrew
brew services start mongodb-community

# Windows
# Download MongoDB Community from https://www.mongodb.com/try/download/community
# Run mongod.exe from your MongoDB bin folder

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Start the server:
```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

### 3. Frontend Setup (Terminal 2)

```bash
cd client
npm install
npm run dev
```

Open browser to: **http://localhost:5173**

## Project Files Overview

### Backend Structure

#### Models (`server/models/`)
- **User.js**: User schema with wallet, stats, authentication
- **Game.js**: Game schema tracking matches, rounds, results

#### Controllers (`server/controllers/`)
- **authController.js**: Register, login, profile, wallet management
- **gameController.js**: Create games, record rounds, manage outcomes

#### Routes (`server/routes/`)
- **auth.js**: Authentication endpoints
- **game.js**: Game endpoints

#### Middleware (`server/middleware/`)
- **auth.js**: JWT token verification

#### Main Server (`server/index.js`)
- Express app setup
- Socket.io connection handling
- Real-time game logic

### Frontend Structure

#### Context (`client/src/context/`)
- **AuthContext.jsx**: User authentication state
- **GameContext.jsx**: Game state and WebSocket connections

#### Pages (`client/src/pages/`)
- **Login.jsx**: Login page
- **Register.jsx**: Registration page
- **Lobby.jsx**: Player list and leaderboard
- **Game.jsx**: Active game interface

#### API (`client/src/`)
- **api.js**: Axios instance and API calls

## How It Works

### 1. User Registration/Login
1. User registers or logs in
2. JWT token stored in localStorage
3. User data stored in context

### 2. Finding Opponents
1. User sees list of available players in Lobby
2. User clicks "Challenge" to send challenge request
3. Sets bet amount ($10-$1000)

### 3. Match Acceptance
1. Opponent receives challenge notification
2. Can accept or reject
3. Both players' balances are immediately deducted

### 4. 10-Round Gameplay
1. Each round, both players simultaneously choose rock/paper/scissors
2. Results determined instantly
3. Round winner gets 1 point
4. After 10 rounds, highest points wins entire pot

### 5. Game Completion
1. Winner receives pot
2. Loser gets nothing
3. Statistics updated
4. Both return to lobby

## Database Schema

### User Document
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  wallet: {
    balance: Number,
    totalWagered: Number,
    totalWon: Number,
    totalLost: Number
  },
  stats: {
    totalGames: Number,
    wins: Number,
    losses: Number,
    winRate: Number
  },
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Game Document
```javascript
{
  _id: ObjectId,
  gameId: String,
  player1: {
    userId: ObjectId,
    username: String,
    bet: Number,
    choices: Array,
    roundsWon: Number
  },
  player2: {
    userId: ObjectId,
    username: String,
    bet: Number,
    choices: Array,
    roundsWon: Number
  },
  totalRounds: 10,
  currentRound: Number,
  winner: ObjectId,
  totalPot: Number,
  winnerPayout: Number,
  status: String, // 'waiting', 'in_progress', 'completed'
  roundResults: Array,
  createdAt: Date,
  endTime: Date
}
```

## API Reference

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Get Profile
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
Response: { user }
```

#### Get Leaderboard
```
GET /api/auth/leaderboard
Response: { leaderboard: [users] }
```

### Game Endpoints

#### Create Game
```
POST /api/game/create
Body: { player2Id, betAmount }
Headers: Authorization: Bearer <token>
Response: { game }
```

#### Get Game
```
GET /api/game/:gameId
Headers: Authorization: Bearer <token>
Response: { game }
```

#### Record Round
```
POST /api/game/round
Body: { gameId, round, player1Choice, player2Choice }
Headers: Authorization: Bearer <token>
Response: { roundResult }
```

## WebSocket Events

### Client → Server
```javascript
socket.emit('user_join', { userId, username })
socket.emit('challenge_player', { targetPlayerId, betAmount })
socket.emit('challenge_accepted', { challengerId, betAmount })
socket.emit('challenge_rejected', { challengerId })
socket.emit('play_round', { gameId, round, choice })
```

### Server → Client
```javascript
socket.on('players_updated', (players) => {})
socket.on('challenge_received', (data) => {})
socket.on('game_started', (data) => {})
socket.on('round_complete', (data) => {})
socket.on('game_ended', (data) => {})
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check MongoDB URI in .env
- For Docker: `docker run -d -p 27017:27017 mongo`

### "Port 5000 already in use"
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### "CORS errors"
- Make sure CLIENT_URL in server .env matches frontend URL
- Default: `http://localhost:5173`

### "Token expired"
- Clear localStorage
- Re-login
- Check JWT_SECRET matches

### WebSocket not connecting
- Check server is running
- Make sure Socket.io port is open
- Browser console for connection errors

## Testing the App

### Test Data
Register with:
- Username: `testuser1`
- Email: `test1@example.com`
- Password: `password123`

Register another account to test multiplayer.

### Test Game Flow
1. Login with first account
2. Open new private/incognito window
3. Login with second account
4. From account 1, challenge account 2
5. Accept challenge in account 2
6. Play 10 rounds
7. View results

## Deployment

### Deploy Backend (Heroku)
```bash
cd server
heroku create your-app-name
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Deploy Frontend (Vercel)
```bash
cd client
npm run build
vercel deploy
```

Update API URL in code to your backend URL.

## Performance Tips

1. Add caching for leaderboard
2. Implement pagination for game history
3. Add rate limiting for API calls
4. Optimize images and assets
5. Enable gzip compression

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Validate all inputs server-side
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add CORS restrictions
- [ ] Hash passwords with bcrypt
- [ ] Validate JWT tokens
- [ ] Implement CSP headers
- [ ] Add request validation
- [ ] Monitor for suspicious activity

## Next Steps

1. **Feature Enhancements**
   - Add spectator mode
   - Implement tournament system
   - Add game chat
   - Create seasonal rankings

2. **Payment Integration**
   - Stripe integration
   - Real money wagering
   - Deposit/withdrawal system

3. **User Features**
   - Profile customization
   - Achievement system
   - Friends list
   - Stats tracking

4. **Performance**
   - Database indexing
   - Caching strategy
   - Load balancing
   - CDN for static assets

## Support & Resources

- Socket.io Docs: https://socket.io/docs/
- Express Docs: https://expressjs.com/
- MongoDB Docs: https://docs.mongodb.com/
- React Router: https://reactrouter.com/
- Mongoose: https://mongoosejs.com/

## License

MIT

Good luck building! 🎮
