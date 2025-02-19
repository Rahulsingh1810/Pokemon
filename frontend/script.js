const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const weaknessFilterSelect = document.getElementById('weaknessFilter');
const sortNameSelect = document.getElementById('sortName');
const sortNumberSelect = document.getElementById('sortNumber');
const randomizeButton = document.getElementById('randomize');
const clearFilterButton = document.getElementById('clearFilter');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const hamburgerMenu = document.getElementById('hamburger-menu');
const menuContainer = document.getElementById('menu-container');
const closeMenuButton = document.getElementById('close-menu');

let currentPage = 1;
const itemsPerPage = 15;
let pokemonData = [];

async function getData() {
    try {
        const response = await fetch('http://localhost:8080/pokemon-data');
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
weaknessFilterSelect.addEventListener('change', displayPokemon);
sortNameSelect.addEventListener('change', displayPokemon);
sortNumberSelect.addEventListener('change', displayPokemon);
randomizeButton.addEventListener('click', randomizePokemon);
clearFilterButton.addEventListener('click', clearFilters);
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

hamburgerMenu.addEventListener('click', () => {
    menuContainer.classList.toggle('show');
});

closeMenuButton.addEventListener('click', () => {
    menuContainer.classList.remove('show');
});

function filteredPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;
    const filterWeakness = weaknessFilterSelect.value;
    
    return pokemonData.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm) || pokemon.number.includes(searchTerm);
        const matchesFilter = filterType ? pokemon.type.includes(filterType) : true;
        const matchesWeakness = filterWeakness ? 
            (pokemon.weakness && pokemon.weakness.some(w => w.toLowerCase() === filterWeakness.toLowerCase())) : true;
        return matchesSearch && matchesFilter && matchesWeakness;
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
        card.className = `pokemon-card ${pokemon.type[0]}`; // Use the first type for the card color
        card.innerHTML = `
            <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}">
            <h3>${pokemon.name}</h3>
            <p>#${pokemon.number}</p>
            <p>Type: ${pokemon.type.join(', ')}</p>
        `;
        card.addEventListener('click', () => {
            console.log(`Card clicked: ${pokemon.name}`); // Debugging log
            openModal(pokemon);
        }); // Add click event to open modal
        pokemonContainer.appendChild(card);
    });
}

function clearFilters() {
    searchInput.value = '';
    filterSelect.value = '';
    weaknessFilterSelect.value = '';
    sortNameSelect.value = '';
    sortNumberSelect.value = '';
    displayPokemon();
}

function randomizePokemon() {
    // Get filtered pokemon if any filters are applied
    const filtered = filteredPokemon();
    const hasFilters = searchInput.value || filterSelect.value || weaknessFilterSelect.value;
    
    console.log('Filters applied:', {
        search: searchInput.value,
        type: filterSelect.value,
        weakness: weaknessFilterSelect.value
    });
    console.log('Number of filtered Pokemon:', filtered.length);

    if (hasFilters) {
        console.log('Shuffling filtered Pokemon only');
        // Create a copy of filtered array to shuffle
        const shuffledFiltered = [...filtered].sort(() => Math.random() - 0.5);
        console.log('Original filtered order:', filtered.map(p => p.name));
        console.log('Shuffled filtered order:', shuffledFiltered.map(p => p.name));
        
        // Create a new array with shuffled filtered Pokemon
        const newPokemonData = [...pokemonData];
        const filteredIndices = filtered.map(f => 
            newPokemonData.findIndex(p => p.number === f.number)
        );
        
        // Replace Pokemon at original indices with shuffled ones
        shuffledFiltered.forEach((pokemon, index) => {
            const originalIndex = filteredIndices[index];
            if (originalIndex !== -1) {
                newPokemonData[originalIndex] = pokemon;
            }
        });
        
        console.log('Updated Pokemon data with shuffled filtered Pokemon');
        pokemonData = newPokemonData;
    } else {
        console.log('Shuffling all Pokemon');
        pokemonData.sort(() => Math.random() - 0.5);
    }
    
    currentPage = 1; // Reset to first page
    displayPokemon();
}

// Function to open modal
function openModal(pokemon) {
    console.log(`Opening modal for: ${pokemon.name}`); // Debugging log
    const modal = document.getElementById('pokemon-modal');
    const pokemonDetails = document.getElementById('pokemon-details');
    // Display Pokémon details in the modal
    pokemonDetails.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}">
        <p>Number: #${pokemon.number}</p>
        <p>Type: ${pokemon.type.join(', ')}</p>
        <p>Height: ${pokemon.height}</p>
        <p>Weight: ${pokemon.weight}</p>
        <p>Abilities: ${pokemon.abilities.join(', ')}</p>
        <p>Weaknesses: ${pokemon.weakness.join(', ')}</p>
    `;
    modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('.close-button');

    // Close modal when the close button is clicked
    closeButton.onclick = function() {
        console.log('Closing modal'); // Debugging log
        const modal = document.getElementById('pokemon-modal');
        modal.style.display = 'none';
    }

    // Close modal when clicking outside of the modal content
    window.onclick = function(event) {
        const modal = document.getElementById('pokemon-modal');
        if (event.target == modal) {
            console.log('Closing modal from outside click'); // Debugging log
            modal.style.display = 'none';
        }
    }

    getData();
});