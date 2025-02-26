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
const logoutBtn = document.getElementById('logoutBtn');
const showDeckButton = document.getElementById('showDeck');

let currentPage = 1;
const itemsPerPage = 15;
let pokemonData = [];
let battleDeck = [];
let isRandomized = false;
let selectedBotId = null;

// Fetch Pokémon Data
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

// Search Pokémon
function searchPokemon() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let searchResults = pokemonData.filter(pokemon => {
        const nameLower = pokemon.name.toLowerCase();
        const numberMatch = pokemon.number.toString().includes(searchTerm);
        return nameLower.includes(searchTerm) || numberMatch;
    });

    searchResults.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const startsWithA = nameA.startsWith(searchTerm);
        const startsWithB = nameB.startsWith(searchTerm);
        if (startsWithA && !startsWithB) return -1;
        if (!startsWithA && startsWithB) return 1;
        return nameA.localeCompare(nameB);
    });

    return searchResults;
}

// Filter Pokémon by Type & Weakness
function filterPokemon(pokemonList) {
    const filterType = filterSelect.value.toLowerCase();
    const filterWeakness = weaknessFilterSelect.value.toLowerCase();

    return pokemonList.filter(pokemon => {
        const matchesType = filterType ? pokemon.type.some(type => type.toLowerCase() === filterType) : true;
        const matchesWeakness = filterWeakness ? pokemon.weakness && pokemon.weakness.some(weak => weak.toLowerCase() === filterWeakness) : true;
        return matchesType && matchesWeakness;
    });
}

