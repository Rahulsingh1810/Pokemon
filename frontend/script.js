const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const weaknessFilterSelect = document.getElementById('weaknessFilter');
const sortSelect = document.getElementById('sortSelect');
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

// ✅ Fetch Pokémon Data
async function getData() {
    try {
        const response = await fetch('http://localhost:8080/pokemon-data');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        pokemonData = await response.json();
        displayPokemon();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ✅ Fix: Improved Filtering Functionality
function filteredPokemon() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterType = filterSelect.value.toLowerCase();
    const filterWeakness = weaknessFilterSelect.value.toLowerCase();

    let filtered = pokemonData.filter(pokemon => {
        const nameLower = pokemon.name.toLowerCase();
        const numberMatch = pokemon.number.includes(searchTerm);
        
        const matchesSearch = nameLower.includes(searchTerm) || numberMatch;
        const matchesFilter = filterType 
            ? pokemon.type.some(type => type.toLowerCase() === filterType) 
            : true;
        const matchesWeakness = filterWeakness 
            ? pokemon.weakness && pokemon.weakness.some(weak => weak.toLowerCase() === filterWeakness) 
            : true;

        return matchesSearch && matchesFilter && matchesWeakness;
    });

    // ✅ Sort so names that **start** with the search term come first
    filtered.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        const startsWithA = nameA.startsWith(searchTerm);
        const startsWithB = nameB.startsWith(searchTerm);

        if (startsWithA && !startsWithB) return -1; // A comes first
        if (!startsWithA && startsWithB) return 1;  // B comes first
        return nameA.localeCompare(nameB); // Alphabetical order as fallback
    });

    return filtered;
}


// ✅ Fix: Display Pokémon Correctly
function displayPokemon() {
    pokemonContainer.innerHTML = ''; // Clear previous cards

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    let pokemonToDisplay = filteredPokemon().slice(start, end); // Use filtered list

    if (pokemonToDisplay.length === 0) {
        pokemonContainer.innerHTML = '<p>No Pokémon found.</p>';
        return;
    }

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

// ✅ Ensure Filters Update Pokémon List
searchInput.addEventListener('input', displayPokemon);
filterSelect.addEventListener('change', displayPokemon);
weaknessFilterSelect.addEventListener('change', displayPokemon);

// ✅ Fix: Ensure Modal Doesn't Show Empty on Reload
function openModal(pokemon) {
    if (!pokemon) return; // Prevents opening empty modal

    const modal = document.getElementById('pokemon-modal');
    const pokemonDetails = document.getElementById('pokemon-details');

    pokemonDetails.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}">
        <p>Number: #${pokemon.number}</p>
        <p>Type: ${pokemon.type.join(', ')}</p>
        <p>Height: ${pokemon.height}</p>
        <p>Weight: ${pokemon.weight}</p>
        <p>Abilities: ${pokemon.abilities.join(', ')}</p>
        <p>Weaknesses: ${pokemon.weakness ? pokemon.weakness.join(', ') : 'None'}</p>
    `;

    modal.style.display = 'flex'; // Show modal
}

// ✅ Hide Modal on Page Load
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('pokemon-modal');
    modal.style.display = 'none'; // Hide modal on reload

    const closeButton = document.querySelector('.close-button');
    closeButton.onclick = () => modal.style.display = 'none';

    window.onclick = event => {
        if (event.target === modal) modal.style.display = 'none';
    };

    getData(); // Fetch Pokémon data
});

// ✅ Sorting Functionality
sortSelect.addEventListener('change', () => {
    const sortValue = sortSelect.value;
    
    if (sortValue.startsWith('name')) {
        const isAsc = sortValue === 'nameAsc';
        pokemonData.sort((a, b) => isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortValue.startsWith('number')) {
        const isAsc = sortValue === 'numberAsc';
        pokemonData.sort((a, b) => isAsc ? parseInt(a.number) - parseInt(b.number) : parseInt(b.number) - parseInt(a.number));
    }

    currentPage = 1; // Reset to first page
    displayPokemon();
});

// ✅ Pagination Buttons
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

// ✅ Clear Filters
clearFilterButton.addEventListener('click', () => {
    searchInput.value = '';
    filterSelect.value = '';
    weaknessFilterSelect.value = '';
    sortSelect.value = '';
    currentPage = 1;
    displayPokemon();
});

// ✅ Randomize Pokémon Order
randomizeButton.addEventListener('click', () => {
    pokemonData.sort(() => Math.random() - 0.5);
    currentPage = 1;
    displayPokemon();
});

// ✅ Hamburger Menu Controls
hamburgerMenu.addEventListener('click', () => {
    menuContainer.classList.toggle('show');
});

closeMenuButton.addEventListener('click', () => {
    menuContainer.classList.remove('show');
});

// ✅ Logout Functionality
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});
// ✅ Fix: Ensure pagination updates correctly
function updatePagination() {
    const totalPokemon = filteredPokemon().length;
    const totalPages = Math.ceil(totalPokemon / itemsPerPage);
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;

    if (totalPages === 0) {
        prevButton.style.display = "none";
        nextButton.style.display = "none";
    } else {
        prevButton.style.display = "inline-block";
        nextButton.style.display = "inline-block";
    }
}
