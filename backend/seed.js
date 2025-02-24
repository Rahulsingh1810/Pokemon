const mongoose = require('mongoose');
const Pokemon = require('./models/pokemonModel');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

async function seedPokemon() {
    await connectDB();
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'pokemon.json'), 'utf8'));
    await Pokemon.deleteMany({});
    await Pokemon.insertMany(data);
    console.log('Pokémon data seeded');
    mongoose.connection.close();
}

seedPokemon();