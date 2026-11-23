/**
 * Self-contained 60fps HTML5 Canvas game: "Violet Sudoku"
 * Valid 9x9 Sudoku generator with Easy / Medium / Hard modes, row/col/box highlights,
 * conflict detection, Hint & Erase tools, and full Mobile touch + Browser keyboard support.
 */
export function buildSudokuHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Violet Sudoku</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0d0b1e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const BASE_SOLUTION = [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ];

    let audioCtx = null, muted = false;
    function unlockAudio() {
      if (muted) return;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    }
    function tone(f1, f2, dur, type = 'sine', vol = 0.07) {
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

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function generatePuzzle(diff) {
      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const rowOrder = [];
      const colOrder = [];
      for (const b of shuffle([0, 1, 2])) {
        for (const r of shuffle([0, 1, 2])) rowOrder.push(b * 3 + r);
      }
      for (const b of shuffle([0, 1, 2])) {
        for (const c of shuffle([0, 1, 2])) colOrder.push(b * 3 + c);
      }
      const sol = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => digits[BASE_SOLUTION[rowOrder[r]][colOrder[c]] - 1])
      );
      const board = sol.map((row) => row.slice());
      const fixed = Array.from({ length: 9 }, () => Array(9).fill(true));
      const blanks = diff === 'Hard' ? 50 : diff === 'Medium' ? 40 : 30;
      const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
      for (let i = 0; i < blanks; i++) {
        const idx = cells[i];
        const r = Math.floor(idx / 9), c = idx % 9;
        board[r][c] = 0;
        fixed[r][c] = false;
      }
      return { sol, board, fixed };
    }

    const state = {
      screen: 'title', // title | playing | won | gameover
      difficulty: 'Easy',
      sol: [],
      board: [],
      fixed: [],
      selR: 4,
      selC: 4,
      mistakes: 0,
      hintsLeft: 3,
      elapsed: 0
    };

    function startGame(diff) {
      state.difficulty = diff || state.difficulty;
      const p = generatePuzzle(state.difficulty);
      state.sol = p.sol;
      state.board = p.board;
      state.fixed = p.fixed;
      state.selR = 4;
      state.selC = 4;
      state.mistakes = 0;
      state.hintsLeft = 3;
      state.elapsed = 0;
      state.screen = 'playing';
      tone(360, 640, 0.14);
    }

    function placeNumber(num) {
      if (state.screen !== 'playing') return;
      const { selR: r, selC: c } = state;
      if (state.fixed[r][c]) return;
      if (num === 0) {
        state.board[r][c] = 0;
        tone(260, 200, 0.05);
        return;
      }
      state.board[r][c] = num;
      if (num !== state.sol[r][c]) {
        state.mistakes++;
        tone(180, 90, 0.2, 'sawtooth', 0.09);
        if (state.mistakes >= 3) {
          state.screen = 'gameover';
        }
      } else {
        tone(500, 720, 0.09);
        let allDone = true;
        for (let rr = 0; rr < 9; rr++) {
          for (let cc = 0; cc < 9; cc++) {
            if (state.board[rr][cc] !== state.sol[rr][cc]) { allDone = false; break; }
          }
        }
        if (allDone) {
          state.screen = 'won';
          tone(520, 980, 0.25);
        }
      }
    }

    function useHint() {
      if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
      const { selR: r, selC: c } = state;
      if (!state.fixed[r][c] && state.board[r][c] !== state.sol[r][c]) {
        state.board[r][c] = state.sol[r][c];
        state.fixed[r][c] = true;
        state.hintsLeft--;
        tone(600, 880, 0.14);
        let allDone = true;
        for (let rr = 0; rr < 9; rr++) {
          for (let cc = 0; cc < 9; cc++) {
            if (state.board[rr][cc] !== state.sol[rr][cc]) { allDone = false; break; }
          }
        }
        if (allDone) state.screen = 'won';
      }
    }

    window.addEventListener('keydown', (e) => {
      unlockAudio();
      if (state.screen !== 'playing') return;
      if (e.key >= '1' && e.key <= '9') placeNumber(Number(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') placeNumber(0);
      else if (e.code === 'ArrowUp') state.selR = (state.selR + 8) % 9;
      else if (e.code === 'ArrowDown') state.selR = (state.selR + 1) % 9;
      else if (e.code === 'ArrowLeft') state.selC = (state.selC + 8) % 9;
      else if (e.code === 'ArrowRight') state.selC = (state.selC + 1) % 9;
    });

    function getLayout() {
      const topH = 74;
      const bottomH = 132;
      const maxBoard = Math.min(W - 24, H - topH - bottomH - 20, 410);
      const bx = (W - maxBoard) / 2;
      const by = topH + Math.max(8, (H - topH - bottomH - maxBoard) / 2);
      const cell = maxBoard / 9;

      const padW = Math.min(W - 24, 420);
      const padX = (W - padW) / 2;
      const numBtnW = (padW - 8 * 6) / 9;
      const numY = by + maxBoard + 16;
      const toolY = numY + 52;
      return { bx, by, maxBoard, cell, padX, padW, numBtnW, numY, toolY };
    }

    function getTopBtns() {
      return {
        exit: { x: W - 92, y: 18, w: 34, h: 34, label: '✕' },
        mute: { x: W - 50, y: 18, w: 34, h: 34, label: muted ? '🔇' : '🔊' }
      };
    }
    function hit(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

    canvas.addEventListener('pointerdown', (e) => {
      unlockAudio();
      const px = e.clientX, py = e.clientY;
      const tb = getTopBtns();
      if (hit(px, py, tb.mute)) { muted = !muted; return; }
      if (hit(px, py, tb.exit)) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_GAME' }));
        else if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        return;
      }

      if (state.screen === 'title' || state.screen === 'won' || state.screen === 'gameover') {
        const cw = Math.min(330, W - 40), ch = 250, cx = (W - cw) / 2, cy = (H - ch) / 2;
        if (state.screen === 'title') {
          const diffs = ['Easy', 'Medium', 'Hard'];
          const dw = (cw - 48) / 3;
          for (let i = 0; i < 3; i++) {
            const dr = { x: cx + 16 + i * (dw + 8), y: cy + 106, w: dw, h: 36 };
            if (hit(px, py, dr)) { state.difficulty = diffs[i]; return; }
          }
        }
        startGame(state.difficulty);
        return;
      }

      const L = getLayout();
      // Board click
      if (px >= L.bx && px <= L.bx + L.maxBoard && py >= L.by && py <= L.by + L.maxBoard) {
        state.selC = Math.floor((px - L.bx) / L.cell);
        state.selR = Math.floor((py - L.by) / L.cell);
        tone(380, 420, 0.03, 'sine', 0.03);
        return;
      }
      // Number pad 1..9
      for (let i = 0; i < 9; i++) {
        const nr = { x: L.padX + i * (L.numBtnW + 6), y: L.numY, w: L.numBtnW, h: 42 };
        if (hit(px, py, nr)) { placeNumber(i + 1); return; }
      }
      // Tools: Erase / Hint / New
      const tw = (L.padW - 16) / 3;
      if (hit(px, py, { x: L.padX, y: L.toolY, w: tw, h: 38 })) { placeNumber(0); return; }
      if (hit(px, py, { x: L.padX + tw + 8, y: L.toolY, w: tw, h: 38 })) { useHint(); return; }
      if (hit(px, py, { x: L.padX + (tw + 8) * 2, y: L.toolY, w: tw, h: 38 })) { state.screen = 'title'; return; }
    });

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (state.screen === 'playing') state.elapsed += dt;

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0f0c24'); grad.addColorStop(1, '#1a1236');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      // Top HUD
      const mins = String(Math.floor(state.elapsed / 60)).padStart(2, '0');
      const secs = String(Math.floor(state.elapsed % 60)).padStart(2, '0');
      ctx.fillStyle = 'rgba(20, 22, 46, 0.85)';
      ctx.beginPath(); ctx.roundRect(14, 14, Math.min(260, W - 120), 50, 14); ctx.fill();
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('VIOLET SUDOKU • ' + state.difficulty.toUpperCase(), 26, 33);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
      ctx.fillText(mins + ':' + secs + '   MISTAKES ' + state.mistakes + '/3', 26, 53);

      const tb = getTopBtns();
      [tb.exit, tb.mute].forEach((b) => {
        ctx.fillStyle = 'rgba(20, 22, 46, 0.85)'; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      if (state.board.length === 9) {
        const L = getLayout();
        const selVal = state.board[state.selR][state.selC];

        ctx.fillStyle = 'rgba(15, 17, 36, 0.92)';
        ctx.beginPath(); ctx.roundRect(L.bx, L.by, L.maxBoard, L.maxBoard, 10); ctx.fill();

        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            const x = L.bx + c * L.cell, y = L.by + r * L.cell;
            const isSel = r === state.selR && c === state.selC;
            const sameBox = Math.floor(r / 3) === Math.floor(state.selR / 3) && Math.floor(c / 3) === Math.floor(state.selC / 3);
            const sameLine = r === state.selR || c === state.selC;
            const v = state.board[r][c];
            const sameNum = selVal !== 0 && v === selVal;

            if (isSel) ctx.fillStyle = 'rgba(139, 92, 246, 0.45)';
            else if (sameNum) ctx.fillStyle = 'rgba(139, 92, 246, 0.26)';
            else if (sameLine || sameBox) ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            else ctx.fillStyle = 'transparent';
            if (ctx.fillStyle !== 'transparent') ctx.fillRect(x, y, L.cell, L.cell);

            if (v !== 0) {
              const wrong = !state.fixed[r][c] && v !== state.sol[r][c];
              ctx.fillStyle = state.fixed[r][c] ? '#f8fafc' : wrong ? '#fb7185' : '#a78bfa';
              ctx.font = (state.fixed[r][c] ? 'bold ' : '600 ') + Math.floor(L.cell * 0.54) + 'px sans-serif';
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.fillText(String(v), x + L.cell / 2, y + L.cell / 2 + 1);
            }
          }
        }

        // Grid lines
        for (let i = 0; i <= 9; i++) {
          ctx.strokeStyle = i % 3 === 0 ? 'rgba(196, 181, 253, 0.7)' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = i % 3 === 0 ? 2 : 1;
          ctx.beginPath(); ctx.moveTo(L.bx + i * L.cell, L.by); ctx.lineTo(L.bx + i * L.cell, L.by + L.maxBoard); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(L.bx, L.by + i * L.cell); ctx.lineTo(L.bx + L.maxBoard, L.by + i * L.cell); ctx.stroke();
        }

        // Number Pad
        for (let i = 0; i < 9; i++) {
          const x = L.padX + i * (L.numBtnW + 6);
          ctx.fillStyle = 'rgba(124, 58, 237, 0.25)'; ctx.strokeStyle = 'rgba(167, 139, 250, 0.55)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(x, L.numY, L.numBtnW, 42, 10); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), x + L.numBtnW / 2, L.numY + 22);
        }

        // Tool Buttons
        const tw = (L.padW - 16) / 3;
        [
          { x: L.padX, label: 'Erase' },
          { x: L.padX + tw + 8, label: 'Hint (' + state.hintsLeft + ')' },
          { x: L.padX + (tw + 8) * 2, label: 'New' }
        ].forEach((b) => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.roundRect(b.x, L.toolY, tw, 38, 10); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#e2e8f0'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(b.label, b.x + tw / 2, L.toolY + 20);
        });
      }

      if (state.screen === 'title' || state.screen === 'won' || state.screen === 'gameover') {
        ctx.fillStyle = 'rgba(9, 10, 22, 0.72)'; ctx.fillRect(0, 0, W, H);
        const cw = Math.min(330, W - 40), ch = 250, cx = (W - cw) / 2, cy = (H - ch) / 2;
        ctx.fillStyle = 'rgba(20, 22, 44, 0.96)';
        ctx.strokeStyle = state.screen === 'won' ? '#34d399' : state.screen === 'gameover' ? '#fb7185' : '#a78bfa';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 20); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = state.screen === 'won' ? '#34d399' : state.screen === 'gameover' ? '#fb7185' : '#c4b5fd';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(state.screen === 'won' ? 'PUZZLE SOLVED!' : state.screen === 'gameover' ? 'TOO MANY MISTAKES' : 'VIOLET SUDOKU', W / 2, cy + 48);

        if (state.screen === 'title') {
          ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
          ctx.fillText('Select difficulty:', W / 2, cy + 84);
          const diffs = ['Easy', 'Medium', 'Hard'];
          const dw = (cw - 48) / 3;
          for (let i = 0; i < 3; i++) {
            const dx = cx + 16 + i * (dw + 8), active = state.difficulty === diffs[i];
            ctx.fillStyle = active ? '#7c3aed' : 'rgba(255,255,255,0.08)';
            ctx.beginPath(); ctx.roundRect(dx, cy + 106, dw, 36, 10); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px sans-serif';
            ctx.fillText(diffs[i], dx + dw / 2, cy + 129);
          }
        } else {
          ctx.fillStyle = '#cbd5e1'; ctx.font = '14px sans-serif';
          ctx.fillText('Difficulty: ' + state.difficulty + '   •   Time: ' + mins + ':' + secs, W / 2, cy + 106);
        }

        ctx.fillStyle = '#7c3aed';
        ctx.beginPath(); ctx.roundRect(W / 2 - 86, cy + ch - 64, 172, 42, 14); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(state.screen === 'title' ? 'START PUZZLE' : 'NEW PUZZLE', W / 2, cy + ch - 38);
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();
  </script>
</body>
</html>`;
}
