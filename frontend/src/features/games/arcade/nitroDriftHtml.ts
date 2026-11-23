/**
 * Self-contained 60fps HTML5 Canvas game: "Neon Drift" (Car Racing)
 * 4-lane neon highway racer with rival traffic, Fuel pickups, and Nitro Boost invulnerability.
 * Works on both Mobile (tap/swipe + NITRO button) and Browser (Arrow/WASD + Space).
 */
export function buildNitroDriftHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Neon Drift</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #070914; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const LANES = 4;

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
    try { best = Number(localStorage.getItem('neon_drift_best') || 0); } catch {}

    const state = {
      screen: 'title',
      lane: 1,
      carX: 200,
      speed: 260,
      distance: 0,
      score: 0,
      nitro: 50,
      nitroTimer: 0,
      lives: 3,
      invuln: 0,
      roadOffset: 0,
      spawnTimer: 0,
      pickupTimer: 0,
      traffic: [],
      pickups: [],
      particles: []
    };

    function getRoad() {
      const rw = Math.min(W - 24, 400);
      const rx = (W - rw) / 2;
      const lw = rw / LANES;
      return { rx, rw, lw };
    }

    function startGame() {
      state.screen = 'playing';
      state.lane = 1;
      const { rx, lw } = getRoad();
      state.carX = rx + lw * 1.5;
      state.speed = 280;
      state.distance = 0;
      state.score = 0;
      state.nitro = 50;
      state.nitroTimer = 0;
      state.lives = 3;
      state.invuln = 0;
      state.spawnTimer = 0.6;
      state.pickupTimer = 1.4;
      state.traffic = [];
      state.pickups = [];
      state.particles = [];
      tone(220, 520, 0.2, 'sawtooth', 0.07);
    }

    function steer(dir) {
      if (state.screen !== 'playing') return;
      state.lane = Math.max(0, Math.min(LANES - 1, state.lane + dir));
      tone(340, 420, 0.04, 'sine', 0.04);
    }

    function activateNitro() {
      if (state.screen !== 'playing' || state.nitro < 30 || state.nitroTimer > 0) return;
      state.nitroTimer = 3.2;
      state.nitro = Math.max(0, state.nitro - 50);
      tone(280, 880, 0.28, 'sawtooth', 0.09);
    }

    window.addEventListener('keydown', (e) => {
      unlockAudio();
      if (state.screen !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') startGame();
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') steer(-1);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') steer(1);
      else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); activateNitro(); }
    });

    function getBtns() {
      return {
        exit: { x: W - 92, y: 18, w: 34, h: 34, label: '✕' },
        mute: { x: W - 50, y: 18, w: 34, h: 34, label: muted ? '🔇' : '🔊' },
        nitro: { x: W - 74, y: H - 84, r: 34 }
      };
    }
    function hit(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

    let touchStartX = 0;
    canvas.addEventListener('pointerdown', (e) => {
      unlockAudio();
      const px = e.clientX, py = e.clientY;
      const b = getBtns();
      if (hit(px, py, b.mute)) { muted = !muted; return; }
      if (hit(px, py, b.exit)) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_GAME' }));
        else if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        return;
      }
      if (state.screen !== 'playing') { startGame(); return; }
      if (Math.hypot(px - b.nitro.x, py - b.nitro.y) <= b.nitro.r + 12) { activateNitro(); return; }

      touchStartX = px;
      const { rx, lw } = getRoad();
      if (px >= rx && px <= rx + lw * LANES) {
        const tappedLane = Math.max(0, Math.min(LANES - 1, Math.floor((px - rx) / lw)));
        if (tappedLane !== state.lane) state.lane += tappedLane > state.lane ? 1 : -1;
      }
    });
    canvas.addEventListener('pointerup', (e) => {
      if (state.screen !== 'playing') return;
      const dx = e.clientX - touchStartX;
      if (Math.abs(dx) > 36) steer(dx > 0 ? 1 : -1);
    });

    function spawnTraffic() {
      const lane = Math.floor(Math.random() * LANES);
      // Avoid overlapping existing cars near top
      if (state.traffic.some((t) => t.lane === lane && t.y < 140)) return;
      const isTruck = Math.random() < 0.24;
      const colors = ['#fb7185', '#f97316', '#facc15', '#34d399'];
      state.traffic.push({
        lane,
        y: -90,
        h: isTruck ? 78 : 56,
        w: isTruck ? 38 : 32,
        relSpeed: isTruck ? 120 : (150 + Math.random() * 80),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function spawnPickup() {
      const lane = Math.floor(Math.random() * LANES);
      state.pickups.push({ lane, y: -30, kind: Math.random() < 0.6 ? 'NITRO' : 'COIN' });
    }

    function burst(x, y, color, n = 14) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 160;
        state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, color, r: 3 });
      }
    }

    function drawCar(x, y, w, h, color, isPlayer, nitroOn) {
      ctx.save();
      ctx.translate(x, y);
      if (isPlayer) {
        // Headlight beams
        const beam = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 - 95);
        beam.addColorStop(0, nitroOn ? 'rgba(56, 189, 248, 0.38)' : 'rgba(196, 181, 253, 0.28)');
        beam.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -h / 2);
        ctx.lineTo(-w * 1.1, -h / 2 - 95);
        ctx.lineTo(w * 1.1, -h / 2 - 95);
        ctx.lineTo(w * 0.4, -h / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowColor = color; ctx.shadowBlur = nitroOn ? 20 : 10;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 8); ctx.fill();
      ctx.shadowBlur = 0;
      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.roundRect(-w * 0.34, -h * 0.24, w * 0.68, h * 0.28, 4); ctx.fill();
      // Lights
      ctx.fillStyle = isPlayer ? '#facc15' : '#ef4444';
      const ly = isPlayer ? -h / 2 + 2 : h / 2 - 5;
      ctx.fillRect(-w * 0.38, ly, 7, 3);
      ctx.fillRect(w * 0.38 - 7, ly, 7, 3);
      ctx.restore();
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { rx, rw, lw } = getRoad();
      const playerY = H - 108;

      if (state.screen === 'playing') {
        const nitroOn = state.nitroTimer > 0;
        if (nitroOn) state.nitroTimer = Math.max(0, state.nitroTimer - dt);
        if (state.invuln > 0) state.invuln = Math.max(0, state.invuln - dt);

        state.speed = Math.min(540, 280 + state.distance * 0.015);
        const effSpeed = nitroOn ? state.speed * 1.65 : state.speed;
        state.roadOffset = (state.roadOffset + effSpeed * dt) % 64;
        state.distance += effSpeed * dt * 0.25;
        state.score += Math.round(effSpeed * dt * (nitroOn ? 0.14 : 0.06));
        state.nitro = Math.min(100, state.nitro + dt * 4);

        const targetX = rx + lw * (state.lane + 0.5);
        state.carX += (targetX - state.carX) * Math.min(1, dt * 16);

        if (nitroOn && Math.random() < 0.7) {
          state.particles.push({ x: state.carX + (Math.random() - 0.5) * 16, y: playerY + 30, vx: (Math.random() - 0.5) * 30, vy: 180, life: 0.28, max: 0.28, color: '#38bdf8', r: 3.5 });
        }

        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          state.spawnTimer = Math.max(0.36, 0.92 - state.distance * 0.00025);
          spawnTraffic();
        }
        state.pickupTimer -= dt;
        if (state.pickupTimer <= 0) {
          state.pickupTimer = 1.6;
          spawnPickup();
        }

        for (let i = state.pickups.length - 1; i >= 0; i--) {
          const pu = state.pickups[i];
          pu.y += effSpeed * 0.75 * dt;
          const px = rx + lw * (pu.lane + 0.5);
          if (Math.abs(px - state.carX) < 28 && Math.abs(pu.y - playerY) < 34) {
            state.pickups.splice(i, 1);
            if (pu.kind === 'NITRO') { state.nitro = Math.min(100, state.nitro + 35); state.score += 50; }
            else { state.score += 100; }
            burst(px, pu.y, pu.kind === 'NITRO' ? '#38bdf8' : '#facc15', 10);
            tone(560, 880, 0.1);
          } else if (pu.y > H + 40) {
            state.pickups.splice(i, 1);
          }
        }

        for (let i = state.traffic.length - 1; i >= 0; i--) {
          const t = state.traffic[i];
          t.y += (effSpeed - t.relSpeed) * dt;
          const tx = rx + lw * (t.lane + 0.5);
          if (Math.abs(tx - state.carX) < (t.w + 30) * 0.45 && Math.abs(t.y - playerY) < (t.h + 56) * 0.45) {
            if (nitroOn) {
              state.traffic.splice(i, 1);
              state.score += 120;
              burst(tx, t.y, '#38bdf8', 18);
              tone(240, 520, 0.12);
              continue;
            } else if (state.invuln <= 0) {
              state.traffic.splice(i, 1);
              state.lives--;
              state.invuln = 1.4;
              burst(state.carX, playerY, '#fb7185', 18);
              tone(160, 70, 0.28, 'sawtooth', 0.11);
              if (state.lives <= 0) {
                state.screen = 'gameover';
                if (state.score > best) {
                  best = state.score;
                  try { localStorage.setItem('neon_drift_best', String(best)); } catch {}
                }
              }
              continue;
            }
          }
          if (t.y > H + 100) state.traffic.splice(i, 1);
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // Render
      ctx.fillStyle = '#070914'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#11162b'; ctx.fillRect(rx, 0, rw, H);
      ctx.strokeStyle = state.nitroTimer > 0 ? '#38bdf8' : '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, -4, rw, H + 8);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.setLineDash([32, 32]);
      ctx.lineDashOffset = -state.roadOffset;
      for (let l = 1; l < LANES; l++) {
        ctx.beginPath(); ctx.moveTo(rx + l * lw, 0); ctx.lineTo(rx + l * lw, H); ctx.stroke();
      }
      ctx.setLineDash([]);

      if (state.screen === 'playing') {
        for (const pu of state.pickups) {
          const px = rx + lw * (pu.lane + 0.5);
          ctx.save();
          ctx.shadowColor = pu.kind === 'NITRO' ? '#38bdf8' : '#facc15'; ctx.shadowBlur = 12;
          ctx.fillStyle = pu.kind === 'NITRO' ? '#38bdf8' : '#facc15';
          ctx.beginPath(); ctx.arc(px, pu.y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0f172a'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(pu.kind === 'NITRO' ? 'N' : '★', px, pu.y + 1);
          ctx.restore();
        }
        for (const t of state.traffic) {
          drawCar(rx + lw * (t.lane + 0.5), t.y, t.w, t.h, t.color, false, false);
        }
        if (state.invuln <= 0 || Math.floor(state.invuln * 14) % 2 === 0) {
          drawCar(state.carX, playerY, 34, 60, state.nitroTimer > 0 ? '#38bdf8' : '#a78bfa', true, state.nitroTimer > 0);
        }
      }

      for (const p of state.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Top HUD
      ctx.fillStyle = 'rgba(15, 19, 40, 0.86)';
      ctx.beginPath(); ctx.roundRect(14, 14, Math.min(260, W - 120), 60, 14); ctx.fill();
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('NEON DRIFT • ' + Math.round(state.speed * 0.45) + ' KM/H', 26, 33);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SCORE ' + state.score + '   ' + '♥'.repeat(Math.max(0, state.lives)), 26, 54);
      // Nitro bar
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(26, 62, 140, 5);
      ctx.fillStyle = state.nitro >= 30 ? '#38bdf8' : '#64748b';
      ctx.fillRect(26, 62, 140 * (state.nitro / 100), 5);

      const btns = getBtns();
      [btns.exit, btns.mute].forEach((b) => {
        ctx.fillStyle = 'rgba(15, 19, 40, 0.86)'; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      if (state.screen === 'playing') {
        const ready = state.nitro >= 30 && state.nitroTimer <= 0;
        ctx.fillStyle = ready ? 'rgba(56, 189, 248, 0.88)' : 'rgba(30, 41, 59, 0.78)';
        ctx.strokeStyle = ready ? '#bae6fd' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(btns.nitro.x, btns.nitro.y, btns.nitro.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(state.nitroTimer > 0 ? 'BOOST' : 'NITRO', btns.nitro.x, btns.nitro.y + 1);
      } else {
        ctx.fillStyle = 'rgba(7, 9, 20, 0.72)'; ctx.fillRect(0, 0, W, H);
        const cw = Math.min(330, W - 40), ch = 220, cx = (W - cw) / 2, cy = (H - ch) / 2;
        ctx.fillStyle = 'rgba(18, 22, 44, 0.95)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 20); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = state.screen === 'gameover' ? '#fb7185' : '#7dd3fc';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'CRASHED!' : 'NEON DRIFT', W / 2, cy + 50);
        ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? ('Score: ' + state.score + '  •  Best: ' + best) : 'Tap / Swipe or Arrow Keys to weave lanes', W / 2, cy + 92);
        ctx.fillText('NITRO / Space smashes through traffic!', W / 2, cy + 118);
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath(); ctx.roundRect(W / 2 - 86, cy + ch - 64, 172, 42, 14); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'PLAY AGAIN' : 'TAP TO RACE', W / 2, cy + ch - 38);
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();
  </script>
</body>
</html>`;
}
