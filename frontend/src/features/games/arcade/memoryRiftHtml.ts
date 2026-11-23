/**
 * Self-contained 60fps HTML5 Canvas game: "Memory Rift"
 * Pattern & focus trainer with escalating grid size, timed recall, and streak multipliers.
 * Works identically on Mobile (touch) and Browser (mouse/touch).
 */
export function buildMemoryRiftHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Memory Rift</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0c0a1d; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const TILE_COLORS = ['#a78bfa', '#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#fb7185'];

    let audioCtx = null, muted = false;
    function unlockAudio() {
      if (muted) return;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    }
    function tone(f1, f2, dur, type = 'sine', vol = 0.09) {
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
    try { best = Number(localStorage.getItem('memory_rift_best') || 0); } catch {}

    const state = {
      screen: 'title', // title | watch | input | roundClear | gameover
      round: 1,
      gridSize: 3,
      score: 0,
      lives: 3,
      sequence: [],
      showIdx: -1,
      showTimer: 0,
      litTile: -1,
      litColor: '#a78bfa',
      litTimer: 0,
      inputIdx: 0,
      timeLeft: 10,
      maxTime: 10,
      particles: []
    };

    function startRound() {
      state.gridSize = state.round >= 7 ? 5 : state.round >= 3 ? 4 : 3;
      const totalTiles = state.gridSize * state.gridSize;
      const seqLen = Math.min(12, 2 + state.round);
      state.sequence = [];
      for (let i = 0; i < seqLen; i++) {
        state.sequence.push(Math.floor(Math.random() * totalTiles));
      }
      state.screen = 'watch';
      state.showIdx = 0;
      state.showTimer = 0.45;
      state.litTile = -1;
      state.inputIdx = 0;
      state.maxTime = Math.max(6, 5 + seqLen * 1.15);
      state.timeLeft = state.maxTime;
    }

    function startGame() {
      state.round = 1;
      state.score = 0;
      state.lives = 3;
      state.particles = [];
      startRound();
    }

    function getGridRect() {
      const size = Math.min(W - 44, H - 230, 380);
      return { x: (W - size) / 2, y: (H - size) / 2 + 24, size };
    }

    function getTopBtns() {
      return {
        exit: { x: W - 92, y: 18, w: 34, h: 34, label: '✕' },
        mute: { x: W - 50, y: 18, w: 34, h: 34, label: muted ? '🔇' : '🔊' }
      };
    }
    function hit(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

    function burst(x, y, color) {
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 130;
        state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, color, r: 3 });
      }
    }

    canvas.addEventListener('pointerdown', (e) => {
      unlockAudio();
      const px = e.clientX, py = e.clientY;
      const btns = getTopBtns();
      if (hit(px, py, btns.mute)) { muted = !muted; return; }
      if (hit(px, py, btns.exit)) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_GAME' }));
        else if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        return;
      }

      if (state.screen === 'title' || state.screen === 'gameover') {
        startGame();
        return;
      }
      if (state.screen !== 'input') return;

      const g = getGridRect();
      if (px < g.x || px > g.x + g.size || py < g.y || py > g.y + g.size) return;
      const cell = g.size / state.gridSize;
      const col = Math.floor((px - g.x) / cell);
      const row = Math.floor((py - g.y) / cell);
      const idx = row * state.gridSize + col;

      const cx = g.x + col * cell + cell / 2;
      const cy = g.y + row * cell + cell / 2;

      if (idx === state.sequence[state.inputIdx]) {
        state.litTile = idx;
        state.litColor = '#34d399';
        state.litTimer = 0.22;
        tone(400 + state.inputIdx * 65, 520 + state.inputIdx * 65, 0.1);
        burst(cx, cy, '#34d399');
        state.inputIdx++;
        state.score += 25 * state.round;
        if (state.inputIdx >= state.sequence.length) {
          state.score += Math.round(state.timeLeft * 15);
          state.round++;
          state.screen = 'roundClear';
          state.showTimer = 0.75;
          tone(540, 880, 0.22, 'triangle', 0.1);
        }
      } else {
        state.litTile = idx;
        state.litColor = '#fb7185';
        state.litTimer = 0.32;
        burst(cx, cy, '#fb7185');
        tone(180, 90, 0.25, 'sawtooth', 0.1);
        state.lives--;
        if (state.lives <= 0) {
          state.screen = 'gameover';
          if (state.score > best) {
            best = state.score;
            try { localStorage.setItem('memory_rift_best', String(best)); } catch {}
          }
        } else {
          // Replay current sequence
          state.screen = 'watch';
          state.showIdx = 0;
          state.showTimer = 0.55;
          state.inputIdx = 0;
        }
      }
    });

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (state.litTimer > 0) {
        state.litTimer -= dt;
        if (state.litTimer <= 0) state.litTile = -1;
      }

      if (state.screen === 'watch') {
        state.showTimer -= dt;
        if (state.showTimer <= 0) {
          if (state.showIdx < state.sequence.length) {
            const tile = state.sequence[state.showIdx];
            state.litTile = tile;
            state.litColor = TILE_COLORS[state.showIdx % TILE_COLORS.length];
            const stepDur = Math.max(0.24, 0.54 - state.round * 0.03);
            state.litTimer = stepDur * 0.72;
            tone(320 + (tile % 6) * 65, 420 + (tile % 6) * 65, 0.12);
            state.showIdx++;
            state.showTimer = stepDur;
          } else {
            state.screen = 'input';
            state.litTile = -1;
          }
        }
      } else if (state.screen === 'input') {
        state.timeLeft -= dt;
        if (state.timeLeft <= 0) {
          state.lives--;
          tone(180, 90, 0.25, 'sawtooth', 0.1);
          if (state.lives <= 0) {
            state.screen = 'gameover';
            if (state.score > best) {
              best = state.score;
              try { localStorage.setItem('memory_rift_best', String(best)); } catch {}
            }
          } else {
            startRound();
          }
        }
      } else if (state.screen === 'roundClear') {
        state.showTimer -= dt;
        if (state.showTimer <= 0) startRound();
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0f0b24'); grad.addColorStop(1, '#1a1138');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      // Top HUD
      ctx.fillStyle = 'rgba(20, 22, 46, 0.84)';
      ctx.beginPath(); ctx.roundRect(14, 14, Math.min(260, W - 120), 62, 14); ctx.fill();
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('MEMORY RIFT • ROUND ' + state.round, 26, 35);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('SCORE ' + state.score + '   ' + '♥'.repeat(Math.max(0, state.lives)), 26, 58);

      const btns = getTopBtns();
      [btns.exit, btns.mute].forEach((b) => {
        ctx.fillStyle = 'rgba(20, 22, 46, 0.85)'; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      // Phase Banner + Timer Bar
      const g = getGridRect();
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = state.screen === 'watch' ? '#fbbf24' : state.screen === 'roundClear' ? '#34d399' : '#c4b5fd';
      ctx.font = 'bold 15px sans-serif';
      const label = state.screen === 'watch' ? 'WATCH PATTERN...' : state.screen === 'input' ? ('REPEAT (' + state.inputIdx + '/' + state.sequence.length + ')') : state.screen === 'roundClear' ? 'ROUND CLEAR!' : '';
      if (label) ctx.fillText(label, W / 2, g.y - 34);

      if (state.screen === 'input') {
        const pct = Math.max(0, state.timeLeft / state.maxTime);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.roundRect(g.x, g.y - 20, g.size, 8, 4); ctx.fill();
        ctx.fillStyle = pct > 0.3 ? '#8b5cf6' : '#fb7185';
        ctx.beginPath(); ctx.roundRect(g.x, g.y - 20, g.size * pct, 8, 4); ctx.fill();
      }

      // Grid
      const cell = g.size / state.gridSize;
      for (let r = 0; r < state.gridSize; r++) {
        for (let c = 0; c < state.gridSize; c++) {
          const idx = r * state.gridSize + c;
          const tx = g.x + c * cell + 5, ty = g.y + r * cell + 5, ts = cell - 10;
          const isLit = idx === state.litTile;
          ctx.save();
          if (isLit) {
            ctx.shadowColor = state.litColor;
            ctx.shadowBlur = 18;
            ctx.fillStyle = state.litColor;
            ctx.strokeStyle = '#ffffff';
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
          }
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(tx, ty, ts, ts, 14); ctx.fill(); ctx.stroke();
          ctx.restore();
        }
      }

      for (const p of state.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (state.screen === 'title' || state.screen === 'gameover') {
        ctx.fillStyle = 'rgba(9, 10, 22, 0.72)'; ctx.fillRect(0, 0, W, H);
        const cw = Math.min(330, W - 40), ch = 220, cx = (W - cw) / 2, cy = (H - ch) / 2;
        ctx.fillStyle = 'rgba(20, 22, 44, 0.95)'; ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 20); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = state.screen === 'gameover' ? '#fb7185' : '#c4b5fd';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'FOCUS BROKEN' : 'MEMORY RIFT', W / 2, cy + 50);
        ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? ('Score: ' + state.score + '  •  Best: ' + best) : 'Memorize & repeat glowing tile sequences', W / 2, cy + 92);
        ctx.fillText('Grid expands up to 5×5 as rounds progress', W / 2, cy + 118);
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
