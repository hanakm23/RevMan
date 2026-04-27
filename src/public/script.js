const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 24;
const ROWS = 21;
const COLS = 21;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// ================= MENU / GAME STATE =================
let gameStarted = false;
let countdown = 0;

const menu = document.getElementById("menu");
const countdownEl = document.getElementById("countdown");

// ================= MAP =================
// 0 empty, 1 wall, 2 pellet, 3 power pellet
const map = [
  /* KEEP YOUR MAP EXACTLY AS IS */
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,2,1],
  [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1,1],
  [0,0,0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,0,0,1,1,2,1,2,1,1,1,1,1],
  [0,0,0,0,2,2,2,1,0,0,0,0,1,2,2,2,0,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1],
  [0,0,0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,2,1],
  [1,3,2,1,2,1,2,2,2,1,1,2,2,2,1,2,1,2,2,3,1],
  [1,1,2,1,2,1,1,1,2,1,1,2,1,1,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// ================= PLAYERS =================
const players = [
  { active: true, nextDir: { x: 0, y: 0 } },
  { active: false, nextDir: { x: 0, y: 0 } },
  { active: false, nextDir: { x: 0, y: 0 } },
  { active: false, nextDir: { x: 0, y: 0 } },
];

// ================= GHOSTS =================
const ghosts = [
  { x: 10, y: 9, color: "red", type: "blinky", dir: { x: -1, y: 0 }, state: "normal", playerIndex: 0 },
  { x: 9, y: 9, color: "pink", type: "pinky", dir: { x: 1, y: 0 }, state: "normal", playerIndex: 1 },
  { x: 10, y: 10, color: "cyan", type: "inky", dir: { x: 0, y: -1 }, state: "normal", playerIndex: 2 },
  { x: 9, y: 10, color: "orange", type: "clyde", dir: { x: 0, y: 1 }, state: "normal", playerIndex: 3 },
];

// ================= GAME STATE =================
let score = 0;
let gameOver = false;

let mode = "scatter";
let lastMode = mode;
let modeTimer = 0;

let frightened = false;
let frightenedTimer = 0;

let frame = 0;

// ================= INPUT =================
const keyBindings = [
  { arrowup:{x:0,y:-1}, arrowdown:{x:0,y:1}, arrowleft:{x:-1,y:0}, arrowright:{x:1,y:0} },
  { w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0} },
  { i:{x:0,y:-1}, k:{x:0,y:1}, j:{x:-1,y:0}, l:{x:1,y:0} },
  { 5:{x:0,y:-1}, 2:{x:0,y:1}, 4:{x:-1,y:0}, 6:{x:1,y:0} },
];

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  keyBindings.forEach((keys, i) => {
    if (key in keys && players[i].active) {
      players[i].nextDir = keys[key];
    }
  });
});

// ================= MENU =================
document.querySelectorAll(".menu button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const count = parseInt(btn.dataset.players);

    players.forEach((p, i) => {
      p.active = i < count;
    });

    startCountdown();
  });
});

function startCountdown() {
  countdown = 3;
  countdownEl.textContent = countdown;

  const interval = setInterval(() => {
    countdown--;

    if (countdown > 0) countdownEl.textContent = countdown;
    else countdownEl.textContent = "GO!";

    if (countdown < 0) {
      clearInterval(interval);
      menu.style.display = "none";
      gameStarted = true;
    }
  }, 1000);
}

// ================= HELPERS =================
const canMove = (x, y) => map[y] && map[y][x] !== 1;
const neighbors = (x, y) => [
  { x:x+1,y }, { x:x-1,y }, { x,y:y+1 }, { x,y:y-1 }
].filter(n => canMove(n.x,n.y));

// ================= AI =================
function getNextMove(g) {
  const moves = neighbors(g.x, g.y);

  if (frightened && g.state !== "dead") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const target = ghosts[0];
  return moves.reduce((best, m) => {
    const d = Math.hypot(target.x - m.x, target.y - m.y);
    return d < best.dist ? { move: m, dist: d } : best;
  }, { move: moves[0], dist: Infinity }).move;
}

// ================= GAME =================
function updateGhosts() {
  if (frame % 2 !== 0) return;

  ghosts.forEach((g) => {
    if (players[g.playerIndex].active) {
      const next = players[g.playerIndex].nextDir;
      if (canMove(g.x + next.x, g.y + next.y)) {
        g.dir = next;
        players[g.playerIndex].nextDir = { x:0,y:0 };
      }
    } else {
      const next = getNextMove(g);
      g.dir = { x: next.x - g.x, y: next.y - g.y };
    }

    g.x += g.dir.x;
    g.y += g.dir.y;
  });
}

function updatePellets() {
  ghosts.forEach((g) => {
    if (map[g.y][g.x] === 2) {
      map[g.y][g.x] = 0;
      score += 10;
    }
    if (map[g.y][g.x] === 3) {
      map[g.y][g.x] = 0;
      score += 50;
      frightened = true;
      frightenedTimer = 0;
    }
  });
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y=0;y<ROWS;y++){
    for (let x=0;x<COLS;x++){
      if(map[y][x]===1){
        ctx.fillStyle="blue";
        ctx.fillRect(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE);
      }
    }
  }

  ghosts.forEach(g=>{
    ctx.fillStyle = frightened ? "blue" : g.color;
    ctx.beginPath();
    ctx.arc(
      g.x*TILE_SIZE+TILE_SIZE/2,
      g.y*TILE_SIZE+TILE_SIZE/2,
      TILE_SIZE/2-2,0,Math.PI*2
    );
    ctx.fill();
  });

  ctx.fillStyle="white";
  ctx.fillText(`Score: ${score}`,10,20);
}

// ================= LOOP =================
function loop() {
  frame++;

  if (gameStarted && !gameOver) {
    updateGhosts();
    updatePellets();
  }

  draw();
  requestAnimationFrame(loop);
}

loop();