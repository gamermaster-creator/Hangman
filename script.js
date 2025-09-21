let wordsData = {};
let word = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrongGuesses = 6;
let gameState = 'choosing'; // choosing, playing, won, lost

const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word-display');
const usedLettersDisplay = document.getElementById('used-letters');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('new-game');
const categorySelection = document.getElementById('category-selection');
const categoryDropdown = document.getElementById('category-dropdown');
const startGameBtn = document.getElementById('start-game-btn');
const mobileInput = document.getElementById('mobile-input');
const guessBtn = document.createElement('button');
guessBtn.textContent = 'Guess';
guessBtn.id = 'guess-btn';

// Check if the device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Fetch words from JSON
async function loadWords() {
    try {
        const response = await fetch('words.json');
        wordsData = await response.json();
        setupCategories();
    } catch (error) {
        console.error('Error loading words:', error);
        message.textContent = 'Failed to load words. Please try again later.';
    }
}

// Setup category selection dropdown
function setupCategories() {
    categoryDropdown.innerHTML = '';
    for (const categoryKey in wordsData) {
        const category = wordsData[categoryKey];
        const option = document.createElement('option');
        option.value = categoryKey;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
    }
    showScreen('category');
}

// Show the correct screen (category selection or game)
function showScreen(screen) {
    if (screen === 'category') {
        categorySelection.style.display = 'flex';
        document.querySelector('.game-box').style.display = 'none';
        document.querySelector('.hangman-box').style.display = 'none';
        message.textContent = '';
    } else if (screen === 'game') {
        categorySelection.style.display = 'none';
        document.querySelector('.game-box').style.display = 'block';
        document.querySelector('.hangman-box').style.display = 'block';
    }
}

// Start a new game with words from a category
function startGame() {
    const selectedCategory = categoryDropdown.value;
    const words = wordsData[selectedCategory].words;
    word = words[Math.floor(Math.random() * words.length)].toUpperCase();
    guessedLetters = [];
    wrongGuesses = 0;
    gameState = 'playing';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    message.textContent = '';
    usedLettersDisplay.textContent = '';

    updateWordDisplay();
    drawHangman();
    showScreen('game');

    if (isMobile()) {
        mobileInput.style.display = 'inline-block';
        mobileInput.parentElement.appendChild(guessBtn);
        mobileInput.focus();
    }
}

// Decompose Thai characters into consonant and vowels
function decomposeThai(letter) {
    const topVowels = ['ั', 'ิ', 'ี', 'ึ', 'ื', '็', '่', '้', '๊', '๋', '์', 'ํ', '๎'];
    const bottomVowels = ['ุ', 'ู', 'ฺ'];

    let consonant = '';
    let top = '';
    let bottom = '';

    for (const char of letter) {
        if (topVowels.includes(char)) {
            top += char;
        } else if (bottomVowels.includes(char)) {
            bottom += char;
        } else {
            consonant += char;
        }
    }

    return { top, consonant, bottom };
}

// Update the word display with guessed letters
function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    word.split('').forEach(char => {
        const letterContainer = document.createElement('div');
        letterContainer.classList.add('letter-container');

        const topSpan = document.createElement('span');
        topSpan.classList.add('vowel-top');
        const consonantSpan = document.createElement('span');
        consonantSpan.classList.add('consonant');
        const bottomSpan = document.createElement('span');
        bottomSpan.classList.add('vowel-bottom');

        if (guessedLetters.includes(char)) {
            const { top, consonant, bottom } = decomposeThai(char);
            topSpan.textContent = top;
            consonantSpan.textContent = consonant;
            bottomSpan.textContent = bottom;
        } else {
            consonantSpan.textContent = ' '; // Keep the space for the underline
        }

        letterContainer.appendChild(topSpan);
        letterContainer.appendChild(consonantSpan);
        letterContainer.appendChild(bottomSpan);
        wordDisplay.appendChild(letterContainer);
    });
}

// Update the used letters display
function updateUsedLetters() {
    usedLettersDisplay.textContent = guessedLetters.join(', ');
}

// Draw hangman based on wrong guesses
function drawHangman() {
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    ctx.lineWidth = 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw gallows
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(150, 250);
    ctx.moveTo(100, 250);
    ctx.lineTo(100, 50);
    ctx.lineTo(200, 50);
    ctx.lineTo(200, 80);
    ctx.stroke();

    const parts = [
        () => { // Head
            ctx.beginPath();
            ctx.arc(200, 100, 20, 0, Math.PI * 2);
            ctx.stroke();
        },
        () => { // Body
            ctx.beginPath();
            ctx.moveTo(200, 120);
            ctx.lineTo(200, 180);
            ctx.stroke();
        },
        () => { // Left arm
            ctx.beginPath();
            ctx.moveTo(200, 140);
            ctx.lineTo(160, 160);
            ctx.stroke();
        },
        () => { // Right arm
            ctx.beginPath();
            ctx.moveTo(200, 140);
            ctx.lineTo(240, 160);
            ctx.stroke();
        },
        () => { // Left leg
            ctx.beginPath();
            ctx.moveTo(200, 180);
            ctx.lineTo(160, 220);
            ctx.stroke();
        },
        () => { // Right leg
            ctx.beginPath();
            ctx.moveTo(200, 180);
            ctx.lineTo(240, 220);
            ctx.stroke();
        }
    ];

    for (let i = 0; i < wrongGuesses; i++) {
        parts[i]();
    }
}

// Handle letter guess
function handleGuess(key) {
    const normalizedKey = key.normalize('NFC').toUpperCase();

    if (gameState !== 'playing' || guessedLetters.includes(normalizedKey)) {
        return;
    }

    // Check if any character in the key is a valid Thai character
    const isValidThai = [...normalizedKey].some(char => /^[฀-๿]$/.test(char));
    if (!isValidThai) {
        return;
    }

    guessedLetters.push(normalizedKey);

    if (word.includes(normalizedKey)) {
        if (word.split('').every(l => guessedLetters.includes(l))) {
            gameState = 'won';
            message.textContent = 'ยินดีด้วย! คุณชนะ! 🎉';
        }
    } else {
        wrongGuesses++;
        canvas.classList.add('shake');
        setTimeout(() => {
            canvas.classList.remove('shake');
        }, 500);
        drawHangman();

        if (wrongGuesses >= maxWrongGuesses) {
            gameState = 'lost';
            message.textContent = `เกมจบ! คำที่ถูกต้องคือ: ${word}`;
        }
    }

    updateWordDisplay();
    updateUsedLetters();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    handleGuess(e.key);
});

guessBtn.addEventListener('click', () => {
    const letter = mobileInput.value;
    handleGuess(letter);
    mobileInput.value = '';
    mobileInput.focus();
});

newGameBtn.addEventListener('click', setupCategories);
startGameBtn.addEventListener('click', startGame);

// Theme toggle functionality
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    drawHangman();
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
}

// Initialize the app
loadWords();
