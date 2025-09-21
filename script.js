// --- 1. ส่วนของการตั้งค่า ---
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const figureParts = document.querySelectorAll('.figure-part');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const playAgainBtn = document.getElementById('play-again');

const thaiAlphabet = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
const wordList = ['โปรแกรมเมอร์', 'แมวน้ำ', 'รถไฟฟ้า', 'กะเพราไก่', 'จระเข้', 'ไดโนเสาร์', 'โทรทัศน์'];

let selectedWord = '';
let correctLetters = [];
let wrongGuesses = 0;

// --- 2. ฟังก์ชันหลักของเกม ---

// สุ่มคำศัพท์และเริ่มเกมใหม่
function startGame() {
    // สุ่มคำ
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    
    // รีเซ็ตค่าต่างๆ
    correctLetters = [];
    wrongGuesses = 0;
    wordDisplay.innerHTML = '';
    keyboard.innerHTML = '';
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


// --- 3. การควบคุม Event และการเริ่มเกม ---
playAgainBtn.addEventListener('click', startGame);

// เริ่มเกมครั้งแรก
startGame();