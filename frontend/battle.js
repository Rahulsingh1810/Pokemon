document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded');
    populateDecks();
});

function populateDecks() {
    const userDeckElement = document.getElementById('userDeck');
    const opponentDeckElement = document.getElementById('opponentDeck');

    const userDeck = JSON.parse(localStorage.getItem('userDeck')) || [];
    const opponentDeck = JSON.parse(localStorage.getItem('opponentDeck')) || [];

    console.log('User Deck:', userDeck);
    console.log('Opponent Deck:', opponentDeck);

    userDeckElement.innerHTML = '';
    opponentDeckElement.innerHTML = '';

    userDeck.forEach((pokemon, index) => {
        const card = createCardElement(pokemon);
        card.addEventListener('click', () => handleCardClick(index));
        userDeckElement.appendChild(card);
    });

    opponentDeck.forEach(pokemon => {
        const card = createCardElement(pokemon);
        opponentDeckElement.appendChild(card);
    });
}

function createCardElement(pokemon) {
    const card = document.createElement('div');
    card.className = 'deck-item';
    card.innerHTML = `
        <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}" style="width: 80px; height: 80px; object-fit: contain;">
        <h3>${pokemon.name}</h3>
        <p>#${pokemon.number}</p>
        <p>Type: ${pokemon.type.join(', ')}</p>
    `;
    return card;
}

function handleCardClick(userCardIndex) {
    const userDeck = JSON.parse(localStorage.getItem('userDeck')) || [];
    const opponentDeck = JSON.parse(localStorage.getItem('opponentDeck')) || [];

    const userCard = userDeck[userCardIndex];
    const opponentCardIndex = Math.floor(Math.random() * opponentDeck.length);
    const opponentCard = opponentDeck[opponentCardIndex];

    animateCards(userCard, opponentCard);
    const result = compareCards(userCard, opponentCard);

    if (result > 0) {
        updateScores(1, 0);
    } else if (result < 0) {
        updateScores(0, 1);
    } else {
        updateScores(1, 1); // Both get a point in case of a tie
    }

    userDeck.splice(userCardIndex, 1);
    opponentDeck.splice(opponentCardIndex, 1);

    localStorage.setItem('userDeck', JSON.stringify(userDeck));
    localStorage.setItem('opponentDeck', JSON.stringify(opponentDeck));

    populateDecks();
}

function animateCards(userCard, opponentCard) {
    const userCardDisplay = document.getElementById('userCardDisplay');
    const opponentCardDisplay = document.getElementById('opponentCardDisplay');

    userCardDisplay.innerHTML = createCardHTML(userCard);
    opponentCardDisplay.innerHTML = createCardHTML(opponentCard);

    userCardDisplay.style.transform = 'translateY(-20px)';
    opponentCardDisplay.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        userCardDisplay.style.transform = 'translateY(0)';
        opponentCardDisplay.style.transform = 'translateY(0)';
    }, 500);
}

function createCardHTML(pokemon) {
    return `
        <div class="deck-item">
            <img src="${pokemon.ThumbnailImage}" alt="${pokemon.ThumbnailAltText}" style="width: 80px; height: 80px; object-fit: contain;">
            <h3>${pokemon.name}</h3>
            <p>#${pokemon.number}</p>
            <p>Type: ${pokemon.type.join(', ')}</p>
        </div>
    `;
}

function compareCards(userCard, opponentCard) {
    let userPoints = 0;
    let opponentPoints = 0;
    let comparisonDetails = '';

    console.log('User Card:', userCard);
    console.log('Opponent Card:', opponentCard);

    // Compare type weaknesses
    userCard.type.forEach(type => {
        console.log(`Checking if opponent's weaknesses include user's type: ${type}`);
        if (opponentCard.weakness.includes(type)) {
            userPoints++;
            comparisonDetails += `<p>User's ${type} type is strong against opponent's weakness.</p>`;
            console.log(`User's ${type} type is strong against opponent's weakness.`);
        }
    });
    opponentCard.type.forEach(type => {
        console.log(`Checking if user's weaknesses include opponent's type: ${type}`);
        if (userCard.weakness.includes(type)) {
            opponentPoints++;
            comparisonDetails += `<p>Opponent's ${type} type is strong against user's weakness.</p>`;
            console.log(`Opponent's ${type} type is strong against user's weakness.`);
        }
    });

    // Compare height
    if (userCard.height > opponentCard.height) {
        userPoints++;
        comparisonDetails += `<p>User's card is taller.</p>`;
    } else if (userCard.height < opponentCard.height) {
        opponentPoints++;
        comparisonDetails += `<p>Opponent's card is taller.</p>`;
    }

    // Compare weight
    if (userCard.weight > opponentCard.weight) {
        userPoints++;
        comparisonDetails += `<p>User's card is heavier.</p>`;
    } else if (userCard.weight < opponentCard.weight) {
        opponentPoints++;
        comparisonDetails += `<p>Opponent's card is heavier.</p>`;
    }

    const comparisonResult = document.getElementById('comparisonResult');
    comparisonResult.innerHTML = comparisonDetails + `<p>User Points: ${userPoints}, Opponent Points: ${opponentPoints}</p>`;

    return userPoints - opponentPoints;
}

function updateScores(userIncrement, opponentIncrement) {
    const userScoreElement = document.getElementById('userScore');
    const opponentScoreElement = document.getElementById('opponentScore');

    const userScore = parseInt(userScoreElement.textContent) + userIncrement;
    const opponentScore = parseInt(opponentScoreElement.textContent) + opponentIncrement;

    userScoreElement.textContent = userScore;
    opponentScoreElement.textContent = opponentScore;
}

// Example usage
updateScores(0, 0); // Update scores as needed
