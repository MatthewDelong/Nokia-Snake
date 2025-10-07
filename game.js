const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

// Set canvas size based on device
function setCanvasSize() {
    const maxSize = Math.min(window.innerWidth - 40, 400);
    const adjustedSize = Math.floor(maxSize / gridSize) * gridSize;
    canvas.width = adjustedSize;
    canvas.height = adjustedSize;
}

const gridSize = 20;
let tileCount;

let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let score = 0;
let gameRunning = false; // Start as false - game doesn't auto-start
let highScore = 0;

// Load high score from localStorage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('nokiaSnakeHighScore');
    highScore = savedHighScore ? parseInt(savedHighScore) : 0;
    updateHighScoreDisplay();
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem('nokiaSnakeHighScore', highScore);
}

// Update high score display
function updateHighScoreDisplay() {
    const highScoreElement = document.getElementById('highScore');
    if (highScoreElement) {
        highScoreElement.textContent = highScore;
    }
}

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
    gameOverElement.classList.add('hidden');
    startScreen.classList.add('hidden');
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
    setTimeout(gameLoop, 150);
}

function update() {
    // Move snake
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Wall collision detection
    head.x = Math.floor(head.x);
    head.y = Math.floor(head.y);
    
    if (head.x < 0) head.x = Math.floor(tileCount) - 1;
    if (head.x >= Math.floor(tileCount)) head.x = 0;
    if (head.y < 0) head.y = Math.floor(tileCount) - 1;
    if (head.y >= Math.floor(tileCount)) head.y = 0;
    
    // Check self collision
    const hasCollision = snake.some(segment => 
        Math.floor(segment.x) === Math.floor(head.x) && 
        Math.floor(segment.y) === Math.floor(head.y)
    );
    
    if (hasCollision) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (Math.floor(head.x) === Math.floor(food.x) && Math.floor(head.y) === Math.floor(food.y)) {
        score += 10;
        scoreElement.textContent = score;
        createFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas with solid background
    ctx.fillStyle = '#0f1123';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    const cellSize = canvas.width / tileCount;
    ctx.fillStyle = '#83d46c';
    snake.forEach((segment) => {
        const size = Math.floor(cellSize) - 2;
        const x = Math.floor(segment.x * cellSize);
        const y = Math.floor(segment.y * cellSize);
        ctx.fillRect(x, y, size, size);
    });
    
    // Draw food
    ctx.fillStyle = '#ff4444';
    const foodSize = Math.floor(cellSize) - 2;
    const foodX = Math.floor(food.x * cellSize);
    const foodY = Math.floor(food.y * cellSize);
    ctx.fillRect(foodX, foodY, foodSize, foodSize);
}

function startGame() {
    initGame();
    gameLoop();
}

function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    
    // Check for new high score
    if (score > highScore) {
        highScore = score;
        saveHighScore();
        updateHighScoreDisplay();
    }
    
    gameOverElement.classList.remove('hidden');
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

// Start button
startBtn.addEventListener('click', startGame);

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
    if (!gameRunning) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    if (!gameRunning || !touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                changeDirection('left');
            } else {
                changeDirection('right');
            }
        } else {
            if (diffY > 0) {
                changeDirection('up');
            } else {
                changeDirection('down');
            }
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
    e.preventDefault();
});

// Restart button
restartBtn.addEventListener('click', startGame);

// Handle window resize
window.addEventListener('resize', () => {
    if (gameRunning) {
        setCanvasSize();
        tileCount = canvas.width / gridSize;
    }
});

// Load high score when game starts
loadHighScore();

// Initialize but don't start the game
setCanvasSize();
tileCount = canvas.width / gridSize;
snake = [
    { x: Math.floor(tileCount/2), y: Math.floor(tileCount/2) },
    { x: Math.floor(tileCount/2)-1, y: Math.floor(tileCount/2) },
    { x: Math.floor(tileCount/2)-2, y: Math.floor(tileCount/2) }
];
createFood();
draw(); // Draw initial state