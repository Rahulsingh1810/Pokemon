const userDeckDiv = document.getElementById('userDeck');
const opponentDeckDiv = document.getElementById('opponentDeck');
const userCardDiv = document.getElementById('userCard');
const opponentCardDiv = document.getElementById('opponentCard');
const battleResult = document.getElementById('battleResult');

let userDeck = JSON.parse(localStorage.getItem('userDeck')) || [];
let opponentDeck = JSON.parse(localStorage.getItem('opponentDeck')) || [];
let userScore = 0;
let opponentScore = 0;

function displayDeck(deck, container, isUser) {
  container.innerHTML = '';
  deck.forEach((pokemon, index) => {
    const card = document.createElement('div');
    card.className = `pokemon-card ${pokemon.type[0]}`;
    card.innerHTML = `
        <img src="${pokemon.ThumbnailImage}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>#${pokemon.number}</p>
    `;
    if (isUser) {
      card.addEventListener('click', () => battle(pokemon, index));
    }
    container.appendChild(card);
  });
}

function battle(userPokemon, userIndex) {
  if (opponentDeck.length === 0) {
    endBattle();
    return;
  }

  const opponentIndex = Math.floor(Math.random() * opponentDeck.length);
  const opponentPokemon = opponentDeck[opponentIndex];

  userCardDiv.innerHTML = `
    <div class="pokemon-card ${userPokemon.type[0]}">
        <img src="${userPokemon.ThumbnailImage}" alt="${userPokemon.name}">
        <h3>${userPokemon.name}</h3>
        <p>Type: ${userPokemon.type.join(', ')}</p>
        <p>Height: ${userPokemon.height}</p>
        <p>Weight: ${userPokemon.weight}</p>
    </div>
  `;

  opponentCardDiv.innerHTML = `
    <div class="pokemon-card ${opponentPokemon.type[0]}">
        <img src="${opponentPokemon.ThumbnailImage}" alt="${opponentPokemon.name}">
        <h3>${opponentPokemon.name}</h3>
        <p>Type: ${opponentPokemon.type.join(', ')}</p>
        <p>Height: ${opponentPokemon.height}</p>
        <p>Weight: ${opponentPokemon.weight}</p>
    </div>
  `;

  const result = compareCards(userPokemon, opponentPokemon);
  if (result === 'A') {
    userScore++;
    battleResult.textContent = `${userPokemon.name} wins!`;
  } else if (result === 'B') {
    opponentScore++;
    battleResult.textContent = `${opponentPokemon.name} wins!`;
  } else {
    battleResult.textContent = "It's a draw!";
  }

  userDeck.splice(userIndex, 1);
  opponentDeck.splice(opponentIndex, 1);
  displayDeck(userDeck, userDeckDiv, true);
  displayDeck(opponentDeck, opponentDeckDiv, false);

  if (userDeck.length === 0 || opponentDeck.length === 0) {
    endBattle();
  }
}

function compareCards(cardA, cardB) {
  let aWins = 0;
  let bWins = 0;

  // Type advantage
  if (cardB.weakness && cardB.weakness.includes(cardA.type[0])) aWins++;
  if (cardA.weakness && cardA.weakness.includes(cardB.type[0])) bWins++;

  // Weight
  const weightA = parseFloat(cardA.weight.split(' ')[0]);
  const weightB = parseFloat(cardB.weight.split(' ')[0]);
  if (weightA > weightB) aWins++;
  else if (weightB > weightA) bWins++;

  // Height
  const heightA = parseFloat(cardA.height.split(' ')[0]);
  const heightB = parseFloat(cardB.height.split(' ')[0]);
  if (heightA > heightB) aWins++;
  else if (heightB > heightA) bWins++;

  if (aWins >= 2) return 'A'; // User wins
  if (bWins >= 2) return 'B'; // Opponent wins
  return 'draw';
}

function endBattle() {
  const resultText =
    userScore > opponentScore
      ? 'You win the battle!'
      : userScore < opponentScore
      ? 'Opponent wins the battle!'
      : 'The battle ends in a draw!';
  battleResult.textContent = `${resultText} Score: ${userScore} - ${opponentScore}`;
  saveBattleResult(userScore, opponentScore);
}

async function saveBattleResult(userScore, opponentScore) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token || !user) return;

  try {
    await fetch('http://localhost:8080/api/auth/save-battle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user._id,
        opponentId: selectedBotId,
        score: { user: userScore, opponent: opponentScore },
      }),
    });
  } catch (error) {
    console.error('Error saving battle result:', error);
  }
}

// Initialize battle page
displayDeck(userDeck, userDeckDiv, true);
displayDeck(opponentDeck, opponentDeckDiv, false);