function initTetris() {
  // --- Canvas Setup ---
  const canvas = document.getElementById("game");
  if (!canvas) return; // exit if this page has no Tetris canvas

  const ctx = canvas.getContext("2d");

  // --- Config ---
  let CELL = 40; // px per square - responsive on mobile
  let COLS, ROWS; // global within this function

  function getGridSize() {
    // Use document.documentElement for more reliable mobile dimensions
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    if (vw >= 1170) {
      CELL = 30; // Large for desktop
      COLS = 35;
      ROWS = Math.floor((vh - 280) / CELL);
    } else if (vw >= 481) {
      CELL = 22; // Bit smaller for tablets
      COLS = Math.floor((vw - 130) / CELL);
      ROWS = Math.floor((vh - 360) / CELL);
    } else {
      // Mobile: calculate cell size to fit screen
      const availableWidth = vw - 30;
      const availableHeight = vh - 340;

      // Target grid size (minimum playable)
      const targetCols = 10;
      const targetRows = 20;

      // Calculate cell size that fits both dimensions
      const cellFromWidth = Math.floor(availableWidth / targetCols);
      const cellFromHeight = Math.floor(availableHeight / targetRows);

      // Use width-based cell size, but cap it if too big
      CELL = Math.min(cellFromWidth, 15); // Max 35px on mobile

      // Now calculate actual grid size
      COLS = Math.floor(availableWidth / CELL);
      ROWS = Math.floor(availableHeight / CELL);
    }

    // Ensure minimum playable size
    COLS = Math.max(COLS, 10);
    ROWS = Math.max(ROWS, 15);
  }

  function resizeTetris() {
    getGridSize();

    if (COLS < 5 || ROWS < 10) return; // don't render if grid too small

    const width = CELL * COLS;
    const height = CELL * ROWS;

    // Crisp HiDPI
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeTetris();
  window.addEventListener("resize", () => {
    resizeTetris();
  });

  const TICK_BASE_MS = 800; // base gravity (level 1)

  // --- Tetromino setup ---
  const COLORS = {
    H: "#ff6b35",
    I: "#c8cdd4",
    J: "#4ecdc4",
    L: "#7c7f93",
    O: "#2a2d3a",
    S: "#fead90ff",
    T: "#84cec9ff",
    Z: "#0f0f23",
    G: "#f0f2f5", // grid fill
  };

  // Tetromino shapes: matrices of 1s
  const SHAPES = {
    H: [
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1],
    ],
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  };

  // HUD
  const scoreEl = document.getElementById("score");
  const linesEl = document.getElementById("lines");
  const levelEl = document.getElementById("level");
  const pauseBtn = document.getElementById("pauseBtn");

  // --- Game State ---
  const emptyRow = () => Array(COLS).fill(null);
  let board = Array.from({ length: ROWS }, emptyRow);

  let current = null; // active piece
  let queue = []; // next pieces (7-bag)

  let score = 0;
  let lines = 0;
  let level = 1;
  let paused = false;
  let over = false;

  let lastDrop = performance.now();
  let dropInterval = TICK_BASE_MS;

  function setLevelFromLines() {
    // level increases every 10 lines
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      level = newLevel;
      dropInterval = Math.max(90, TICK_BASE_MS * Math.pow(0.85, level - 1));
      levelEl.textContent = level;
    }
  }

  // --- Utilities ---
  function cloneMatrix(m) {
    return m.map((row) => row.slice());
  }

  function rotateMatrixCW(m) {
    const rows = m.length,
      cols = m[0].length;
    const res = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) res[c][rows - 1 - r] = m[r][c];
    return res;
  }

  function getRandomBag() {
    const bag = ["H", "I", "J", "L", "O", "S", "T", "Z"];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  function spawnPiece() {
    if (queue.length < 3) queue.push(...getRandomBag());
    const type = queue.shift();
    const matrix = cloneMatrix(SHAPES[type]);
    // spawn centered horizontally
    const w = matrix[0].length;
    const x = Math.floor((COLS - w) / 2);
    const y = -getTopOffset(matrix); // spawn slightly above top if needed
    current = { type, matrix, x, y };
    if (collides(board, current)) {
      over = true;
    }
  }

  function getTopOffset(matrix) {
    for (let r = 0; r < matrix.length; r++)
      if (matrix[r].some((v) => v)) return r;
    return 0;
  }

  function collides(grid, piece) {
    const { matrix, x: px, y: py } = piece;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (!matrix[y][x]) continue;
        const gx = px + x;
        const gy = py + y;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
        if (gy >= 0 && grid[gy][gx]) return true;
      }
    }
    return false;
  }

  function merge(grid, piece) {
    const { matrix, x: px, y: py, type } = piece;
    for (let y = 0; y < matrix.length; y++)
      for (let x = 0; x < matrix[y].length; x++)
        if (matrix[y][x]) {
          const gy = py + y,
            gx = px + x;
          if (gy >= 0) grid[gy][gx] = type;
        }
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(emptyRow());
        cleared++;
        y++; // stay on same y after unshift
      }
    }
    if (cleared) {
      const scores = [0, 40, 100, 300, 1200]; // classic-ish single/double/triple/tetris
      score += scores[cleared] * level;
      lines += cleared;
      scoreEl.textContent = score;
      linesEl.textContent = lines;
      setLevelFromLines();
    }
  }

  function tryMove(dx, dy) {
    if (!current || over) return false;
    const test = { ...current, x: current.x + dx, y: current.y + dy };
    if (!collides(board, test)) {
      current = test;
      return true;
    }
    return false;
  }

  function hardDrop() {
    if (over) return;
    let dropped = 0;
    while (tryMove(0, 1)) dropped++;
    lockPiece();
    // small score for hard drop distance
    score += dropped * 2;
    scoreEl.textContent = score;
  }

  function rotateCW() {
    if (!current || over) return;
    const rotated = rotateMatrixCW(current.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      const test = { ...current, matrix: rotated, x: current.x + k };
      if (!collides(board, test)) {
        current = test;
        return true;
      }
    }
    return false;
  }

  function lockPiece() {
    merge(board, current);
    clearLines();
    spawnPiece();
  }

  function drawCell(x, y, type) {
    const px = x * CELL;
    const py = y * CELL;
    const color = COLORS[type] || COLORS.G;
    // cell fill
    ctx.fillStyle = color;
    ctx.fillRect(px, py, CELL, CELL);
    // bevel effect
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#fff";
    ctx.fillRect(px, py, CELL, 4);
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#000";
    ctx.fillRect(px, py + CELL - 4, CELL, 4);
    ctx.globalAlpha = 1;
    // inner grid line
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);
  }

  function drawGridBackground() {
    ctx.fillStyle = "#f0f2f5";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    // subtle grid
    ctx.strokeStyle = "#c8cdd4";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(COLS * CELL, y * CELL + 0.5);
      ctx.stroke();
    }
  }

  function drawBoard() {
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        if (board[y][x]) drawCell(x, y, board[y][x]);
  }

  function drawPiece() {
    if (!current) return;
    const { matrix, x: px, y: py, type } = current;
    for (let y = 0; y < matrix.length; y++)
      for (let x = 0; x < matrix[y].length; x++)
        if (matrix[y][x]) {
          const gy = py + y;
          const gx = px + x;
          if (gy >= 0) drawCell(gx, gy, type);
        }
  }

  function drawGhost() {
    if (!current) return;
    // find drop distance
    let test = { ...current };
    while (!collides(board, { ...test, y: test.y + 1 })) test.y++;
    // draw outline
    const { matrix, x: px, y: py } = test;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#000";
    for (let y = 0; y < matrix.length; y++)
      for (let x = 0; x < matrix[y].length; x++)
        if (matrix[y][x]) {
          const gx = px + x,
            gy = py + y;
          if (gy >= 0) ctx.fillRect(gx * CELL, gy * CELL, CELL, CELL);
        }
    ctx.globalAlpha = 1;
  }

  function update(time) {
    if (paused || over) return;
    if (time - lastDrop >= dropInterval) {
      if (!tryMove(0, 1)) {
        lockPiece();
      }
      lastDrop = time;
    }
  }

  function render() {
    drawGridBackground();
    drawBoard();
    drawGhost();
    drawPiece();
    if (over) drawGameOver();
  }

  function drawGameOver() {
    ctx.fillStyle = "rgba(225,225,225,0.6)";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    ctx.fillStyle = "#2a2d3a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 48px ivystyle-tw, monospace";
    ctx.fillText("GAME OVER", (COLS * CELL) / 2, (ROWS * CELL) / 2 - 20);
    ctx.font = "24px ivystyle-sans, sans-serif";
    ctx.fillText(
      "Press Enter to restart",
      (COLS * CELL) / 2,
      (ROWS * CELL) / 2 + 24
    );
  }

  function loop(now) {
    update(now);
    render();
    requestAnimationFrame(loop);
  }

  // --- Input ---
  window.addEventListener("keydown", (e) => {
    if (over && e.key === "Enter") {
      restart();
      return;
    }
    if (e.key === "p" || e.key === "P") {
      paused = !paused;
      pauseBtn.textContent = paused ? "▶ Resume" : "⏯︎ Pause";
      return;
    }
    if (paused || over) return; // no movement while paused or over
    switch (e.key) {
      case "ArrowLeft":
        tryMove(-1, 0);
        break;
      case "ArrowRight":
        tryMove(1, 0);
        break;
      case "ArrowDown":
        if (tryMove(0, 1)) {
          score += 1;
          scoreEl.textContent = score;
        }
        break;
      case "ArrowUp":
        rotateCW();
        break;
      case " ":
        e.preventDefault();
        hardDrop();
        break;
    }
  });

  function restart() {
    board = Array.from({ length: ROWS }, emptyRow);
    queue = [];
    score = 0;
    lines = 0;
    level = 1;
    paused = false;
    over = false;
    scoreEl.textContent = "0";
    linesEl.textContent = "0";
    levelEl.textContent = "1";
    dropInterval = TICK_BASE_MS;
    lastDrop = performance.now();
    spawnPiece();
  }

  // ================== MOBILE CONTROLS ==================
  function setupMobileControls() {
    const controls = document.getElementById("mobile-controls");
    if (!controls) return;

    controls.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleAction(btn.dataset.action);
      });
    });
  }

  function handleAction(action) {
    switch (action) {
      case "left":
        tryMove(-1, 0);
        break;
      case "right":
        tryMove(1, 0);
        break;
      case "rotate":
        rotateCW();
        break;
      case "drop": // matches your HTML button
        hardDrop();
        break;
      case "pause":
        paused = !paused;
        pauseBtn.textContent = paused ? "▶ Resume" : "⏯︎ Pause";
        break;
    }
  }

  setupMobileControls();

  // --- Init ---
  spawnPiece();
  requestAnimationFrame(loop);

  // Expose globals if needed
  window.TETRIS_CELL = CELL;
  window.TETRIS_COLS = COLS;
  window.TETRIS_ROWS = ROWS;

  pauseBtn.addEventListener("click", () => {
    if (over) return;
    paused = !paused;
    pauseBtn.textContent = paused ? "▶ Resume" : "⏯︎ Pause";
  });
}

// Expose globally so menu.js can call it
window.initTetris = initTetris;
