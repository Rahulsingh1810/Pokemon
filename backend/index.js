const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors()); // Allow all origins (You can restrict this in production)

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

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
