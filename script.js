let wordsData = {};
let word = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrongGuesses = 6;
let gameState = 'choosing'; // choosing, playing, won, lost
let wordClusters = []; // store grapheme clusters (so Thai combining marks stay with base)

const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word-display');
const usedLettersDisplay = document.getElementById('used-letters');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('new-game');
const categorySelection = document.getElementById('category-selection');
const categoryDropdown = document.getElementById('category-dropdown');
const startGameBtn = document.getElementById('start-game-btn');

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

// Small self-test helper: when URL has ?selftest=1, log counts for specific examples.
function runSampleChecks() {
    const samples = [
        { label: 'เป็ด', word: '\u0E40\u0E1B\u0E47\u0E14\u0E0D' }, // this literal may vary; use normalized form below
        { label: 'บ้าน', word: '\u0E1A\u0E32\u0E19' },
    ];
    // better: use actual Thai strings
    const rawSamples = ['เป็ด', 'บ้าน', 'น้องดาต้า'];
    rawSamples.forEach(s => {
        const w = s.normalize('NFC');
        const clusters = splitGraphemes(w);
        const breakdown = countPlaceholders(clusters);
        console.log(`SAMPLE "${s}": total=${breakdown.total}`, breakdown.perCluster.map(p => ({ cluster: p.cluster, count: p.count })));
    });
}

// Run self-test if requested via URL param
try {
    if (typeof window !== 'undefined' && window.location && new URLSearchParams(window.location.search).get('selftest') === '1') {
        window.addEventListener('load', runSampleChecks);
    }
} catch (e) {
    // ignore in non-browser env
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
    // pick a word, normalize it and prepare grapheme clusters so accents/diacritics stay attached
    word = words[Math.floor(Math.random() * words.length)].normalize('NFC').toUpperCase();
    wordClusters = splitGraphemes(word);
    guessedLetters = [];
    wrongGuesses = 0;
    gameState = 'playing';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    message.textContent = '';
    usedLettersDisplay.textContent = '';

    updateWordDisplay();
    drawHangman();
    showScreen('game');
    window.focus();

    // Debug: log clusters and decomposed parts to help diagnose placeholder counts
    try {
        console.log('DEBUG word:', word);
        console.log('DEBUG clusters:', wordClusters);
        console.log('DEBUG decomposed:', wordClusters.map(c => decomposeThai(c)));
        // count expected placeholders (consonant + marks)
        const breakdown = countPlaceholders(wordClusters);
        console.log('DEBUG placeholders breakdown:', breakdown);
        console.log('DEBUG expected total placeholders:', breakdown.total);
        // show total in message area
        message.textContent = `ขีดทั้งหมด: ${breakdown.total}`;
    } catch (e) {
        console.warn('DEBUG log failed', e);
    }
}

// Count placeholders per grapheme cluster and total according to rules:
// - consonant: 1 (if present)
// - pre-base (left) vowels: each counts 1
// - top marks (including tone and mark above): each counts 1
// - post-base/right vowels: each counts 1
// - bottom marks: each counts 1
// - karan (U+0E4C) counts 1
function countPlaceholders(clusters) {
    let total = 0;
    const perCluster = clusters.map(cluster => {
        const parts = decomposeThai(cluster);
        let cnt = 0;
        if (parts.consonant && parts.consonant.trim() !== '') cnt++;
        cnt += parts.left.length;
        // top includes tone/tone marks already combined
        cnt += parts.top.length;
        cnt += parts.right.length;
        cnt += parts.bottom.length;
        total += cnt;
        return { cluster, parts, count: cnt };
    });
    return { total, perCluster };
}

