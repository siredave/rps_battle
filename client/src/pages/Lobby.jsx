import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { authAPI } from '../api';
import { motion } from 'framer-motion';

const Lobby = () => {
  const { user, logout } = useContext(AuthContext);
  const { availablePlayers, challengePlayer } = useContext(GameContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [betAmount, setBetAmount] = useState(100);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await authAPI.getLeaderboard();
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleChallenge = (playerId) => {
    if (betAmount > user.wallet.balance) {
      alert('Insufficient balance');
      return;
    }
    challengePlayer(playerId, betAmount);
    setSelectedPlayer(null);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur border-b border-purple-500 border-opacity-40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            RPS Battle
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Balance</p>
              <p className="text-2xl font-bold text-green-400">${user?.wallet.balance.toFixed(2)}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Players */}
        <motion.div
          className="lg:col-span-2 bg-gray-800 bg-opacity-50 backdrop-blur rounded-2xl p-8 border border-purple-500 border-opacity-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6">Available Players</h2>
          {availablePlayers.length === 0 ? (
            <p className="text-gray-400">No players available. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlayers.map(player => (
                <div key={player.socketId} className="bg-gray-700 bg-opacity-50 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{player.username}</p>
                    <p className="text-sm text-gray-400">Online</p>
                  </div>
                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Challenge
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-2xl p-8 border border-purple-500 border-opacity-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-6">Top Players</h2>
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((player, index) => (
              <div key={player._id} className="flex justify-between items-center p-3 bg-gray-700 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-400">#{index + 1}</span>
                  <span>{player.username}</span>
                </div>
                <span className="text-green-400">{player.stats.wins}W</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Challenge Modal */}
      {selectedPlayer && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-2xl font-bold mb-6">Challenge {selectedPlayer.username}</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Bet Amount: ${betAmount}</label>
              <input
                type="range"
                min="10"
                max={Math.min(1000, user?.wallet.balance || 0)}
                step="10"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>$10</span>
                <span>${Math.min(1000, user?.wallet.balance || 0)}</span>
              </div>
            </div>

            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300">Total Pot: ${betAmount * 2}</p>
              <p className="text-sm text-gray-300">Your Balance After: ${(user?.wallet.balance - betAmount).toFixed(2)}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleChallenge(selectedPlayer.userId)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Challenge
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Lobby;
