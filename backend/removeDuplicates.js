// filepath: /Users/avaamo/Documents/GitHub/Pokemon/backend/removeDuplicates.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pokemon.json');

// Read the JSON file
const rawData = fs.readFileSync(filePath);
const pokemonData = JSON.parse(rawData);

// Remove duplicates based on the 'number' property
const uniquePokemon = [];
const seenNumbers = new Set();

pokemonData.forEach(pokemon => {
    if (!seenNumbers.has(pokemon.number)) {
        seenNumbers.add(pokemon.number);
        uniquePokemon.push(pokemon);
    }
});

// Write the cleaned data back to the JSON file
fs.writeFileSync(filePath, JSON.stringify(uniquePokemon, null, 2));

console.log('Duplicates removed successfully.');