// Decompose Thai characters into consonant and vowels
// Decompose a Thai grapheme cluster into visual parts: left (pre-base vowels), top marks, base consonant(s), and bottom marks
function decomposeThai(cluster) {
    // Reference ranges / codepoints for common Thai marks
    const leftVowels = ['\u0E40','\u0E41','\u0E42','\u0E43','\u0E44']; // เ แ โ ใ ไ
    const topMarks = [
        '\u0E31', // ั
        '\u0E34', // ิ
        '\u0E35', // ี
        '\u0E36', // ึ
        '\u0E37', // ื
        '\u0E47', // ็
        '\u0E4D', // ํ
        '\u0E4C', // ์ (thanthakhat)
        '\u0E33'  // ำ (SARA AM) - treat visually as top/above for better positioning
    ];
    const toneMarks = ['\u0E48','\u0E49','\u0E4A','\u0E4B']; // ่ ้ ๊ ๋
    const bottomMarks = ['\u0E38','\u0E39','\u0E3A','\u0E4E']; // ุ ู ฺ ๎

    let left = '';
    let top = '';
    let tone = '';
    let right = '';
    let consonant = '';
    let bottom = '';

    // iterate characters in the cluster (already a grapheme, but may contain multiple codepoints)
    const chars = [...cluster];

    // simple heuristic: left vowels usually come first, then base consonant(s), then combining marks
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (i === 0 && leftVowels.includes(ch)) {
            left += ch;
            continue;
        }

        if (topMarks.includes(ch)) {
            top += ch;
            continue;
        }

        if (toneMarks.includes(ch)) {
            tone += ch;
            continue;
        }

        // treat common post-base vowels as right-side vowels
        // common right-side vowels: U+0E30..U+0E39 (many are dependent vowels)
        const rightRange = ['\u0E30','\u0E32','\u0E33','\u0E34','\u0E35','\u0E36','\u0E37','\u0E38','\u0E39'];
        if (rightRange.includes(ch)) {
            right += ch;
            continue;
        }

        if (bottomMarks.includes(ch)) {
            bottom += ch;
            continue;
        }

        // otherwise treat as (part of) the base consonant
        consonant += ch;
    }

    // combine tone into top for rendering convenience
    if (tone) top = tone + top;

    // return arrays for multi-mark handling
    return {
        left: left ? [...left] : [],
        top: top ? [...top] : [],
        right: right ? [...right] : [],
        consonant,
        bottom: bottom ? [...bottom] : []
    };
}

// Split a string into grapheme-like clusters.
// Uses Intl.Segmenter when available; otherwise falls back to a simple heuristic that
// attaches combining marks and Thai pre-base vowels to the following base.
function splitGraphemes(str) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return Array.from(seg.segment(str), s => s.segment);
    }

    const leftVowels = new Set(['\u0E40','\u0E41','\u0E42','\u0E43','\u0E44']);
    const combiningMark = /\p{M}/u;
    const chars = [...str];
    const clusters = [];
    let i = 0;
    while (i < chars.length) {
        const ch = chars[i];

        // Pre-base vowel: attach to next char if present
        if (leftVowels.has(ch) && i + 1 < chars.length) {
            let cluster = ch + chars[i + 1];
            i += 2;
            // append following combining marks
            while (i < chars.length && combiningMark.test(chars[i])) {
                cluster += chars[i];
                i++;
            }
            clusters.push(cluster);
            continue;
        }

        // Normal base character
        let cluster = ch;
        i++;
        while (i < chars.length && combiningMark.test(chars[i])) {
            cluster += chars[i];
            i++;
        }
        clusters.push(cluster);
    }

    return clusters;
}