// Sort Pokémon
function sortPokemon(pokemonList) {
    const sortValue = sortSelect.value;
    let sortedList = [...pokemonList];

    if (sortValue.startsWith('name')) {
        const isAsc = sortValue === 'nameAsc';
        sortedList.sort((a, b) => isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortValue.startsWith('number')) {
        const isAsc = sortValue === 'numberAsc';
        sortedList.sort((a, b) => isAsc ? parseInt(a.number) - parseInt(b.number) : parseInt(b.number) - parseInt(a.number));
    }

    return sortedList;
}

// Display Pokémon
function displayPokemon() {
    pokemonContainer.innerHTML = '';
    let allFilteredPokemon = getFinalPokemon();

    if (!searchInput.value.trim() && filterSelect.value === "" && weaknessFilterSelect.value === "" && sortSelect.value === "" && !isRandomized) {
        allFilteredPokemon.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    let pokemonToDisplay = allFilteredPokemon.slice(start, end);

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

// Open Pokémon Modal
function openModal(pokemon) {
    if (!pokemon) return;
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
        <button class="add-to-deck" onclick="addToDeck('${pokemon.number}')">Add to Deck</button>
    `;

    modal.style.display = 'flex';
}

// Initialize Page and Hide Modals
document.addEventListener('DOMContentLoaded', () => {
    const pokemonModal = document.getElementById('pokemon-modal');
    const deckModal = document.getElementById('deckModal');
    const customAlert = document.getElementById('customAlert');
    const customPrompt = document.getElementById('customPrompt');

    // Hide modals on load
    pokemonModal.style.display = 'none';
    deckModal.style.display = 'none';
    customAlert.style.display = 'none';
    customPrompt.style.display = 'none';

    // Close Pokémon modal
    pokemonModal.querySelector('.close-button').addEventListener('click', () => {
        pokemonModal.style.display = 'none';
    });

    // Close Deck modal
    deckModal.querySelector('.close-button').addEventListener('click', () => {
        deckModal.style.display = 'none';
    });

    // Close modals on outside click
    window.addEventListener('click', (event) => {
        if (event.target === pokemonModal) pokemonModal.style.display = 'none';
        if (event.target === deckModal) deckModal.style.display = 'none';
    });

    getData();
    fetchDeck();

    document.getElementById('goToBattleBtn').addEventListener('click', goToBattle);

    // Add event listener for selectOpponentBtn
    document.getElementById('selectOpponentBtn').addEventListener('click', selectOpponent);
});

// Event Listeners
searchInput.addEventListener('input', displayPokemon);
filterSelect.addEventListener('change', displayPokemon);
weaknessFilterSelect.addEventListener('change', displayPokemon);
sortSelect.addEventListener('change', () => {
    currentPage = 1;
    displayPokemon();
});
prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPokemon();
    }
});
nextButton.addEventListener('click', () => {
    const totalPages = Math.ceil(getFinalPokemon().length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPokemon();
    }
});
clearFilterButton.addEventListener('click', () => {
    searchInput.value = '';
    filterSelect.value = '';
    weaknessFilterSelect.value = '';
    sortSelect.value = '';
    currentPage = 1;
    displayPokemon();
});
randomizeButton.addEventListener('click', randomizePokemon);
hamburgerMenu.addEventListener('click', () => {
    menuContainer.classList.toggle('show');
});
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});
showDeckButton.addEventListener('click', () => {
    const deckModal = document.getElementById('deckModal');
    updateDeckDisplay();
    deckModal.style.display = 'flex';
});

// Update Pagination
function updatePagination() {
    const totalPokemon = getFinalPokemon().length;
    const totalPages = Math.ceil(totalPokemon / itemsPerPage);
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
    prevButton.style.display = totalPages <= 1 ? 'none' : 'inline-block';
    nextButton.style.display = totalPages <= 1 ? 'none' : 'inline-block';
}

// Randomize Pokémon
function randomizePokemon() {
    let pokemonList = searchInput.value || filterSelect.value || weaknessFilterSelect.value || sortSelect.value ? getFinalPokemon() : [...pokemonData];
    for (let i = pokemonList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pokemonList[i], pokemonList[j]] = [pokemonList[j], pokemonList[i]];
    }
    currentPage = 1;
    displayShuffledPokemon(pokemonList);
}

function displayShuffledPokemon(shuffledList) {
    pokemonContainer.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    let pokemonToDisplay = shuffledList.slice(start, end);

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

// Combine Search, Filter, and Sort
function getFinalPokemon() {
    return sortPokemon(filterPokemon(searchPokemon()));
}

// Deck Operations
async function addToDeck(pokemonNumber) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('You must be logged in to add Pokémon to your deck.');
        window.location.href = 'login.html';
        return;
    }

    if (battleDeck.some(pokemon => pokemon.number === pokemonNumber)) {
        showAlert('This Pokémon is already in your deck.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pokemonNumber })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData.message);
            if (errorData.message === 'Pokémon is already in the deck') {
                showAlert('This Pokémon is already in your deck.');
            } else if (errorData.message === 'Deck cannot exceed 7 Pokémon') {
                showAlert('Your deck is full (max 7 Pokémon).');
            } else if (errorData.message === 'Pokémon not found') {
                showAlert('Pokémon not found in the database.');
            } else {
                showAlert('Failed to add Pokémon to deck: ' + errorData.message);
            }
            return;
        }

        const updatedDeck = await response.json();
        battleDeck = updatedDeck;
        updateDeckDisplay();
        showAlert('Pokémon added to deck successfully!');
        document.getElementById('pokemon-modal').style.display = 'none';
    } catch (error) {
        console.error('Error adding Pokémon to deck:', error);
        showAlert('Failed to add Pokémon to deck due to a network error.');
    }
}

async function fetchDeck() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8080/api/auth/deck', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch deck');
        const deck = await response.json();
        battleDeck = deck;
        updateDeckDisplay();
    } catch (error) {
        console.error('Error fetching deck:', error);
    }
}

async function removeFromDeck(pokemonNumber) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('You must be logged in to remove Pokémon from your deck.');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('Removing Pokémon with number:', pokemonNumber);
        console.log('Current battleDeck before removal:', JSON.stringify(battleDeck, null, 2));
        const response = await fetch(`http://localhost:8080/api/auth/deck/${pokemonNumber}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove Pokémon');
        }

        const updatedDeck = await response.json();
        console.log('Response from server:', JSON.stringify(updatedDeck, null, 2));
        battleDeck = updatedDeck.deck; // Use the deck array from the response
        console.log('Updated battleDeck after removal:', JSON.stringify(battleDeck, null, 2));
        updateDeckDisplay();
        showAlert('Pokémon removed from deck successfully!');
    } catch (error) {
        console.error('Error removing Pokémon:', error);
        showAlert('Failed to remove Pokémon: ' + error.message);
    }
}

function updateDeckDisplay() {
    const deckList = document.getElementById('deckList');
    const deckCountFooter = document.querySelector('footer #deckCount');
    const deckCountModal = document.querySelector('#deckModal #deckCount');

    deckList.innerHTML = '';
    battleDeck.forEach(pokemon => {
        const name = pokemon.name || 'Unknown';
        const image = pokemon.ThumbnailImage || 'assets/placeholder.png';
        const deckItem = document.createElement('div');
        deckItem.className = 'deck-item';
        deckItem.innerHTML = `
            <img src="${image}" alt="${name}" style="width: 80px; height: 80px; object-fit: contain;">
            <p>${name}</p>
            <button class="remove-from-deck" onclick="removeFromDeck('${pokemon.number}')">×</button>
        `;
        deckList.appendChild(deckItem);
    });

    const deckSize = battleDeck.length;
    deckCountFooter.textContent = `${deckSize}/7`;
    deckCountModal.textContent = `${deckSize}/7`;
}

// Function to select opponent
async function selectOpponent() {
    try {
        const response = await fetch('http://localhost:8080/api/bots');
        if (!response.ok) throw new Error('Failed to fetch bots');
        const bots = await response.json();

        showPrompt(`Select an opponent by ID 1-145`, (choice) => {
            const botId = parseInt(choice);
            if (bots.some(bot => bot.id === botId)) {
                selectedBotId = botId;
                showAlert(`Selected opponent: Bot ${botId}`);
            } else {
                showAlert('Invalid selection. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error selecting opponent:', error);
        showAlert('Failed to fetch opponents.');
    }
}

// Function to go to battle mode
async function goToBattle() {
    if (!selectedBotId) {
        showAlert('Please select an opponent first.');
        selectOpponent();
        
        return;
    }
    if (battleDeck.length !== 7) {
        showAlert('Your deck must contain exactly 7 Pokémon to start the battle!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/bots/${selectedBotId}/deck`);
        if (!response.ok) throw new Error('Failed to fetch opponent deck');
        const opponentDeck = await response.json();

        localStorage.setItem('userDeck', JSON.stringify(battleDeck));
        localStorage.setItem('opponentDeck', JSON.stringify(opponentDeck));
        window.location.href = 'battle.html';
    } catch (error) {
        console.error('Error starting battle:', error);
        showAlert('Failed to start battle.');
    }
}