const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

let currentPage = 1;
const itemsPerPage = 15;
let pokemonData = [];

async function getData() {
    try {
        const response = await fetch('http://localhost:3001/pokemon-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data.slice(0, 5)); // Log first 5 items for verification
        pokemonData = data;
        displayPokemon();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

searchInput.addEventListener('input', displayPokemon);
filterSelect.addEventListener('change', displayPokemon);
prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPokemon();
    }
});
nextButton.addEventListener('click', () => {
    if (currentPage * itemsPerPage < filteredPokemon().length) {
        currentPage++;
        displayPokemon();
    }
});

function filteredPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;
    return pokemonData.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm) || pokemon.number.includes(searchTerm);
        const matchesFilter = filterType ? pokemon.type.includes(filterType) : true;
        return matchesSearch && matchesFilter;
    });
}

function displayPokemon() {
    pokemonContainer.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pokemonToDisplay = filteredPokemon().slice(start, end);

    pokemonToDisplay.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}">
            <h3>${pokemon.name}</h3>
            <p>#${pokemon.number}</p>
            <p>Type: ${pokemon.type.join(', ')}</p>
        `;
        pokemonContainer.appendChild(card);
    });
}

getData();