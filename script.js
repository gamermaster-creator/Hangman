// 1. เตรียมข้อมูล
const gameBoard = document.querySelector('.game-board');
const movesSpan = document.querySelector('#moves');
const images = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'];
const cardValues = [...images, ...images]; // ทำให้มีภาพละ 2 ใบ

let flippedCards = []; // เก็บการ์ดที่ถูกเปิด 2 ใบ
let matchedPairs = 0;
let moves = 0;

// 2. สับการ์ด (Shuffle)
cardValues.sort(() => 0.5 - Math.random());

// 3. สร้างการ์ดลงใน HTML
cardValues.forEach(value => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = value; // เก็บค่าของรูปภาพไว้
    
    // สร้าง element รูปภาพ (ใช้ emoji แทน)
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    cardContent.textContent = value;
    card.appendChild(cardContent);
    
    card.addEventListener('click', handleCardClick);
    gameBoard.appendChild(card);
});

// 4. ฟังก์ชันจัดการเมื่อคลิกการ์ด
function handleCardClick(event) {
    const clickedCard = event.currentTarget;

    // กันไม่ให้คลิกการ์ดที่เปิดอยู่แล้ว หรือเปิดเกิน 2 ใบ
    if (flippedCards.length < 2 && !clickedCard.classList.contains('flipped')) {
        flipCard(clickedCard);
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

// 5. ฟังก์ชันพลิกการ์ด
function flipCard(card) {
    card.classList.add('flipped');
}

// 6. ฟังก์ชันตรวจสอบว่าตรงกันหรือไม่
function checkForMatch() {
    moves++;
    movesSpan.textContent = moves;

    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        // ถ้าตรงกัน
        matchedPairs++;
        flippedCards = []; // รีเซ็ต
        if (matchedPairs === images.length) {
            setTimeout(() => alert(`ยินดีด้วย! คุณชนะใน ${moves} ครั้ง!`), 500);
        }
    } else {
        // ถ้าไม่ตรงกัน ให้พลิกกลับ
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = []; // รีเซ็ต
        }, 1000); // หน่วงเวลา 1 วินาทีเพื่อให้ผู้เล่นเห็น
    }
}