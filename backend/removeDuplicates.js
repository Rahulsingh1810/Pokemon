// filepath: /Users/avaamo/Documents/GitHub/Pokemon/backend/removeDuplicates.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pokemon.json');

// Read the JSON file
const rawData = fs.readFileSync(filePath);
const pokemonData = JSON.parse(rawData);

// Remove duplicates based on the 'name' property
const uniquePokemon = [];
const seenNames = new Set();

// Sort by name first to ensure consistent selection of duplicates
pokemonData
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(pokemon => {
        if (!seenNames.has(pokemon.name.toLowerCase())) { // Case-insensitive comparison
            seenNames.add(pokemon.name.toLowerCase());
            uniquePokemon.push(pokemon);
        }
    });

// Sort back by number before saving
uniquePokemon.sort((a, b) => parseInt(a.number) - parseInt(b.number));

// Write the cleaned data back to the JSON file
fs.writeFileSync(filePath, JSON.stringify(uniquePokemon, null, 2));

console.log(`Duplicates removed successfully. Reduced from ${pokemonData.length} to ${uniquePokemon.length} Pokemon.`);