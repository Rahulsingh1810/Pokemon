const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (You can restrict this in production)
    },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes(io)); // Pass io to routes

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

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 8080; // Use the same port for both

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
