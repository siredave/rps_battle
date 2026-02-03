import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const GameContext = createContext();

export const GameProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        newSocket.emit('user_join', {
          userId: user.id,
          username: user.username
        });
      });

      newSocket.on('players_updated', (players) => {
        setAvailablePlayers(players.filter(p => p.userId !== user.id && p.status === 'available'));
      });

      newSocket.on('challenge_received', (data) => {
        // Handle challenge notification
      });

      newSocket.on('game_started', (data) => {
        setGameState({
          gameId: data.gameId,
          status: 'in_progress',
          round: 0,
          player1RoundsWon: 0,
          player2RoundsWon: 0
        });
        setCurrentRound(0);
      });

      newSocket.on('round_complete', (data) => {
        setGameState(prev => ({
          ...prev,
          player1RoundsWon: data.player1RoundsWon,
          player2RoundsWon: data.player2RoundsWon,
          round: data.round + 1
        }));
        setCurrentRound(data.round + 1);
      });

      newSocket.on('game_ended', (data) => {
        setGameState(prev => ({
          ...prev,
          status: 'completed',
          result: data.result,
          winnerPayout: data.winnerPayout
        }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const challengePlayer = (targetPlayerId, betAmount) => {
    if (socket) {
      socket.emit('challenge_player', { targetPlayerId, betAmount });
    }
  };

  const acceptChallenge = (challengerId, betAmount) => {
    if (socket) {
      socket.emit('challenge_accepted', { challengerId, betAmount });
    }
  };

  const playRound = (gameId, round, choice) => {
    if (socket) {
      socket.emit('play_round', { gameId, round, choice });
    }
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        availablePlayers,
        gameState,
        currentRound,
        gameHistory,
        challengePlayer,
        acceptChallenge,
        playRound
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
