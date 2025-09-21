const words = [
    'HANGMAN', 'JAVASCRIPT', 'COMPUTER', 'PROGRAMMING', 'DEVELOPER',
    'WEBSITE', 'INTERNET', 'APPLICATION', 'KEYBOARD', 'MONITOR'
];

let word = '';
let guessedLetters = [];
let remainingGuesses = 6;
let gameState = 'playing'; // playing, won, lost

const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word-display');
const message = document.getElementById('message');
const keyboard = document.getElementById('keyboard');
const newGameBtn = document.getElementById('new-game');

// Initialize the game
function initGame() {
    word = words[Math.floor(Math.random() * words.length)];
    guessedLetters = [];
    remainingGuesses = 6;
    gameState = 'playing';
    
    // Reset keyboard buttons
    const buttons = document.querySelectorAll('.keyboard button');
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
    });
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset message
    message.textContent = '';
    
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

// Draw hangman based on remaining guesses
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
    for (let i = 0; i < 6 - remainingGuesses; i++) {
        parts[i]();
    }
}

// Handle letter guess
function handleGuess(letter) {
    if (gameState !== 'playing') return;
    
    if (!guessedLetters.includes(letter)) {
        guessedLetters.push(letter);
        
        const button = document.querySelector(`.keyboard button:contains('${letter}')`);
        
        if (word.includes(letter)) {
            button.classList.add('correct');
            if (word.split('').every(l => guessedLetters.includes(l))) {
                gameState = 'won';
                message.textContent = 'Congratulations! You won! 🎉';
            }
        } else {
            button.classList.add('wrong');
            remainingGuesses--;
            drawHangman();
            
            if (remainingGuesses === 0) {
                gameState = 'lost';
                message.textContent = `Game Over! The word was: ${word}`;
            }
        }
        
        button.disabled = true;
        updateWordDisplay();
    }
}

// Event listeners
keyboard.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        handleGuess(e.target.textContent);
    }
});

newGameBtn.addEventListener('click', initGame);

// Helper function for button selection
HTMLElement.prototype.contains = function(text) {
    return this.textContent === text;
};

// Start the game
initGame();