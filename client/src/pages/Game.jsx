import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const Game = () => {
  const { gameState, currentRound, playRound } = useContext(GameContext);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const choices = ['rock', 'paper', 'scissors'];
  const emojis = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const handlePlayRound = (choice) => {
    setSelectedChoice(choice);
    playRound(gameState.gameId, currentRound, choice);
  };

  if (gameState.status === 'completed') {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black text-white flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur rounded-2xl p-8 border border-purple-500">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Game Over
          </h1>

          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center mb-6">
            <p className="text-xl font-bold mb-4">
              {gameState.result === 'win' ? '🎉 You Won!' : gameState.result === 'loss' ? '😢 You Lost' : '🤝 It\'s a Tie'}
            </p>
            <p className="text-lg text-green-400">
              You earn: ${gameState.winnerPayout}
            </p>
          </div>

          <div className="space-y-3 text-center">
            <p>Round Score: {gameState.player1RoundsWon} - {gameState.player2RoundsWon}</p>
          </div>

          <button
            onClick={() => window.location.href = '/lobby'}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition mt-8"
          >
            Back to Lobby
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Round Counter */}
        <div className="text-center mb-8">
          <p className="text-gray-300 text-lg mb-2">Round {currentRound + 1} of 10</p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Your Wins</p>
              <p className="text-3xl font-bold text-purple-400">{gameState.player1RoundsWon}</p>
            </div>
            <div className="text-2xl font-bold text-gray-500">-</div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Opponent Wins</p>
              <p className="text-3xl font-bold text-pink-400">{gameState.player2RoundsWon}</p>
            </div>
          </div>
        </div>

        {/* Make Your Choice */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-2xl p-8 mb-8 border border-purple-500 border-opacity-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-center mb-6">Choose Your Move</h2>

          <div className="grid grid-cols-3 gap-4">
            {choices.map(choice => (
              <motion.button
                key={choice}
                onClick={() => handlePlayRound(choice)}
                disabled={selectedChoice !== null}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl font-bold uppercase tracking-widest transition ${
                  selectedChoice === choice
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110'
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${selectedChoice !== null && selectedChoice !== choice ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-4xl mb-2">{emojis[choice]}</div>
                <span className="text-sm">{choice}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {selectedChoice && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-300">Waiting for opponent...</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Game;
