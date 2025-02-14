const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors()); // Allow all origins (You can restrict this in production)

app.get("/pokemon-data", async (req, res) => {
    try {
        const response = await axios.get("https://www.pokemon.com/us/api/pokedex/kalos", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Referer': 'https://www.pokemon.com/us/pokedex',
                'Connection': 'keep-alive',
            }
        });

        // Debug: Check response status
        console.log("API Status:", response.status);

        if (response.status !== 200) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = response.data;
        res.json(data);
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
