/* script.js */
const TILES_FACES = [ // Manzu (0-8), Pinzu (9-17), Souzu (18-26), Jiha (27-33)
    '🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏',
    '🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡',
    '🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘',
    '🀀','🀁','🀂','🀃','🀆','🀅','🀄'
];

let deck = [];
let hand = [];
let discards = [];
let drawnTile = null;
let gameOver = false;

const UI = {
    tilesLeft: document.getElementById('tiles-left'),
    agariBtn: document.getElementById('agari-btn'),
    restartBtn: document.getElementById('restart-btn'),
    messageModal: document.getElementById('message-modal'),
    messageTitle: document.getElementById('message-title'),
    deck: document.getElementById('deck'),
    discards: document.getElementById('discards'),
    hand: document.getElementById('hand'),
    drawn: document.getElementById('drawn-tile-container')
};

function getTileColor(id) {
    if (id >= 27) return (id === 31 || id === 32) ? 'green' : (id === 33) ? 'red' : '';
    if (id < 9) return 'red';
    if (id >= 18 && id < 27) return 'green';
    return 'blue';
}

function createTileElement(id, clickHandler) {
    const el = document.createElement('div');
    el.className = `tile ${getTileColor(id)}`;
    el.textContent = TILES_FACES[id];
    el.dataset.id = id;
    if (clickHandler) el.addEventListener('click', () => clickHandler(id, el));
    return el;
}

function initGame() {
    deck = [];
    for (let i = 0; i < 34; i++) {
        for (let j = 0; j < 4; j++) deck.push(i);
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    hand = [];
    discards = [];
    drawnTile = null;
    gameOver = false;
    
    UI.messageModal.classList.add('hidden');
    UI.agariBtn.classList.add('hidden');
    UI.deck.classList.remove('disabled');

    // Draw initial 13 tiles
    for (let i = 0; i < 13; i++) {
        hand.push(deck.pop());
    }
    
    hand.sort((a, b) => a - b);
    render();
}

function drawTile() {
    if (gameOver || drawnTile !== null || deck.length === 0) return;
    drawnTile = deck.pop();
    
    const allTiles = [...hand, drawnTile];
    if (checkWin(allTiles)) {
        // Tsumo pops up
        UI.agariBtn.classList.remove('hidden');
    }
    
    render();
}

function discardTile(index, isDrawn) {
    if (gameOver || drawnTile === null) return;
    
    // Hide Agari button if they skipped it
    UI.agariBtn.classList.add('hidden');
    
    let discardedId;
    if (isDrawn) {
        discardedId = drawnTile;
    } else {
        discardedId = hand[index];
        hand.splice(index, 1);
        hand.push(drawnTile);
        hand.sort((a, b) => a - b);
    }
    
    drawnTile = null;
    discards.push(discardedId);
    
    if (deck.length === 0) {
        gameOver = true;
        UI.messageTitle.textContent = '流局 (山牌なし)';
        UI.messageTitle.style.color = '#bdc3c7';
        UI.messageModal.classList.remove('hidden');
    }
    
    render();
}

function render() {
    UI.tilesLeft.textContent = deck.length;
    
    UI.hand.innerHTML = '';
    hand.forEach((id, index) => {
        UI.hand.appendChild(createTileElement(id, () => discardTile(index, false)));
    });
    
    UI.drawn.innerHTML = '';
    if (drawnTile !== null) {
        UI.drawn.appendChild(createTileElement(drawnTile, () => discardTile(-1, true)));
        UI.deck.classList.add('disabled');
    } else {
        if (!gameOver && deck.length > 0) UI.deck.classList.remove('disabled');
        else UI.deck.classList.add('disabled');
    }
    
    UI.discards.innerHTML = '';
    discards.forEach(id => {
        UI.discards.appendChild(createTileElement(id, null));
    });
}

// ====== Agari Logic ======
function checkNormalAgari(counts, startIndex, neededMentsu) {
    if (neededMentsu === 0) return true;
    let i = startIndex;
    while (i < 34 && counts[i] === 0) i++;
    if (i === 34) return false;

    if (counts[i] >= 3) {
        counts[i] -= 3;
        if (checkNormalAgari(counts, i, neededMentsu - 1)) { counts[i] += 3; return true; }
        counts[i] += 3;
    }

    if (i < 27 && i % 9 <= 6) {
        if (counts[i] > 0 && counts[i+1] > 0 && counts[i+2] > 0) {
            counts[i]--; counts[i+1]--; counts[i+2]--;
            if (checkNormalAgari(counts, i, neededMentsu - 1)) { counts[i]++; counts[i+1]++; counts[i+2]++; return true; }
            counts[i]++; counts[i+1]++; counts[i+2]++;
        }
    }
    return false;
}

function checkWin(tilesArray) {
    if (tilesArray.length !== 14) return false;
    let counts = new Array(34).fill(0);
    tilesArray.forEach(t => counts[t]++);
    
    // Seven pairs
    let pairs = 0;
    for (let c of counts) { if (c === 2) pairs++; else if (c !== 0) { pairs = -1; break; } }
    if (pairs === 7) return true;
    
    // Kokushi
    const yaochu = [0,8, 9,17, 18,26, 27,28,29,30,31,32,33];
    let hasPair = false;
    let isKokushi = true;
    for (let pos of yaochu) {
        if (counts[pos] === 0) { isKokushi = false; break; }
        if (counts[pos] === 2) { if (hasPair) { isKokushi = false; break; } hasPair = true; } 
        else if (counts[pos] > 2) { isKokushi = false; break; }
    }
    if (isKokushi && hasPair) return true;
    
    // Normal hand
    for (let i = 0; i < 34; i++) {
        if (counts[i] >= 2) {
            counts[i] -= 2;
            if (checkNormalAgari(counts, 0, 4)) return true;
            counts[i] += 2;
        }
    }
    return false;
}

UI.deck.addEventListener('click', drawTile);

UI.agariBtn.addEventListener('click', () => {
    if (gameOver || drawnTile === null) return;
    UI.agariBtn.classList.add('hidden');
    UI.messageTitle.textContent = 'ツモ！和了！🎉';
    UI.messageTitle.style.color = '#f1c40f';
    UI.messageModal.classList.remove('hidden');
    gameOver = true;
    UI.deck.classList.add('disabled');
});

UI.restartBtn.addEventListener('click', initGame);

initGame();
