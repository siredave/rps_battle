import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, email, password) =>
    api.post("/auth/register", { username, email, password }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getProfile: () => api.get("/auth/profile"),
  getLeaderboard: () => api.get("/auth/leaderboard"),
  updateBalance: (amount, type) => api.put("/auth/wallet", { amount, type }),
};

export const gameAPI = {
  createGame: (player2Id, betAmount) =>
    api.post("/game/create", { player2Id, betAmount }),
  getGame: (gameId) => api.get(`/game/${gameId}`),
  recordRound: (gameId, round, player1Choice, player2Choice) =>
    api.post("/game/round", { gameId, round, player1Choice, player2Choice }),
  getGameHistory: () => api.get("/game/history"),
};

export default api;
