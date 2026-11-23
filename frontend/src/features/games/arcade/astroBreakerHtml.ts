/**
 * Self-contained 60fps HTML5 Canvas game: "Astro Breaker"
 * Modern neon brick-breaker with armored bricks, explosive cores, multi-ball, wide-paddle & laser power-ups.
 * Works on both Mobile (drag paddle anywhere) and Browser (mouse / Arrow keys / A & D).
 */
export function buildAstroBreakerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Astro Breaker</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #090c1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const ROW_COLORS = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb7185'];

    let audioCtx = null, muted = false;
    function unlockAudio() {
      if (muted) return;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    }
    function tone(f1, f2, dur, type = 'triangle', vol = 0.07) {
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
    try { best = Number(localStorage.getItem('astro_breaker_best') || 0); } catch {}

    const keys = {};
    window.addEventListener('keydown', (e) => {
      unlockAudio();
      keys[e.code] = true;
      if ((e.code === 'Space' || e.code === 'Enter') && state.screen !== 'playing') startGame();
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    const state = {
      screen: 'title',
      wave: 1,
      score: 0,
      lives: 3,
      paddle: { x: 200, w: 96, h: 14, wideTimer: 0 },
      balls: [],
      bricks: [],
      powerups: [],
      particles: []
    };

    function spawnBall(x, y, vx, vy) {
      state.balls.push({ x, y, vx, vy, r: 8 });
    }

    function buildWave() {
      state.bricks = [];
      const cols = W < 420 ? 7 : 9;
      const rows = Math.min(7, 4 + Math.floor(state.wave / 2));
      const margin = 18;
      const bw = (W - margin * 2 - (cols - 1) * 6) / cols;
      const bh = 22;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isArmored = (r === 0 && state.wave >= 2) || Math.random() < 0.14 * state.wave;
          const isBomb = Math.random() < 0.08;
          state.bricks.push({
            x: margin + c * (bw + 6),
            y: 94 + r * (bh + 6),
            w: bw,
            h: bh,
            hp: isArmored ? 2 : 1,
            maxHp: isArmored ? 2 : 1,
            bomb: isBomb,
            color: isBomb ? '#ef4444' : ROW_COLORS[r % ROW_COLORS.length]
          });
        }
      }
    }

    function resetBallOnPaddle() {
      state.balls = [];
      const spd = 340 + Math.min(160, state.wave * 24);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.55;
      spawnBall(state.paddle.x, H - 92, Math.cos(ang) * spd, Math.sin(ang) * spd);
    }

    function startGame() {
      state.screen = 'playing';
      state.wave = 1;
      state.score = 0;
      state.lives = 3;
      state.paddle = { x: W / 2, w: Math.min(110, W * 0.25), h: 14, wideTimer: 0 };
      state.powerups = [];
      state.particles = [];
      buildWave();
      resetBallOnPaddle();
      tone(320, 620, 0.15);
    }

    function burst(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, s = 50 + Math.random() * 140;
        state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.42, max: 0.42, color, r: 2.5 });
      }
    }

    function getTopBtns() {
      return {
        exit: { x: W - 92, y: 18, w: 34, h: 34, label: '✕' },
        mute: { x: W - 50, y: 18, w: 34, h: 34, label: muted ? '🔇' : '🔊' }
      };
    }
    function hit(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

    let dragging = false;
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
      if (state.screen !== 'playing') { startGame(); return; }
      dragging = true;
      state.paddle.x = Math.max(state.paddle.w / 2, Math.min(W - state.paddle.w / 2, px));
    });
    canvas.addEventListener('pointermove', (e) => {
      if (state.screen === 'playing' && (dragging || e.pointerType === 'mouse')) {
        state.paddle.x = Math.max(state.paddle.w / 2, Math.min(W - state.paddle.w / 2, e.clientX));
      }
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    function damageBrick(idx) {
      const b = state.bricks[idx];
      if (!b) return;
      b.hp--;
      if (b.hp <= 0) {
        state.bricks.splice(idx, 1);
        state.score += b.maxHp * 25;
        burst(b.x + b.w / 2, b.y + b.h / 2, b.color, 12);
        tone(460, 720, 0.08, 'triangle', 0.07);
        if (b.bomb) {
          for (let j = state.bricks.length - 1; j >= 0; j--) {
            const nb = state.bricks[j];
            if (Math.hypot((nb.x + nb.w / 2) - (b.x + b.w / 2), (nb.y + nb.h / 2) - (b.y + b.h / 2)) < 95) {
              state.bricks.splice(j, 1);
              state.score += 30;
              burst(nb.x + nb.w / 2, nb.y + nb.h / 2, '#fca5a5', 8);
            }
          }
          tone(180, 70, 0.2, 'sawtooth', 0.1);
        } else if (Math.random() < 0.18) {
          const kind = Math.random() < 0.55 ? 'MULTI' : 'WIDE';
          state.powerups.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vy: 155, kind });
        }
      } else {
        tone(280, 220, 0.05, 'square', 0.05);
      }
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      if (state.screen === 'playing') {
        const pad = state.paddle;
        if (pad.wideTimer > 0) pad.wideTimer -= dt;
        const baseW = Math.min(110, W * 0.25);
        pad.w = pad.wideTimer > 0 ? baseW * 1.45 : baseW;

        if (keys.ArrowLeft || keys.KeyA) pad.x = Math.max(pad.w / 2, pad.x - 460 * dt);
        if (keys.ArrowRight || keys.KeyD) pad.x = Math.min(W - pad.w / 2, pad.x + 460 * dt);

        const padY = H - 72;

        for (let i = state.powerups.length - 1; i >= 0; i--) {
          const pu = state.powerups[i];
          pu.y += pu.vy * dt;
          if (Math.abs(pu.x - pad.x) < pad.w / 2 + 14 && Math.abs(pu.y - padY) < 18) {
            state.powerups.splice(i, 1);
            tone(560, 920, 0.14);
            if (pu.kind === 'WIDE') pad.wideTimer = 8;
            else if (pu.kind === 'MULTI' && state.balls.length < 6) {
              const b0 = state.balls[0];
              if (b0) {
                spawnBall(b0.x, b0.y, -b0.vx, b0.vy);
                spawnBall(b0.x, b0.y, b0.vx * 0.8, -Math.abs(b0.vy));
              }
            }
          } else if (pu.y > H + 20) {
            state.powerups.splice(i, 1);
          }
        }

        for (let bi = state.balls.length - 1; bi >= 0; bi--) {
          const ball = state.balls[bi];
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); tone(320, 360, 0.03); }
          if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); tone(320, 360, 0.03); }
          if (ball.y - ball.r < 68) { ball.y = 68 + ball.r; ball.vy = Math.abs(ball.vy); tone(320, 360, 0.03); }

          // Paddle bounce
          if (ball.vy > 0 && ball.y + ball.r >= padY - pad.h / 2 && ball.y - ball.r <= padY + pad.h / 2 && Math.abs(ball.x - pad.x) <= pad.w / 2 + ball.r) {
            const offset = (ball.x - pad.x) / (pad.w / 2);
            const spd = Math.hypot(ball.vx, ball.vy);
            const ang = -Math.PI / 2 + offset * 1.05;
            ball.vx = Math.cos(ang) * spd;
            ball.vy = Math.sin(ang) * spd;
            ball.y = padY - pad.h / 2 - ball.r - 1;
            tone(400, 520, 0.05);
          }

          // Brick collisions
          for (let j = state.bricks.length - 1; j >= 0; j--) {
            const br = state.bricks[j];
            const cx = Math.max(br.x, Math.min(ball.x, br.x + br.w));
            const cy = Math.max(br.y, Math.min(ball.y, br.y + br.h));
            if (Math.hypot(ball.x - cx, ball.y - cy) <= ball.r) {
              if (Math.abs(ball.x - (br.x + br.w / 2)) / br.w > Math.abs(ball.y - (br.y + br.h / 2)) / br.h) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }
              damageBrick(j);
              break;
            }
          }

          if (ball.y - ball.r > H + 20) {
            state.balls.splice(bi, 1);
          }
        }

        if (state.balls.length === 0) {
          state.lives--;
          tone(180, 80, 0.25, 'sawtooth', 0.1);
          if (state.lives <= 0) {
            state.screen = 'gameover';
            if (state.score > best) {
              best = state.score;
              try { localStorage.setItem('astro_breaker_best', String(best)); } catch {}
            }
          } else {
            resetBallOnPaddle();
          }
        } else if (state.bricks.length === 0) {
          state.wave++;
          state.score += 200;
          buildWave();
          resetBallOnPaddle();
          tone(500, 900, 0.22);
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0b0e24'); grad.addColorStop(1, '#161130');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      // Bricks
      for (const b of state.bricks) {
        ctx.save();
        ctx.fillStyle = b.hp > 1 ? '#1e293b' : b.color;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 6); ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      // Powerups
      for (const pu of state.powerups) {
        ctx.fillStyle = pu.kind === 'MULTI' ? '#38bdf8' : '#34d399';
        ctx.beginPath(); ctx.roundRect(pu.x - 16, pu.y - 10, 32, 20, 10); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(pu.kind === 'MULTI' ? '+2' : 'WIDE', pu.x, pu.y + 1);
      }

      // Paddle & Balls
      if (state.screen === 'playing') {
        const pad = state.paddle;
        ctx.save();
        ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#c4b5fd';
        ctx.beginPath(); ctx.roundRect(pad.x - pad.w / 2, H - 72 - pad.h / 2, pad.w, pad.h, 7); ctx.fill();
        ctx.restore();

        for (const ball of state.balls) {
          ctx.save();
          ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 12;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      for (const p of state.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Top HUD
      ctx.fillStyle = 'rgba(18, 20, 42, 0.85)';
      ctx.beginPath(); ctx.roundRect(14, 14, Math.min(260, W - 120), 50, 14); ctx.fill();
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('ASTRO BREAKER • WAVE ' + state.wave, 26, 33);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SCORE ' + state.score + '   ' + '♥'.repeat(Math.max(0, state.lives)), 26, 53);

      const btns = getTopBtns();
      [btns.exit, btns.mute].forEach((b) => {
        ctx.fillStyle = 'rgba(18, 20, 42, 0.85)'; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      if (state.screen === 'title' || state.screen === 'gameover') {
        ctx.fillStyle = 'rgba(9, 10, 22, 0.72)'; ctx.fillRect(0, 0, W, H);
        const cw = Math.min(330, W - 40), ch = 220, cx = (W - cw) / 2, cy = (H - ch) / 2;
        ctx.fillStyle = 'rgba(20, 22, 44, 0.95)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 20); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = state.screen === 'gameover' ? '#fb7185' : '#7dd3fc';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'SHIELD DOWN' : 'ASTRO BREAKER', W / 2, cy + 50);
        ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? ('Score: ' + state.score + '  •  Best: ' + best) : 'Drag anywhere or use Arrow Keys to steer', W / 2, cy + 92);
        ctx.fillText('Catch +2 Multi-Ball & WIDE Paddle orbs', W / 2, cy + 118);
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
