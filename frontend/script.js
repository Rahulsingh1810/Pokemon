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
const logoutBtn = document.getElementById('logoutBtn');

let currentPage = 1;
const itemsPerPage = 15;
let pokemonData = [];
let wasRandomized = false;

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

logoutBtn.addEventListener('click', () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = 'login.html';
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

function updatePagination() {
    const totalPokemon = filteredPokemon().length;
    const totalPages = Math.ceil(totalPokemon / itemsPerPage);
    const footer = document.querySelector('footer');
    
    footer.innerHTML = `
        <div class="pagination">
            <button id="firstPage" ${currentPage === 1 ? 'disabled' : ''}>First</button>
            <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            <button id="lastPage" ${currentPage === totalPages ? 'disabled' : ''}>Last</button>
        </div>
    `;

    // Add event listeners for pagination buttons
    document.getElementById('firstPage').addEventListener('click', () => goToPage(1));
    document.getElementById('prevPage').addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => goToPage(currentPage + 1));
    document.getElementById('lastPage').addEventListener('click', () => goToPage(totalPages));
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredPokemon().length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayPokemon();
    }
}

function displayPokemon() {
    pokemonContainer.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    // Remove duplicates first
    const uniquePokemon = [];
    const seenNumbers = new Set();
    pokemonData.forEach(pokemon => {
        if (!seenNumbers.has(pokemon.number)) {
            seenNumbers.add(pokemon.number);
            uniquePokemon.push(pokemon);
        }
    });
    
    // Update pokemonData with unique Pokemon
    pokemonData = uniquePokemon;
    
    // Now proceed with filtering and sorting
    let pokemonToDisplay = filteredPokemon();
    pokemonToDisplay = sortPokemon(pokemonToDisplay).slice(start, end);

    pokemonToDisplay.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = `pokemon-card ${pokemon.type[0]}`;
        card.innerHTML = `
            <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}">
            <h3>${pokemon.name}</h3>
            <p>#${pokemon.number}</p>
            <p>Type: ${pokemon.type.join(', ')}</p>
        `;
        card.addEventListener('click', () => openModal(pokemon));
        pokemonContainer.appendChild(card);
    });

    updatePagination();
}

function clearFilters() {
    // Clear all input fields and selections
    searchInput.value = '';
    filterSelect.value = '';
    weaknessFilterSelect.value = '';
    sortNameSelect.value = '';
    sortNumberSelect.value = '';
    
    // Reset page to 1
    currentPage = 1;
    
    // Reset randomization flag
    wasRandomized = false;
    
    // Remove duplicates and sort by number
    const uniquePokemon = [];
    const seenNumbers = new Set();
    
    [...pokemonData]
        .sort((a, b) => parseInt(a.number) - parseInt(b.number))
        .forEach(pokemon => {
            if (!seenNumbers.has(pokemon.number)) {
                seenNumbers.add(pokemon.number);
                uniquePokemon.push(pokemon);
            }
        });
    
    pokemonData = uniquePokemon;
    displayPokemon();
}

function randomizePokemon() {
    wasRandomized = true;
    // Get filtered pokemon if any filters are applied
    const filtered = filteredPokemon();
    const hasFilters = searchInput.value || filterSelect.value || weaknessFilterSelect.value;

    if (hasFilters) {
        // Create a copy of filtered array to shuffle
        const shuffledFiltered = [...filtered].sort(() => Math.random() - 0.5);
        
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
        
        pokemonData = newPokemonData;
    } else {
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