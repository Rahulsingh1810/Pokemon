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
// ✅ Function 1: Search Pokémon (Prioritizes Names Starting with Search Term)
// ✅ Function 1: Search Pokémon (Prioritizes Names Starting with Search Term)
function searchPokemon() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    let searchResults = pokemonData.filter(pokemon => {
        const nameLower = pokemon.name.toLowerCase();
        const numberMatch = pokemon.number.includes(searchTerm);

        return nameLower.includes(searchTerm) || numberMatch;
    });

    // ✅ Sort so names that start with the search term come first (Example: "pi" → Pikachu first)
    searchResults.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        const startsWithA = nameA.startsWith(searchTerm);
        const startsWithB = nameB.startsWith(searchTerm);

        if (startsWithA && !startsWithB) return -1; // A first
        if (!startsWithA && startsWithB) return 1;  // B first
        return nameA.localeCompare(nameB); // Alphabetical fallback
    });

    return searchResults;
}

// ✅ Function 2: Filter Pokémon by Type & Weakness
function filterPokemon(pokemonList) {
    const filterType = filterSelect.value.toLowerCase();
    const filterWeakness = weaknessFilterSelect.value.toLowerCase();

    return pokemonList.filter(pokemon => {
        const matchesType = filterType 
            ? pokemon.type.some(type => type.toLowerCase() === filterType) 
            : true;

        const matchesWeakness = filterWeakness 
            ? pokemon.weakness && pokemon.weakness.some(weak => weak.toLowerCase() === filterWeakness) 
            : true;

        return matchesType && matchesWeakness;
    });
}


// ✅ Function 2: Sort Pokémon (Sorts After Searching)
// ✅ Function 3: Sort Pokémon (Sorts After Search & Filter)
function sortPokemon(pokemonList) {
    const sortValue = sortSelect.value;
    
    let sortedList = [...pokemonList]; // Copy the list to avoid modifying original data

    if (sortValue.startsWith('name')) {
        const isAsc = sortValue === 'nameAsc';
        sortedList.sort((a, b) => isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortValue.startsWith('number')) {
        const isAsc = sortValue === 'numberAsc';
        sortedList.sort((a, b) => isAsc ? parseInt(a.number) - parseInt(b.number) : parseInt(b.number) - parseInt(a.number));
    }

    return sortedList;
}




// ✅ Fix: Display Pokémon Correctly
function displayPokemon() {
    pokemonContainer.innerHTML = ''; // Clear previous cards

    let allFilteredPokemon = getFinalPokemon(); // ✅ Use new function

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    let pokemonToDisplay = allFilteredPokemon.slice(start, end); // ✅ Correct Pagination

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

    updatePagination(); // ✅ Ensure pagination updates correctly
}





// ✅ Ensure Filters Update Pokémon List
searchInput.addEventListener('input', displayPokemon);
filterSelect.addEventListener('change', displayPokemon);
weaknessFilterSelect.addEventListener('change', displayPokemon);
sortSelect.addEventListener('change', () => {
    currentPage = 1; // Reset to first page after sorting
    displayPokemon();
});

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
// ✅ Sorting Functionality (Now Uses `sortPokemon()` Independently)
sortSelect.addEventListener('change', () => {
    currentPage = 1; // Reset to first page after sorting
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
    const totalPages = Math.ceil(getFinalPokemon().length / itemsPerPage); 

    if (currentPage < totalPages) { 
        currentPage++; // Move to the next page
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
randomizeButton.addEventListener('click', randomizePokemon);


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
// ✅ Fix: Ensure Pagination Works Properly
function updatePagination() {
    const totalPokemon = sortPokemon(filterPokemon(searchPokemon())).length;
    const totalPages = Math.ceil(totalPokemon / itemsPerPage);

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;

    if (totalPages <= 1) {
        prevButton.style.display = "none";
        nextButton.style.display = "none";
    } else {
        prevButton.style.display = "inline-block";
        nextButton.style.display = "inline-block";
    }
}

// ✅ Function: Randomize the Displayed Pokémon
// ✅ Function: Randomize Pokémon on Screen or Full List
function randomizePokemon() {
    let pokemonList;

    if (searchInput.value || filterSelect.value || weaknessFilterSelect.value || sortSelect.value) {
        // ✅ Shuffle only the currently displayed Pokémon (filtered/sorted/search results)
        pokemonList = getFinalPokemon();
    } else {
        // ✅ If no search or filter is applied, shuffle the entire dataset
        pokemonList = [...pokemonData]; // Copy the original list to avoid modifying `pokemonData`
    }

    // ✅ Shuffle the selected list
    for (let i = pokemonList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pokemonList[i], pokemonList[j]] = [pokemonList[j], pokemonList[i]];
    }

    currentPage = 1; // ✅ Reset to the first page after shuffle
    displayShuffledPokemon(pokemonList); // ✅ Update display with the shuffled Pokémon
}

// ✅ Function: Display Shuffled Pokémon
function displayShuffledPokemon(shuffledList) {
    pokemonContainer.innerHTML = ''; // ✅ Clear previous cards

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    let pokemonToDisplay = shuffledList.slice(start, end); // ✅ Get only Pokémon for the current page

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

    updatePagination(); // ✅ Ensure pagination updates correctly
}



// ✅ Function: Combines Search, Filter, and Sorting
function getFinalPokemon() {
    return sortPokemon(filterPokemon(searchPokemon())); // ✅ Apply Search → Filter → Sort
}
