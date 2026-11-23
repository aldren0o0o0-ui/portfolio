/**
 * Self-contained 60fps HTML5 Canvas game: "Neon Block Surge"
 * Combines falling-block line clearing with 2048-style number merging & Bomb power-ups.
 * Works on both Mobile (on-screen touch buttons + swipe) and Browser (Arrow keys / WASD / Space).
 */
export function buildNeonBlockSurgeHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Neon Block Surge</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0b0a18; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const COLS = 7;
    const ROWS = 11;
    const VAL_COLORS = {
      2: '#38bdf8',
      4: '#34d399',
      8: '#a78bfa',
      16: '#f472b6',
      32: '#fb923c',
      64: '#facc15',
      128: '#22d3ee',
      256: '#c084fc',
      512: '#fb7185',
      1024: '#fde047',
      2048: '#ffffff',
      BOMB: '#ef4444'
    };

    let audioCtx = null, muted = false;
    function unlockAudio() {
      if (muted) return;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    }
    function tone(f1, f2, dur, type = 'triangle', vol = 0.08) {
      if (muted || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type; o.frequency.setValueAtTime(f1, now);
        o.frequency.exponentialRampToValueAtTime(Math.max(40, f2), now + dur);
        g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
        o.connect(g); g.connect(audioCtx.destination); o.start(now); o.stop(now + dur);
      } catch {}
    }

    let W = 400, H = 700, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth || 400;
      H = window.innerHeight || 700;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    let best = 0;
    try { best = Number(localStorage.getItem('neon_block_best') || 0); } catch {}

    const state = {
      screen: 'title',
      grid: [],
      active: null,
      nextVal: 2,
      score: 0,
      level: 1,
      merges: 0,
      dropTimer: 0,
      particles: [],
      popups: []
    };

    function emptyGrid() {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    function randomTileVal() {
      const r = Math.random();
      if (r < 0.06) return 'BOMB';
      if (r < 0.45) return 2;
      if (r < 0.78) return 4;
      if (r < 0.94) return 8;
      return 16;
    }

    function spawnPiece() {
      const val = state.nextVal;
      state.nextVal = randomTileVal();
      const col = Math.floor(COLS / 2);
      if (state.grid[0][col] !== null) {
        state.screen = 'gameover';
        if (state.score > best) {
          best = state.score;
          try { localStorage.setItem('neon_block_best', String(best)); } catch {}
        }
        tone(220, 70, 0.35, 'sawtooth', 0.1);
        return;
      }
      state.active = { col, row: 0, val };
    }

    function startGame() {
      state.screen = 'playing';
      state.grid = emptyGrid();
      state.score = 0;
      state.level = 1;
      state.merges = 0;
      state.dropTimer = 0;
      state.particles = [];
      state.popups = [];
      state.nextVal = randomTileVal();
      spawnPiece();
      tone(320, 640, 0.15);
    }

    function burst(x, y, color, count = 12) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, s = 50 + Math.random() * 140;
        state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, color, r: 2.5 + Math.random() * 3 });
      }
    }

    function getBoardMetrics() {
      const topBar = 88;
      const bottomCtrl = 96;
      const maxH = H - topBar - bottomCtrl;
      const maxW = Math.min(W - 28, 420);
      const cell = Math.floor(Math.min(maxW / COLS, maxH / ROWS));
      const bw = cell * COLS;
      const bh = cell * ROWS;
      const bx = (W - bw) / 2;
      const by = topBar + (maxH - bh) / 2;
      return { bx, by, bw, bh, cell };
    }

    function moveActive(dc) {
      const a = state.active;
      if (!a) return;
      const nc = a.col + dc;
      if (nc >= 0 && nc < COLS && state.grid[a.row][nc] === null) {
        a.col = nc;
        tone(420, 480, 0.04, 'sine', 0.04);
      }
    }

    function hardDrop() {
      const a = state.active;
      if (!a) return;
      while (a.row + 1 < ROWS && state.grid[a.row + 1][a.col] === null) {
        a.row++;
      }
      lockActive();
    }

    function stepDown() {
      const a = state.active;
      if (!a) return;
      if (a.row + 1 < ROWS && state.grid[a.row + 1][a.col] === null) {
        a.row++;
      } else {
        lockActive();
      }
    }

    function applyGravity() {
      let moved = false;
      for (let c = 0; c < COLS; c++) {
        let writeR = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (state.grid[r][c] !== null) {
            if (r !== writeR) {
              state.grid[writeR][c] = state.grid[r][c];
              state.grid[r][c] = null;
              moved = true;
            }
            writeR--;
          }
        }
      }
      return moved;
    }

    function resolveBoard() {
      const { bx, by, cell } = getBoardMetrics();
      let changed = true;
      let chain = 0;
      while (changed) {
        changed = false;
        applyGravity();

        // Check merges (vertical & horizontal adjacent equal numbers)
        for (let r = ROWS - 1; r >= 0; r--) {
          for (let c = 0; c < COLS; c++) {
            const v = state.grid[r][c];
            if (typeof v !== 'number') continue;
            const dirs = [[1, 0], [0, 1], [0, -1]];
            for (const [dr, dc] of dirs) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && state.grid[nr][nc] === v) {
                const nv = v * 2;
                state.grid[r][c] = nv;
                state.grid[nr][nc] = null;
                chain++;
                state.merges++;
                const pts = nv * (1 + chain);
                state.score += pts;
                const cx = bx + c * cell + cell / 2;
                const cy = by + r * cell + cell / 2;
                burst(cx, cy, VAL_COLORS[nv] || '#ffffff', 14);
                state.popups.push({ x: cx, y: cy, text: nv + ' (+' + pts + ')', color: VAL_COLORS[nv] || '#fff', life: 0.85, max: 0.85 });
                tone(360 + chain * 90, 560 + chain * 110, 0.1, 'triangle', 0.08);
                changed = true;
                break;
              }
            }
          }
        }

        // Check full rows
        for (let r = ROWS - 1; r >= 0; r--) {
          if (state.grid[r].every((v) => v !== null)) {
            for (let c = 0; c < COLS; c++) {
              const cx = bx + c * cell + cell / 2;
              const cy = by + r * cell + cell / 2;
              burst(cx, cy, '#a78bfa', 8);
              state.grid[r][c] = null;
            }
            state.score += 180;
            state.popups.push({ x: bx + (COLS * cell) / 2, y: by + r * cell, text: 'LINE CLEAR +180', color: '#a78bfa', life: 1.0, max: 1.0 });
            tone(520, 880, 0.18, 'sine', 0.09);
            changed = true;
          }
        }
      }
      state.level = 1 + Math.floor(state.score / 500);
    }

    function lockActive() {
      const a = state.active;
      if (!a) return;
      const { bx, by, cell } = getBoardMetrics();
      if (a.val === 'BOMB') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = a.row + dr, nc = a.col + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && state.grid[nr][nc] !== null) {
              state.grid[nr][nc] = null;
              state.score += 30;
              burst(bx + nc * cell + cell / 2, by + nr * cell + cell / 2, '#ef4444', 10);
            }
          }
        }
        burst(bx + a.col * cell + cell / 2, by + a.row * cell + cell / 2, '#fca5a5', 18);
        tone(180, 60, 0.22, 'sawtooth', 0.1);
      } else {
        state.grid[a.row][a.col] = a.val;
        tone(220, 180, 0.05, 'sine', 0.05);
      }
      state.active = null;
      resolveBoard();
      spawnPiece();
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      unlockAudio();
      if (state.screen !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') startGame();
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveActive(-1);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') moveActive(1);
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') stepDown();
      else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); hardDrop(); }
    });

    // Touch / Mouse buttons
    let touchStartX = 0, touchStartY = 0;
    function getButtons() {
      const y = H - 52;
      const bw = Math.min(92, (W - 48) / 3);
      return {
        left: { x: W / 2 - bw * 1.5 - 10, y: y - 24, w: bw, h: 48, label: '◀' },
        drop: { x: W / 2 - bw / 2, y: y - 24, w: bw, h: 48, label: 'DROP' },
        right: { x: W / 2 + bw * 0.5 + 10, y: y - 24, w: bw, h: 48, label: '▶' },
        exit: { x: W - 92, y: 18, w: 34, h: 34, label: '✕' },
        mute: { x: W - 50, y: 18, w: 34, h: 34, label: muted ? '🔇' : '🔊' }
      };
    }
    function hit(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

    canvas.addEventListener('pointerdown', (e) => {
      unlockAudio();
      const px = e.clientX, py = e.clientY;
      const btns = getButtons();
      if (hit(px, py, btns.mute)) { muted = !muted; return; }
      if (hit(px, py, btns.exit)) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_GAME' }));
        else if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        return;
      }
      if (state.screen !== 'playing') { startGame(); return; }
      if (hit(px, py, btns.left)) { moveActive(-1); return; }
      if (hit(px, py, btns.right)) { moveActive(1); return; }
      if (hit(px, py, btns.drop)) { hardDrop(); return; }
      touchStartX = px; touchStartY = py;
    });

    canvas.addEventListener('pointerup', (e) => {
      if (state.screen !== 'playing') return;
      const dx = e.clientX - touchStartX, dy = e.clientY - touchStartY;
      if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) {
        moveActive(dx > 0 ? 1 : -1);
      } else if (dy > 38 && Math.abs(dy) > Math.abs(dx)) {
        hardDrop();
      }
    });

    function drawTile(x, y, size, val, alpha = 1) {
      const color = VAL_COLORS[val] || '#ffffff';
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = val === 'BOMB' ? '#450a0a' : '#16152b';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 10);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.font = 'bold ' + (val === 'BOMB' ? Math.floor(size * 0.42) : Math.floor(size * 0.36)) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val === 'BOMB' ? '💣' : String(val), x + size / 2, y + size / 2 + 1);
      ctx.restore();
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (state.screen === 'playing') {
        const interval = Math.max(0.24, 0.78 - (state.level - 1) * 0.055);
        state.dropTimer += dt;
        if (state.dropTimer >= interval) {
          state.dropTimer = 0;
          stepDown();
        }
      }
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
      for (let i = state.popups.length - 1; i >= 0; i--) {
        const pop = state.popups[i]; pop.y -= 30 * dt; pop.life -= dt;
        if (pop.life <= 0) state.popups.splice(i, 1);
      }

      // Render
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0f0c24'); grad.addColorStop(1, '#181030');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      const { bx, by, bw, bh, cell } = getBoardMetrics();
      ctx.fillStyle = 'rgba(13, 16, 33, 0.88)';
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(bx - 4, by - 4, bw + 8, bh + 8, 14); ctx.fill(); ctx.stroke();

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) { ctx.beginPath(); ctx.moveTo(bx + c * cell, by); ctx.lineTo(bx + c * cell, by + bh); ctx.stroke(); }
      for (let r = 1; r < ROWS; r++) { ctx.beginPath(); ctx.moveTo(bx, by + r * cell); ctx.lineTo(bx + bw, by + r * cell); ctx.stroke(); }

      if (state.screen === 'playing') {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (state.grid[r][c] !== null) drawTile(bx + c * cell, by + r * cell, cell, state.grid[r][c]);
          }
        }
        if (state.active) {
          // Ghost landing row
          let gr = state.active.row;
          while (gr + 1 < ROWS && state.grid[gr + 1][state.active.col] === null) gr++;
          if (gr !== state.active.row) {
            drawTile(bx + state.active.col * cell, by + gr * cell, cell, state.active.val, 0.24);
          }
          drawTile(bx + state.active.col * cell, by + state.active.row * cell, cell, state.active.val);
        }
      }

      for (const p of state.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const pop of state.popups) {
        ctx.globalAlpha = Math.max(0, pop.life / pop.max);
        ctx.fillStyle = pop.color; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(pop.text, pop.x, pop.y);
      }
      ctx.globalAlpha = 1;

      // Top HUD
      ctx.fillStyle = 'rgba(18, 20, 42, 0.85)';
      ctx.beginPath(); ctx.roundRect(14, 14, Math.min(260, W - 120), 60, 14); ctx.fill();
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('NEON BLOCK SURGE • LV ' + state.level, 26, 34);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif';
      ctx.fillText('SCORE ' + state.score + '   NEXT: ' + (state.nextVal === 'BOMB' ? '💣' : state.nextVal), 26, 58);

      const btns = getButtons();
      [btns.exit, btns.mute].forEach((b) => {
        ctx.fillStyle = 'rgba(18, 20, 42, 0.85)'; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      if (state.screen === 'playing') {
        [btns.left, btns.drop, btns.right].forEach((b) => {
          ctx.fillStyle = b === btns.drop ? 'rgba(124, 58, 237, 0.88)' : 'rgba(255, 255, 255, 0.1)';
          ctx.strokeStyle = b === btns.drop ? '#c4b5fd' : 'rgba(255,255,255,0.24)';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 14); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
        });
      } else {
        ctx.fillStyle = 'rgba(9, 10, 22, 0.72)'; ctx.fillRect(0, 0, W, H);
        const cw = Math.min(330, W - 40), ch = 220, cx = (W - cw) / 2, cy = (H - ch) / 2;
        ctx.fillStyle = 'rgba(20, 22, 44, 0.95)'; ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 20); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = state.screen === 'gameover' ? '#fb7185' : '#c4b5fd';
        ctx.font = 'bold 23px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'SURGE OVER' : 'NEON BLOCK SURGE', W / 2, cy + 50);
        ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? ('Score: ' + state.score + '  •  Best: ' + best) : 'Match numbers to merge • Fill rows to clear', W / 2, cy + 92);
        ctx.fillText('Tap buttons / Swipe or Arrow Keys + Space', W / 2, cy + 118);
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath(); ctx.roundRect(W / 2 - 86, cy + ch - 64, 172, 42, 14); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'PLAY AGAIN' : 'TAP TO PLAY', W / 2, cy + ch - 38);
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();
  </script>
</body>
</html>`;
}
