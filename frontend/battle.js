document.addEventListener('DOMContentLoaded', () => {
    const customAlert = document.getElementById('customAlert');
    const customPrompt = document.getElementById('customPrompt');
    if (customAlert) customAlert.style.display = 'none';
    if (customPrompt) customPrompt.style.display = 'none';
    populateDecks();

    // Add event listener for the return home button
    document.getElementById('returnHomeBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

function populateDecks() {
    const userDeckElement = document.getElementById('userDeck');
    const opponentDeckElement = document.getElementById('opponentDeck');

    const userDeck = JSON.parse(localStorage.getItem('userDeck')) || [];
    const opponentDeck = JSON.parse(localStorage.getItem('opponentDeck')) || [];

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

    // Check if the battle is complete
    checkBattleCompletion();
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

    console.log('User Card:', JSON.stringify(userCard, null, 2));
    console.log('Opponent Card:', JSON.stringify(opponentCard, null, 2));

    // Check if weakness property exists
    if (!userCard.weakness || !opponentCard.weakness) {
        console.error('Weakness property missing in one or both cards:', {
            userCardWeakness: userCard.weakness,
            opponentCardWeakness: opponentCard.weakness
        });
        comparisonDetails += '<p>Error: Weakness data missing!</p>';
    } else {
        // Compare type weaknesses (case-insensitive)
        userCard.type.forEach(type => {
            const normalizedType = type.toLowerCase();
            console.log(`Checking if opponent's weaknesses include user's type: ${normalizedType}`);
            if (opponentCard.weakness.map(w => w.toLowerCase()).includes(normalizedType)) {
                userPoints++;
                comparisonDetails += `<p>User's ${type} type is strong against opponent's weakness.</p>`;
                console.log(`User's ${type} type is strong against opponent's weakness.`);
            }
        });

        opponentCard.type.forEach(type => {
            const normalizedType = type.toLowerCase();
            console.log(`Checking if user's weaknesses include opponent's type: ${normalizedType}`);
            if (userCard.weakness.map(w => w.toLowerCase()).includes(normalizedType)) {
                opponentPoints++;
                comparisonDetails += `<p>Opponent's ${type} type is strong against user's weakness.</p>`;
                console.log(`Opponent's ${type} type is strong against user's weakness.`);
            }
        });
    }

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

function checkBattleCompletion() {
    const userDeck = JSON.parse(localStorage.getItem('userDeck')) || [];
    const opponentDeck = JSON.parse(localStorage.getItem('opponentDeck')) || [];

    if (userDeck.length === 0 || opponentDeck.length === 0) {
        handleBattleCompletion();
    }
}

function handleBattleCompletion() {
    const userScore = parseInt(document.getElementById('userScore').textContent);
    const opponentScore = parseInt(document.getElementById('opponentScore').textContent);

    let message = '';
    if (userScore > opponentScore) {
        message = 'Congratulations! You won the battle!';
    } else if (userScore < opponentScore) {
        message = 'The opponent won the battle. Better luck next time!';
    } else {
        message = 'It\'s a tie!';
    }

    showAlert(message); // Use custom showAlert

    // Store the score in the database
    storeScoreInDatabase(userScore, opponentScore);
}

function storeScoreInDatabase(userScore, opponentScore) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('You must be logged in to save the battle result.'); // Use custom showAlert
        return;
    }

    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    const opponentId = 'opponent-id'; // Replace with actual opponent ID if available

    fetch('http://localhost:8080/api/save-battle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            userId,
            opponentId,
            score: { user: userScore, opponent: opponentScore }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Battle result saved:', data);
    })
    .catch(error => {
        console.error('Error saving battle result:', error);
    });
}