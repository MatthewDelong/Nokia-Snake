const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Set canvas size based on device
function setCanvasSize() {
    const maxSize = Math.min(window.innerWidth - 40, 400);
    canvas.width = maxSize;
    canvas.height = maxSize;
}

const gridSize = 20;
let tileCount;

let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let score = 0;
let gameRunning = true;

function initGame() {
    setCanvasSize();
    tileCount = canvas.width / gridSize;
    
    // Initialize snake
    snake = [
        { x: Math.floor(tileCount/2), y: Math.floor(tileCount/2) },
        { x: Math.floor(tileCount/2)-1, y: Math.floor(tileCount/2) },
        { x: Math.floor(tileCount/2)-2, y: Math.floor(tileCount/2) }
    ];
    
    createFood();
    
    // Reset game state
    direction = { x: 1, y: 0 };
    score = 0;
    gameRunning = true;
    
    // Update display
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    setTimeout(gameLoop, 150); // Slightly slower for mobile
}

function update() {
    // Move snake
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Wrap around walls
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        createFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f1123';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake with responsive size
    const cellSize = canvas.width / tileCount;
    ctx.fillStyle = '#83d46c';
    snake.forEach((segment, index) => {
        const size = cellSize - 2;
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, size, size);
    });
    
    // Draw food
    ctx.fillStyle = '#ff4444';
    const foodSize = cellSize - 2;
    ctx.fillRect(food.x * cellSize, food.y * cellSize, foodSize, foodSize);
}

function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function changeDirection(newDirection) {
    if (!gameRunning) return;
    
    const directions = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };
    
    const dir = directions[newDirection];
    // Prevent 180-degree turns
    if (dir.x !== -direction.x && dir.y !== -direction.y) {
        direction = dir;
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp': changeDirection('up'); break;
        case 'ArrowDown': changeDirection('down'); break;
        case 'ArrowLeft': changeDirection('left'); break;
        case 'ArrowRight': changeDirection('right'); break;
    }
});

// Touch controls for buttons
document.getElementById('upBtn').addEventListener('click', () => changeDirection('up'));
document.getElementById('downBtn').addEventListener('click', () => changeDirection('down'));
document.getElementById('leftBtn').addEventListener('click', () => changeDirection('left'));
document.getElementById('rightBtn').addEventListener('click', () => changeDirection('right'));

// Swipe controls for touch screens
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
            changeDirection('left');
        } else {
            changeDirection('right');
        }
    } else {
        // Vertical swipe
        if (diffY > 0) {
            changeDirection('up');
        } else {
            changeDirection('down');
        }
    }
    
    touchStartX = null;
    touchStartY = null;
    e.preventDefault();
});

// Restart button
restartBtn.addEventListener('click', () => {
    initGame();
    gameLoop();
});

// Handle window resize
window.addEventListener('resize', initGame);

// Start the game
initGame();
gameLoop();