/**
 * Self-contained 60fps HTML5 Canvas game: "Math Blitz Runner"
 * 3-lane endless reflex runner where players solve quick math gates on the fly.
 * Works on both Mobile (tap lane or swipe left/right) and Browser (ArrowLeft/ArrowRight or A/D).
 */
export function buildBlitzRunnerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Math Blitz Runner</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0a0b1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

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
    try { best = Number(localStorage.getItem('blitz_runner_best') || 0); } catch {}

    const state = {
      screen: 'title',
      lane: 1,
      playerX: 200,
      score: 0,
      streak: 0,
      lives: 3,
      speed: 190,
      roadOffset: 0,
      gate: null,
      particles: [],
      popups: []
    };

    function getTrackMetrics() {
      const tw = Math.min(W - 24, 420);
      const tx = (W - tw) / 2;
      const laneW = tw / 3;
      return { tx, tw, laneW };
    }

    function makeQuestion() {
      const tier = Math.floor(state.score / 250);
      let a, b, op, ans;
      if (tier === 0) {
        a = 2 + Math.floor(Math.random() * 14);
        b = 2 + Math.floor(Math.random() * 14);
        if (Math.random() < 0.5) { op = '+'; ans = a + b; }
        else { if (a < b) [a, b] = [b, a]; op = '−'; ans = a - b; }
      } else if (tier === 1) {
        a = 3 + Math.floor(Math.random() * 9);
        b = 2 + Math.floor(Math.random() * 9);
        op = '×'; ans = a * b;
      } else {
        a = 4 + Math.floor(Math.random() * 11);
        b = 3 + Math.floor(Math.random() * 10);
        if (Math.random() < 0.65) { op = '×'; ans = a * b; }
        else { op = '+'; ans = a + b + 12; a += 12; }
      }

      const correctLane = Math.floor(Math.random() * 3);
      const options = [0, 0, 0];
      const used = new Set([ans]);
      for (let i = 0; i < 3; i++) {
        if (i === correctLane) {
          options[i] = ans;
        } else {
          let wrong;
          do {
            const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? -1 : 1);
            wrong = Math.max(0, ans + delta);
          } while (used.has(wrong));
          used.add(wrong);
          options[i] = wrong;
        }
      }
      return { prompt: a + ' ' + op + ' ' + b + ' = ?', options, correctLane, y: -50 };
    }

    function startGame() {
      state.screen = 'playing';
      state.lane = 1;
      const { tx, laneW } = getTrackMetrics();
      state.playerX = tx + laneW * 1.5;
      state.score = 0;
      state.streak = 0;
      state.lives = 3;
      state.speed = 185;
      state.gate = makeQuestion();
      state.particles = [];
      state.popups = [];
      tone(320, 620, 0.14);
    }

    function shiftLane(dir) {
      if (state.screen !== 'playing') return;
      state.lane = Math.max(0, Math.min(2, state.lane + dir));
      tone(420, 500, 0.04, 'sine', 0.04);
    }

    window.addEventListener('keydown', (e) => {
      unlockAudio();
      if (state.screen !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') startGame();
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') shiftLane(-1);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') shiftLane(1);
    });

    function getTopBtns() {
      return {
        exit: { x: W - 92, y: 18, w: 34, h: 34, label: '✕' },
        mute: { x: W - 50, y: 18, w: 34, h: 34, label: muted ? '🔇' : '🔊' }
      };
    }
    function hit(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

    let swipeX = 0;
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
      swipeX = px;
      const { tx, laneW } = getTrackMetrics();
      if (px >= tx && px <= tx + laneW * 3) {
        state.lane = Math.max(0, Math.min(2, Math.floor((px - tx) / laneW)));
      }
    });
    canvas.addEventListener('pointerup', (e) => {
      if (state.screen !== 'playing') return;
      const dx = e.clientX - swipeX;
      if (Math.abs(dx) > 35) shiftLane(dx > 0 ? 1 : -1);
    });

    function burst(x, y, color) {
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 140;
        state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, color, r: 3 });
      }
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const { tx, tw, laneW } = getTrackMetrics();
      const playerY = H - 105;

      if (state.screen === 'playing') {
        state.roadOffset = (state.roadOffset + state.speed * dt) % 60;
        const targetX = tx + laneW * (state.lane + 0.5);
        state.playerX += (targetX - state.playerX) * Math.min(1, dt * 16);

        if (state.gate) {
          state.gate.y += state.speed * dt;
          if (state.gate.y >= playerY - 22) {
            if (state.lane === state.gate.correctLane) {
              state.streak++;
              const pts = 40 + state.streak * 10;
              state.score += pts;
              state.speed = Math.min(360, state.speed + 7);
              burst(state.playerX, playerY, '#34d399');
              state.popups.push({ x: state.playerX, y: playerY - 30, text: '+' + pts + ' (x' + state.streak + ')', color: '#34d399', life: 0.85, max: 0.85 });
              tone(520, 840, 0.12);
            } else {
              state.streak = 0;
              state.lives--;
              burst(state.playerX, playerY, '#fb7185');
              state.popups.push({ x: state.playerX, y: playerY - 30, text: 'WRONG!', color: '#fb7185', life: 0.85, max: 0.85 });
              tone(180, 80, 0.24, 'sawtooth', 0.1);
              if (state.lives <= 0) {
                state.screen = 'gameover';
                if (state.score > best) {
                  best = state.score;
                  try { localStorage.setItem('blitz_runner_best', String(best)); } catch {}
                }
              }
            }
            state.gate = makeQuestion();
          }
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
      for (let i = state.popups.length - 1; i >= 0; i--) {
        const pop = state.popups[i]; pop.y -= 35 * dt; pop.life -= dt;
        if (pop.life <= 0) state.popups.splice(i, 1);
      }

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#090b1c'); grad.addColorStop(1, '#1a1033');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      // Track & Lane Dividers
      ctx.fillStyle = 'rgba(15, 20, 40, 0.9)';
      ctx.fillRect(tx, 0, tw, H);
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(tx, 0, tw, H);

      ctx.strokeStyle = 'rgba(167, 139, 250, 0.22)';
      ctx.setLineDash([28, 32]);
      ctx.lineDashOffset = -state.roadOffset;
      for (let l = 1; l < 3; l++) {
        ctx.beginPath(); ctx.moveTo(tx + l * laneW, 0); ctx.lineTo(tx + l * laneW, H); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Gates
      if (state.screen === 'playing' && state.gate) {
        const gy = state.gate.y;
        for (let l = 0; l < 3; l++) {
          const gx = tx + l * laneW + 6, gw = laneW - 12;
          ctx.fillStyle = 'rgba(124, 58, 237, 0.26)';
          ctx.strokeStyle = '#a78bfa';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(gx, gy - 24, gw, 48, 12); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(state.gate.options[l]), gx + gw / 2, gy + 1);
        }

        // Question Banner
        ctx.fillStyle = 'rgba(15, 18, 38, 0.94)';
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(W / 2 - 120, 86, 240, 48, 16); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(state.gate.prompt, W / 2, 111);
      }

      // Runner Orb
      if (state.screen === 'playing') {
        ctx.save();
        ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(state.playerX, playerY, 20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      }

      for (const p of state.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const pop of state.popups) {
        ctx.globalAlpha = Math.max(0, pop.life / pop.max);
        ctx.fillStyle = pop.color; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(pop.text, pop.x, pop.y);
      }
      ctx.globalAlpha = 1;

      // Top HUD
      ctx.fillStyle = 'rgba(18, 20, 42, 0.85)';
      ctx.beginPath(); ctx.roundRect(14, 14, Math.min(260, W - 120), 50, 14); ctx.fill();
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('MATH BLITZ RUNNER • x' + Math.max(1, state.streak), 26, 33);
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
        ctx.fillStyle = 'rgba(20, 22, 44, 0.95)'; ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 20); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = state.screen === 'gameover' ? '#fb7185' : '#6ee7b7';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'RUN ENDED' : 'MATH BLITZ RUNNER', W / 2, cy + 50);
        ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? ('Score: ' + state.score + '  •  Best: ' + best) : 'Tap a lane / Swipe or Arrow Keys to dodge', W / 2, cy + 92);
        ctx.fillText('Steer into the correct answer gate!', W / 2, cy + 118);
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
