const gridSize = 5;
const totalCells = gridSize * gridSize;
let diamonds = new Set();
let bombs = new Set();

let balance = { USDT: 1000, BTC: 0.05 }; // Initial balances in USDT and BTC
let currentCurrency = 'USDT';
let currentBet = 0;
let diamondsRevealed = 0;
let potentialWinnings = 0;
let gameActive = false;

const gameContainer = document.getElementById("game");
const gameStatus = document.getElementById("gameStatus");
const balanceDisplay = document.getElementById("balance");
const cashOutButton = document.getElementById("cashOutButton");

function updateDisplayCurrency() {
    currentCurrency = document.getElementById("currency").value;
    balanceDisplay.textContent = `${balance[currentCurrency]} ${currentCurrency}`;
}

function placeRandomItems(diamondSet, bombSet, diamondCount, bombCount) {
    let allCells = Array.from({ length: totalCells }, (_, i) => i);
    shuffleArray(allCells);
    diamondSet.clear();
    bombSet.clear();
    for (let i = 0; i < diamondCount; i++) {
        diamondSet.add(allCells[i]);
    }
    for (let i = diamondCount; i < diamondCount + bombCount; i++) {
        bombSet.add(allCells[i]);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function resetGame() {
    gameContainer.innerHTML = "";
    diamonds.clear();
    bombs.clear();
    diamondsRevealed = 0;
    potentialWinnings = 0;
    gameStatus.textContent = "Game reset. Place your bet and set mines to start!";
    document.getElementById("betAmount").disabled = false;
    document.getElementById("mineCount").disabled = false;
    cashOutButton.disabled = true;
    gameActive = false;
}

function startGame() {
    const betInput = document.getElementById("betAmount");
    currentBet = parseFloat(betInput.value);
    const mineCount = parseInt(document.getElementById("mineCount").value);
    const diamondCount = totalCells - mineCount;

    if (isNaN(currentBet) || currentBet <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    if (currentBet > balance[currentCurrency]) {
        alert(`Insufficient balance. Your balance is ${balance[currentCurrency]} ${currentCurrency}.`);
        return;
    }

    if (isNaN(mineCount) || mineCount < 1 || mineCount > 24) {
        alert("Please enter a valid number of mines between 1 and 24.");
        return;
    }

    resetGame();

    // Deduct bet amount from balance
    balance[currentCurrency] -= currentBet;
    updateDisplayCurrency();

    placeRandomItems(diamonds, bombs, diamondCount, mineCount);
    gameActive = true;
    potentialWinnings = currentBet;
    gameStatus.textContent = `Game started! Bet Amount: ${currentBet} ${currentCurrency} | Potential Winnings: ${potentialWinnings.toFixed(2)} ${currentCurrency}`;
    betInput.disabled = true;
    document.getElementById("mineCount").disabled = true;
    cashOutButton.disabled = false;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;

        cell.addEventListener("click", () => revealCell(i, cell));
        gameContainer.appendChild(cell);
    }
}

function revealCell(index, cell) {
    if (!gameActive) return;

    if (diamonds.has(index)) {
        cell.classList.add("diamond");
        cell.textContent = "💎";
        diamondsRevealed++;
        potentialWinnings += currentBet * 0.5;
        gameStatus.textContent = `Diamonds found: ${diamondsRevealed} | Potential Winnings: ${potentialWinnings.toFixed(2)} ${currentCurrency}`;

        if (diamondsRevealed === diamonds.size) {
            gameStatus.textContent = `Congratulations! You found all diamonds and won ${potentialWinnings.toFixed(2)} ${currentCurrency}!`;
            endGame(potentialWinnings);
        }
    } else if (bombs.has(index)) {
        cell.classList.add("bomb");
        cell.textContent = "💥";
        gameStatus.textContent = `You hit a bomb! Game over. You lost ${currentBet} ${currentCurrency}.`;
        endGame(0); // No winnings on a bomb hit
    }

    cell.style.pointerEvents = 'none';
}

function cashOut() {
    if (!gameActive) return;

    gameStatus.textContent = `You cashed out and won ${potentialWinnings.toFixed(2)} ${currentCurrency}!`;
    endGame(potentialWinnings);
}

function doubleBet() {
    if (gameActive) return;

    const betInput = document.getElementById("betAmount");
    const currentAmount = parseFloat(betInput.value);

    if (isNaN(currentAmount) || currentAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    const doubleAmount = currentAmount * 2;
    betInput.value = doubleAmount;
}

function endGame(winnings) {
    balance[currentCurrency] += winnings;
    updateDisplayCurrency();
    gameActive = false;
    cashOutButton.disabled = true;
    document.getElementById("betAmount").disabled = false;
    document.getElementById("mineCount").disabled = false;
}

updateDisplayCurrency();
resetGame();