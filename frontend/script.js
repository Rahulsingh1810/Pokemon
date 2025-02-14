const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const sortNameSelect = document.getElementById('sortName');
const sortNumberSelect = document.getElementById('sortNumber');
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
        pokemonData = data;
        displayPokemon();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

searchInput.addEventListener('input', displayPokemon);
filterSelect.addEventListener('change', displayPokemon);
sortNameSelect.addEventListener('change', displayPokemon);
sortNumberSelect.addEventListener('change', displayPokemon);
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

function sortPokemon(pokemonList) {
    const sortName = sortNameSelect.value;
    const sortNumber = sortNumberSelect.value;

    if (sortName === 'nameAsc') {
        pokemonList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortName === 'nameDesc') {
        pokemonList.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortNumber === 'numberAsc') {
        pokemonList.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    } else if (sortNumber === 'numberDesc') {
        pokemonList.sort((a, b) => parseInt(b.number) - parseInt(a.number));
    }

    return pokemonList;
}

function displayPokemon() {
    pokemonContainer.innerHTML = ''; // Clear the container before appending new cards
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    let pokemonToDisplay = filteredPokemon();
    pokemonToDisplay = sortPokemon(pokemonToDisplay).slice(start, end);

    const displayedNumbers = new Set();
    pokemonToDisplay = pokemonToDisplay.filter(pokemon => {
        if (displayedNumbers.has(pokemon.number)) {
            return false;
        } else {
            displayedNumbers.add(pokemon.number);
            return true;
        }
    });

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