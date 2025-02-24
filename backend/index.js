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

app.get("/pokemon-data", (req, res) => {
    try {
        const dataPath = path.join(__dirname, "pokemon.json");
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        res.json(data);
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});