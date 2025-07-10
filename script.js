const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const maxScoreHome = document.getElementById("maxScoreHome");
const minScoreHome = document.getElementById("minScoreHome");
const modeSelector = document.getElementById("modeSelector");
const difficultySelect = document.getElementById("difficulty");
const scorePanel = document.getElementById("scorePanel");
const controls = document.getElementById("controls");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const startSound = document.getElementById("startSound");

let isMuted = false;

function playSound(sound) {
  if (!isMuted) sound.play();
}

soundToggleBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  soundToggleBtn.textContent = isMuted ? "🔇 Sound Off" : "🔊 Sound On";
});

const box = 20;
const canvasSize = 400;
let snake = [];
let food;
let direction;
let score;
let highScore = localStorage.getItem("highScore") || 0;
let leastScore = localStorage.getItem("leastScore") || null;
let gameLoop;
let speed = 100;

function updateHomeScores() {
  maxScoreHome.textContent = highScore;
  minScoreHome.textContent = leastScore !== null ? leastScore : "-";
}

updateHomeScores();
highScoreDisplay.textContent = highScore;

function startGame() {
  const mode = difficultySelect.value;
  speed = mode === "easy" ? 150 : mode === "hard" ? 70 : 100;

  score = 0;
  direction = null;
  snake = [{ x: 9 * box, y: 10 * box }];
  food = generateFood();
  scoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;

  clearInterval(gameLoop);
  gameLoop = setInterval(draw, speed);

  canvas.style.display = "block";
  scorePanel.style.display = "flex";
  controls.style.display = "block";
  modeSelector.style.display = "none";

  playSound(startSound);
}

function generateFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };
}

function draw() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  snake.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? "#00ff99" : "#00cc77";
    ctx.fillRect(part.x, part.y, box, box);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(part.x, part.y, box, box);
  });

  // Highlight food with glowing pulse
  ctx.fillStyle = "#ff0044";
  ctx.shadowColor = "#ff0044";
  ctx.shadowBlur = 20;
  ctx.fillRect(food.x, food.y, box, box);
  ctx.shadowBlur = 0;

  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  // Wall wrapping logic
  if (head.x < 0) head.x = canvasSize - box;
  if (head.x >= canvasSize) head.x = 0;
  if (head.y < 0) head.y = canvasSize - box;
  if (head.y >= canvasSize) head.y = 0;

  if (snake.some((segment, i) => i !== 0 && segment.x === head.x && segment.y === head.y)) {
    clearInterval(gameLoop);
    playSound(gameOverSound);
    alert("💀 Game Over!");

    if (leastScore === null || score < leastScore) {
      leastScore = score;
      localStorage.setItem("leastScore", leastScore);
    }
    updateHomeScores();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    playSound(eatSound);
    score++;
    scoreDisplay.textContent = score;
    food = generateFood();

    if (score % 5 === 0 && speed > 40) {
      clearInterval(gameLoop);
      speed -= 5;
      gameLoop = setInterval(draw, speed);
    }

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreDisplay.textContent = highScore;
    }
  } else {
    snake.pop();
  }
}

document.addEventListener("keydown", (e) => {
  if ((e.key === "ArrowUp" || e.key === "w") && direction !== "DOWN") direction = "UP";
  if ((e.key === "ArrowDown" || e.key === "s") && direction !== "UP") direction = "DOWN";
  if ((e.key === "ArrowLeft" || e.key === "a") && direction !== "RIGHT") direction = "LEFT";
  if ((e.key === "ArrowRight" || e.key === "d") && direction !== "LEFT") direction = "RIGHT";
});

restartBtn.addEventListener("click", startGame);

homeBtn.addEventListener("click", () => {
  clearInterval(gameLoop);
  canvas.style.display = "none";
  scorePanel.style.display = "none";
  controls.style.display = "none";
  modeSelector.style.display = "block";
  updateHomeScores();
});
