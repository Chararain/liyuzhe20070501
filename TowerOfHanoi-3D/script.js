// =========================
// GAME STATE (ARRAYS + OBJECTS)
// =========================
const gameState = {
    disksCount: 5,
    pegs: [[5,4,3,2,1], [], []], // Stack structure: peg[0] = full, others empty
    moves: 0,
    isAutoSolving: false,
    selectedPeg: null,
    selectedDisk: null
};

// DOM ELEMENTS
const diskSlider = document.getElementById('diskSlider');
const diskCountDisplay = document.getElementById('diskCount');
const moveCountDisplay = document.getElementById('moveCount');
const resetBtn = document.getElementById('resetBtn');
const autoSolveBtn = document.getElementById('autoSolveBtn');
const pegs = document.querySelectorAll('.peg');
const warning = document.getElementById('warning');
const victory = document.getElementById('victory');

// =========================
// INIT & RENDER GAME
// =========================
initGame();

// Initialize game
function initGame() {
    setupEventListeners();
    resetBoard();
}

// Reset board with current disk count
function resetBoard() {
    gameState.moves = 0;
    gameState.selectedPeg = null;
    gameState.selectedDisk = null;
    gameState.isAutoSolving = false;
    
    // Create new peg array (ARRAY METHOD: fill + reverse)
    gameState.pegs = [
        Array.from({length: gameState.disksCount}, (_,i) => gameState.disksCount - i),
        [],
        []
    ];
    
    updateDisplays();
    renderDisks();
    hideMessages();
    enableButtons();
}

// Render disks to DOM (ARRAY METHOD: forEach)
function renderDisks() {
    pegs.forEach((pegEl, pegIndex) => {
        pegEl.innerHTML = '';
        const stack = gameState.pegs[pegIndex];
        
        // Create disk elements
        stack.forEach(diskSize => {
            const disk = document.createElement('div');
            disk.classList.add('disk', `disk-${diskSize}`);
            disk.dataset.size = diskSize;
            
            // Click to select disk
            disk.addEventListener('click', () => selectDisk(pegIndex));
            pegEl.appendChild(disk);
        });
    });
}

// =========================
// GAME LOGIC
// =========================
// Select top disk from a peg
function selectDisk(pegIndex) {
    if (gameState.isAutoSolving) return;
    const stack = gameState.pegs[pegIndex];
    if (stack.length === 0) return;
    
    // Deselect if already selected
    if (gameState.selectedPeg === pegIndex) {
        gameState.selectedPeg = null;
        gameState.selectedDisk = null;
        renderDisks();
        return;
    }
    
    // Select new disk
    gameState.selectedPeg = pegIndex;
    gameState.selectedDisk = stack[stack.length - 1];
    renderDisks();
}

// Move disk to target peg (ARRAY METHODS: pop, push)
function moveDisk(toPeg) {
    const fromPeg = gameState.selectedPeg;
    if (fromPeg === null || fromPeg === toPeg) return;
    
    const disk = gameState.selectedDisk;
    const targetStack = gameState.pegs[toPeg];
    
    // VALID MOVE CHECK
    if (targetStack.length > 0 && targetStack[targetStack.length - 1] < disk) {
        showWarning();
        return;
    }
    
    // EXECUTE VALID MOVE
    gameState.pegs[fromPeg].pop();
    gameState.pegs[toPeg].push(disk);
    gameState.moves++;
    
    // Reset selection
    gameState.selectedPeg = null;
    gameState.selectedDisk = null;
    
    updateDisplays();
    renderDisks();
    checkWin();
}

// Check if player won
function checkWin() {
    if (gameState.pegs[2].length === gameState.disksCount) {
        showVictory();
        disableButtons();
    }
}

// =========================
// AUTO SOLVE (RECURSIVE + DELAY)
// =========================
async function autoSolve() {
    if (gameState.isAutoSolving) return;
    
    gameState.isAutoSolving = true;
    disableButtons();
    hideMessages();
    
    const moves = [];
    // Recursive algorithm to get all steps
    generateHanoiMoves(gameState.disksCount, 0, 2, 1, moves);
    
    // Execute moves with delay
    for (const [from, to] of moves) {
        await sleep(700);
        gameState.selectedPeg = from;
        gameState.selectedDisk = gameState.pegs[from][gameState.pegs[from].length - 1];
        moveDisk(to);
    }
    
    gameState.isAutoSolving = false;
    enableButtons();
}

// Recursive Tower of Hanoi solver
function generateHanoiMoves(n, from, to, aux, moves) {
    if (n === 1) {
        moves.push([from, to]);
        return;
    }
    generateHanoiMoves(n-1, from, aux, to, moves);
    moves.push([from, to]);
    generateHanoiMoves(n-1, aux, to, from, moves);
}

// Sleep for animation delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================
// UI HELPERS
// =========================
function updateDisplays() {
    moveCountDisplay.textContent = gameState.moves;
}

function showWarning() {
    warning.classList.remove('hidden');
    setTimeout(() => warning.classList.add('hidden'), 2000);
}

function showVictory() {
    victory.classList.remove('hidden');
}

function hideMessages() {
    warning.classList.add('hidden');
    victory.classList.add('hidden');
}

function disableButtons() {
    resetBtn.disabled = true;
    autoSolveBtn.disabled = true;
    diskSlider.disabled = true;
}

function enableButtons() {
    resetBtn.disabled = false;
    autoSolveBtn.disabled = false;
    diskSlider.disabled = false;
}

// =========================
// EVENT LISTENERS
// =========================
function setupEventListeners() {
    // Disk count slider
    diskSlider.addEventListener('input', () => {
        gameState.disksCount = parseInt(diskSlider.value);
        diskCountDisplay.textContent = gameState.disksCount;
        resetBoard();
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetBoard);
    
    // Auto solve button
    autoSolveBtn.addEventListener('click', autoSolve);
    
    // Click peg to move disk
    pegs.forEach((pegEl, index) => {
        pegEl.addEventListener('click', () => {
            if (gameState.selectedDisk !== null) moveDisk(index);
        });
    });
}