// Update the word display with guessed letters
function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    // iterate grapheme clusters instead of simple code units
    const clusters = (wordClusters.length ? wordClusters : splitGraphemes(word));

    clusters.forEach(cluster => {
        const letterContainer = document.createElement('div');
        letterContainer.classList.add('letter-container');

        const leftSpan = document.createElement('span');
        leftSpan.classList.add('vowel-left');
    const topSpan = document.createElement('span');
    topSpan.classList.add('vowel-top');
    const topPlaceholder = document.createElement('span');
    topPlaceholder.classList.add('placeholder-top');
        const rightSpan = document.createElement('span');
        rightSpan.classList.add('vowel-right');
        const consonantSpan = document.createElement('span');
        consonantSpan.classList.add('consonant');
    const bottomSpan = document.createElement('span');
    bottomSpan.classList.add('vowel-bottom');
    const bottomPlaceholder = document.createElement('span');
    bottomPlaceholder.classList.add('placeholder-bottom');

        const parts = decomposeThai(cluster);

        // LEFT (pre-base) - parts.left is array
        leftSpan.textContent = parts.left.length && guessedLetters.some(g => parts.left.includes(g)) ? parts.left.join('') : '';
        const leftPlaceholder = document.createElement('span');
        leftPlaceholder.classList.add('placeholder-left');
        leftPlaceholder.innerHTML = '';
        parts.left.forEach(mark => {
            if (!guessedLetters.includes(mark) && !guessedLetters.includes(cluster) && !(parts.consonant && guessedLetters.includes(parts.consonant))) {
                const s = document.createElement('div');
                // use an empty element; CSS will draw the visual placeholder line to avoid '_' duplication
                s.className = 'placeholder-left-level';
                // leftPlaceholder.appendChild(s); // Removed to avoid extra placeholder line for front vowels
            }
        });

        // TOP - produce spans for each top mark and placeholder per level
        topSpan.innerHTML = '';
        topPlaceholder.innerHTML = '';
        parts.top.forEach((mark, idx) => {
            const revealed = guessedLetters.includes(mark) || guessedLetters.includes(cluster) || (parts.consonant && guessedLetters.includes(parts.consonant));
            if (revealed) {
                const el = document.createElement('div');
                el.className = 'top-mark';
                el.textContent = mark;
                topSpan.appendChild(el);
            } else {
                const s = document.createElement('div');
                // empty; style via CSS
                s.className = 'placeholder-top-level';
                topPlaceholder.appendChild(s);
            }
        });

        // consonant
        const consonantRevealed = parts.consonant && guessedLetters.some(g => parts.consonant.includes(g));
        consonantSpan.textContent = consonantRevealed ? parts.consonant : '';

        // RIGHT - array
        rightSpan.innerHTML = '';
        const rightPlaceholder = document.createElement('span');
        rightPlaceholder.classList.add('placeholder-right');
        rightPlaceholder.innerHTML = '';
        parts.right.forEach(mark => {
            const revealed = guessedLetters.includes(mark) || guessedLetters.includes(cluster) || (parts.consonant && guessedLetters.includes(parts.consonant));
            if (revealed) {
                const el = document.createElement('div');
                el.className = 'right-mark';
                el.textContent = mark;
                rightSpan.appendChild(el);
            }
            else {
                const s = document.createElement('div');
                s.className = 'placeholder-right-level';
                // rightPlaceholder.appendChild(s); // Removed to avoid extra placeholder line for back vowels
            }
        });

        // BOTTOM - per-level
        bottomSpan.innerHTML = '';
        bottomPlaceholder.innerHTML = '';
        parts.bottom.forEach(mark => {
            const revealed = guessedLetters.includes(mark) || guessedLetters.includes(cluster) || (parts.consonant && guessedLetters.includes(parts.consonant));
            if (revealed) {
                const el = document.createElement('div');
                el.className = 'bottom-mark';
                el.textContent = mark;
                bottomSpan.appendChild(el);
            } else {
                const s = document.createElement('div');
                s.className = 'placeholder-bottom-level';
                bottomPlaceholder.appendChild(s);
            }
        });

    // if nothing of the base consonant revealed, show placeholder
    if (!consonantSpan.textContent) consonantSpan.innerHTML = '&nbsp;';

    letterContainer.appendChild(leftSpan);
    letterContainer.appendChild(leftPlaceholder);
        // top placeholder should be behind or near top span
        letterContainer.appendChild(topPlaceholder);
        letterContainer.appendChild(topSpan);
    letterContainer.appendChild(rightSpan);
    letterContainer.appendChild(rightPlaceholder);
        letterContainer.appendChild(consonantSpan);
        letterContainer.appendChild(bottomPlaceholder);
        letterContainer.appendChild(bottomSpan);
        wordDisplay.appendChild(letterContainer);
    });
}

// Return true when a cluster should be shown based on guessed letters
function isClusterRevealed(cluster) {
    // A cluster is revealed only if the base consonant is guessed and every individual mark is guessed
    const parts = decomposeThai(cluster);
    const consonantOk = parts.consonant ? guessedLetters.some(g => parts.consonant.includes(g)) : true;
    if (!consonantOk) return false;

    // for each array of marks, ensure every mark is guessed
    const arrays = [parts.left, parts.top, parts.right, parts.bottom];
    for (const arr of arrays) {
        for (const mark of arr) {
            if (!guessedLetters.some(g => g === mark)) return false;
        }
    }

    return true;
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
    const thaiRegex = /^[\u0E00-\u0E7F]+$/;
    if (!thaiRegex.test(normalizedKey)) {
        return;
    }

    guessedLetters.push(normalizedKey);

    // A guess is correct if it matches any part of any grapheme cluster (consonant or any individual mark)
    const correct = wordClusters.some(cluster => {
        const p = decomposeThai(cluster);
        if (p.consonant && p.consonant === normalizedKey) return true;
        if (p.left.some(m => m === normalizedKey)) return true;
        if (p.top.some(m => m === normalizedKey)) return true;
        if (p.right.some(m => m === normalizedKey)) return true;
        if (p.bottom.some(m => m === normalizedKey)) return true;
        return false;
    });

    if (correct) {
        // If every cluster is revealed (consonant + all individual marks), player wins
        if (wordClusters.every(cluster => isClusterRevealed(cluster))) {
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
