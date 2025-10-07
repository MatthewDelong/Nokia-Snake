const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let score = 0;
let gameRunning = true;

function initGame() {
    // Initialize snake
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // Create first food
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Reset game state
    direction = { x: 1, y: 0 };
    score = 0;
    gameRunning = true;
    
    // Update display
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    setTimeout(gameLoop, 100);
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
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f1123';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#83d46c';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Draw food
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// Controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp': 
            if (direction.y !== 1) direction = { x: 0, y: -1 }; 
            break;
        case 'ArrowDown': 
            if (direction.y !== -1) direction = { x: 0, y: 1 }; 
            break;
        case 'ArrowLeft': 
            if (direction.x !== 1) direction = { x: -1, y: 0 }; 
            break;
        case 'ArrowRight': 
            if (direction.x !== -1) direction = { x: 1, y: 0 }; 
            break;
    }
});

// Restart button
restartBtn.addEventListener('click', () => {
    initGame();
    gameLoop();
});

// Start the game
initGame();
gameLoop();