// --- 1. ส่วนของการตั้งค่า ---
const wordDisplay = document.getElementById('word-display');
// const keyboard = document.querySelector(".keyboard");
const figureParts = document.querySelectorAll('.figure-part');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const playAgainBtn = document.getElementById('play-again');

const thaiAlphabet = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
const wordList = [
    {
        word: "โปรแกรมเมอร์",
        hint: "ผู้ที่เขียนโค้ดคอมพิวเตอร์"
    },
    {
        word: "กาแฟ",
        hint: "เครื่องดื่มยอดนิยมในตอนเช้า"
    },
    {
        word: "ประเทศไทย",
        hint: "ชื่อประเทศของเรา"
    },
    // เพิ่มคำศัพท์ภาษาอังกฤษหรือไทยอื่นๆ ที่นี่
];

// เพิ่มอาร์เรย์สำหรับเก็บคำศัพท์
const words = [
    "programming",
    "computer",
    "javascript",
    "keyboard",
    // เพิ่มคำอื่นๆ ตามต้องการ
];

let currentWord, correctLetters = [], wrongLetters = [], maxGuesses;
let gameInProgress = false;
let usedLetters = new Set();

// ฟังก์ชันเริ่มเกมใหม่
function initNewGame() {
    // สุ่มคำใหม่
    currentWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
    correctLetters = [];
    wrongLetters = [];
    usedLetters.clear();
    gameInProgress = true;
    maxGuesses = 6;
    
    // รีเซ็ตการแสดงผล
    updateUsedLetters();
    updateWordDisplay();
    const guessesText = document.querySelector(".guesses-text");
    if (guessesText) {
        guessesText.innerText = `${wrongLetters.length} / ${maxGuesses}`;
    }
    const gameModal = document.querySelector(".game-modal");
    if (gameModal) {
        gameModal.classList.remove("show");
    }
}

// ฟังก์ชันจัดการ input
function handleInput(letter) {
    if (!letter || !gameInProgress) return;
    
    letter = letter.toLowerCase();
    
    // ตรวจสอบว่าเป็นตัวอักษรที่ยังไม่ได้ใช้
    if (!usedLetters.has(letter)) {
        usedLetters.add(letter);
        processGuess(letter);
        updateUsedLetters();
    }
}

// ฟังก์ชันประมวลผลตัวอักษรที่ทาย
function processGuess(letter) {
    if (currentWord.includes(letter)) {
        // ทายถูก
        [...currentWord].forEach((char, index) => {
            if(char === letter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll("li")[index].innerText = letter;
                wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
            }
        });
    } else {
        // ทายผิด
        wrongLetters.push(letter);
        const guessesText = document.querySelector(".guesses-text");
        if (guessesText) {
            guessesText.innerText = `${wrongLetters.length} / ${maxGuesses}`;
        }
        updateFigure();
    }
    
    checkGameEnd();
}

// อัปเดตภาพ Hangman
function updateFigure() {
    for (let i = 0; i < wrongLetters.length; i++) {
        figureParts[i].style.display = 'block';
    }
}

// ฟังก์ชันตรวจสอบการจบเกม
function checkGameEnd() {
    let wordGuessed = currentWord
        .split('')
        .every(letter => correctLetters.includes(letter));
    
    if (wordGuessed) {
        gameInProgress = false;
        setTimeout(() => {
            notificationText.innerText = 'ยินดีด้วย! คุณชนะ!';
            notification.classList.add('show');
        }, 300);
    } else if (wrongLetters.length >= maxGuesses) {
        gameInProgress = false;
        setTimeout(() => {
            notificationText.innerText = `คุณแพ้แล้ว! คำที่ถูกต้องคือ: ${currentWord}`;
            notification.classList.add('show');
        }, 300);
    }
}

// ฟังก์ชันสำหรับจัดการการกดคีย์บอร์ด
const handleKeyPress = (e) => {
    const key = e.key.toLowerCase();
    // ตรวจสอบว่าเป็นตัวอักษรไทยหรืออังกฤษเท่านั้น และยังไม่เคยทายตัวอักษรนี้
    if (key.match(/^[a-zก-ฮเ-์]$/) && !wrongLetters.includes(key) && !correctLetters.includes(key)) {
        initNewGame(null, key); // เรียกใช้ฟังก์ชันเกมหลัก
    }
}

// เพิ่ม event listener สำหรับการกดคีย์บอร์ด
document.addEventListener("keydown", handleKeyPress);

// ลบ/คอมเมนต์ส่วนการสร้างปุ่มเดิมออก
// const keyboard = document.querySelector(".keyboard");
// keyboard.innerHTML = ''; // ลบปุ่มเดิมออก

// เพิ่มฟังก์ชันสำหรับจัดการ input
function handleInput(letter) {
    if (!letter) return;
    
    // แปลงเป็นตัวพิมพ์เล็ก
    letter = letter.toLowerCase();
    
    // ตรวจสอบว่าเป็นตัวอักษรที่ยังไม่ได้ใช้
    if (!usedLetters.has(letter)) {
        usedLetters.add(letter);
        initNewGame(null, letter);
        updateUsedLetters(); // อัพเดทการแสดงผล
    }
}

// เพิ่มฟังก์ชันแสดงตัวอักษรที่ใช้แล้ว
function updateUsedLetters() {
    const usedLettersDisplay = document.getElementById('used-letters');
    if (usedLettersDisplay) {
        usedLettersDisplay.textContent = 'ตัวอักษรที่ใช้แล้ว: ' + Array.from(usedLetters).join(', ');
    }
}

// แก้ไข event listener สำหรับคีย์บอร์ด
document.addEventListener('keypress', (e) => {
    e.preventDefault();
    handleInput(e.key);
});

// รีเซ็ตเกมใหม่
function resetGame() {
    usedLetters.clear();
    correctLetters = [];
    wrongLetters = [];
    updateUsedLetters();
    initNewGame();
}

getRandomWord();


// --- 3. การควบคุม Event และการเริ่มเกม ---playAgainBtn.addEventListener('click', startGame);

// เริ่มเกมครั้งแรก
startGame();