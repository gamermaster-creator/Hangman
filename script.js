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

let selectedWord = '';
let correctLetters = [], wrongLetters = [], maxGuesses;

// เพิ่มตัวแปรสำหรับเก็บตัวอักษรที่ใช้แล้ว
let usedLetters = new Set();

const initGame = (button, clickedLetter) => {
    // สุ่มคำ
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)].word;
    
    // รีเซ็ตค่าต่างๆ
    correctLetters = [];
    wrongLetters = [];
    wordDisplay.innerHTML = '';
    // keyboard.innerHTML = '';
    notification.classList.remove('show');
    figureParts.forEach(part => part.style.display = 'none');

    // แสดงคำใบ้ (ขีด _)
    selectedWord.split('').forEach(() => {
        wordDisplay.innerHTML += `<span class="letter"></span>`;
    });

    // สร้างแป้นพิมพ์
    thaiAlphabet.split('').forEach(char => {
        const button = document.createElement('button');
        button.innerText = char;
        button.classList.add('key');
        button.addEventListener('click', () => handleGuess(char, button));
        keyboard.appendChild(button);
    });

    maxGuesses = 6; // จำนวนครั้งสูงสุดที่ผู้เล่นสามารถทายผิดได้
    guessesText.innerText = `0 / ${maxGuesses}`; // รีเซ็ตข้อความแสดงจำนวนการทายผิด
}

// จัดการเมื่อผู้เล่นกดทาย
function handleGuess(letter, button) {
    button.disabled = true; // ปิดปุ่มที่กดแล้ว

    if (selectedWord.includes(letter)) {
        // ถ้าทายถูก
        correctLetters.push(letter);
        displayWord();
    } else {
        // ถ้าทายผิด
        wrongGuesses++;
        wrongLetters.push(letter);
        guessesText.innerText = `${wrongLetters.length} / ${maxGuesses}`;
        updateFigure();
    }
    checkGameStatus();
}

// อัปเดตการแสดงผลคำศัพท์
function displayWord() {
    const letters = wordDisplay.querySelectorAll('.letter');
    selectedWord.split('').forEach((char, index) => {
        if (correctLetters.includes(char)) {
            letters[index].innerText = char;
        }
    });
}

// อัปเดตภาพ Hangman
function updateFigure() {
    for (let i = 0; i < wrongGuesses; i++) {
        figureParts[i].style.display = 'block';
    }
}

// ตรวจสอบสถานะเกม (ชนะ/แพ้)
function checkGameStatus() {
    // เช็คว่าชนะหรือไม่
    const isWinner = selectedWord.split('').every(letter => correctLetters.includes(letter));
    if (isWinner) {
        notificationText.innerText = 'ยินดีด้วย! คุณชนะ!';
        notification.classList.add('show');
    }

    // เช็คว่าแพ้หรือไม่
    if (wrongGuesses >= figureParts.length) {
        notificationText.innerText = `คุณแพ้แล้ว! คำที่ถูกต้องคือ: ${selectedWord}`;
        notification.classList.add('show');
    }
}

// ฟังก์ชันสำหรับจัดการการกดคีย์บอร์ด
const handleKeyPress = (e) => {
    const key = e.key.toLowerCase();
    // ตรวจสอบว่าเป็นตัวอักษรไทยหรืออังกฤษเท่านั้น และยังไม่เคยทายตัวอักษรนี้
    if (key.match(/^[a-zก-ฮเ-์]$/) && !wrongLetters.includes(key) && !correctLetters.includes(key)) {
        initGame(null, key); // เรียกใช้ฟังก์ชันเกมหลัก
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
        initGame(null, letter);
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
    getRandomWord();
}

getRandomWord();


// --- 3. การควบคุม Event และการเริ่มเกม ---playAgainBtn.addEventListener('click', startGame);

// เริ่มเกมครั้งแรก
startGame();