const fs = require('fs');
const path = require('path');

// Path to the JSON file
const filePath = path.join(__dirname, 'pokemon.json');

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const pokemonData = JSON.parse(data);

        // Set to store unique types
        const typesSet = new Set();

        // Iterate through the Pokémon data
        pokemonData.forEach(pokemon => {
            if (pokemon.type) {
                pokemon.type.forEach(type => typesSet.add(type));
            }
        });

        // Convert the Set to an array and sort it
        const typesArray = Array.from(typesSet).sort();

        // Print the list of unique types
        console.log('List of Pokémon types:');
        typesArray.forEach(type => console.log(type));
    } catch (parseError) {
        console.error('Error parsing the JSON data:', parseError);
    }
});