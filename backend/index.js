const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Load Pokémon data
const dataPath = path.join(__dirname, "pokemon.json");
const pokemonData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Function to get 7 random Pokémon
function getRandomDeck() {
  const shuffled = [...pokemonData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 7);
}

// Create 5 bot users
const bots = [];
for (let i = 1; i <= 5; i++) {
  bots.push({
    id: i,
    name: `Bot ${i}`,
    deck: getRandomDeck(),
  });
}

// API to get bot list (names only)
app.get("/api/bots", (req, res) => {
  const botNames = bots.map((bot) => ({ id: bot.id, name: bot.name }));
  res.json(botNames);
});

// API to get a bot's deck by ID
app.get("/api/bots/:id/deck", (req, res) => {
  const botId = parseInt(req.params.id);
  const bot = bots.find((b) => b.id === botId);
  if (bot) {
    res.json(bot.deck);
  } else {
    res.status(404).json({ message: "Bot not found" });
  }
});

app.get("/pokemon-data", (req, res) => {
  try {
    res.json(pokemonData);
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});