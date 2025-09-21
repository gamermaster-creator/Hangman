const words = [
    'HANGMAN', 'JAVASCRIPT', 'COMPUTER', 'PROGRAMMING', 'DEVELOPER',
    'WEBSITE', 'INTERNET', 'APPLICATION', 'KEYBOARD', 'MONITOR'
];

let word = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrongGuesses = 6;
let gameState = 'playing'; // playing, won, lost

const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word-display');
const usedLettersDisplay = document.getElementById('used-letters');
const message = document.getElementById('message');
const keyboard = document.getElementById('keyboard');
const newGameBtn = document.getElementById('new-game');

// Initialize the game
function initGame() {
    word = words[Math.floor(Math.random() * words.length)];
    guessedLetters = [];
    wrongGuesses = 0;
    gameState = 'playing';
    
    // Reset keyboard buttons
    const buttons = document.querySelectorAll('.keyboard button');
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
    });
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset message and used letters
    message.textContent = '';
    usedLettersDisplay.textContent = '';
    
    // Update display
    updateWordDisplay();
    drawHangman();
}

// Update the word display with guessed letters
function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    word.split('').forEach(letter => {
        const span = document.createElement('span');
        span.textContent = guessedLetters.includes(letter) ? letter : '';
        wordDisplay.appendChild(span);
    });
}

// Update the used letters display
function updateUsedLetters() {
    usedLettersDisplay.textContent = guessedLetters.join(', ');
}

// Draw hangman based on wrong guesses
function drawHangman() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Clear canvas
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
    
    // Draw body parts based on wrong guesses
    for (let i = 0; i < wrongGuesses; i++) {
        parts[i]();
    }
}

// Handle letter guess
function handleGuess(letter) {
    letter = letter.toUpperCase();
    if (gameState !== 'playing' || !/^[A-Z]$/.test(letter) || guessedLetters.includes(letter)) {
        return;
    }
    
    guessedLetters.push(letter);
    
    const button = Array.from(document.querySelectorAll('.keyboard button')).find(btn => btn.textContent === letter);
    
    if (word.includes(letter)) {
        if (button) button.classList.add('correct');
        if (word.split('').every(l => guessedLetters.includes(l))) {
            gameState = 'won';
            message.textContent = 'Congratulations! You won! 🎉';
            disableAllButtons();
        }
    } else {
        if (button) button.classList.add('wrong');
        wrongGuesses++;
        drawHangman();
        
        if (wrongGuesses >= maxWrongGuesses) {
            gameState = 'lost';
            message.textContent = `Game Over! The word was: ${word}`;
            disableAllButtons();
        }
    }
    
    if (button) button.disabled = true;
    updateWordDisplay();
    updateUsedLetters();
}

function disableAllButtons() {
    document.querySelectorAll('.keyboard button').forEach(button => {
        button.disabled = true;
    });
}

// Event listeners
keyboard.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        handleGuess(e.target.textContent);
    }
});

document.addEventListener('keydown', (e) => {
    handleGuess(e.key);
});

newGameBtn.addEventListener('click', initGame);
// Theme toggle functionality
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');

// Check for saved theme preference, otherwise use device preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

// Apply the saved theme
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
}

// Start the game
initGame();
