import { KNIGHT_SHEET_DATA_URI } from "./knightSheetBase64";

/**
 * Builds a 100% self-contained, offline-ready HTML5 Canvas game ("Blade Rift")
 * with crisp pixel-art knight spritesheet animations, virtual touch joystick + Dash/Slash button
 * for mobile phones, and full WASD/Arrows + Spacebar/Shift keyboard controls for browsers.
 */
export function buildBladeRiftHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Blade Rift</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      touch-action: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
  (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const KNIGHT_SRC = ${JSON.stringify(KNIGHT_SHEET_DATA_URI)};
    const knightImg = new Image();
    let knightReady = false;
    knightImg.onload = () => { knightReady = true; };
    knightImg.src = KNIGHT_SRC;

    // --- CONSTANTS ---
    const WORLD_W = 2400;
    const WORLD_H = 1600;
    const MAX_BLADES = 15;
    const MAX_LEVEL = 10;
    const FRAME_W = 64;
    const FRAME_H = 64;
    const DIR_ROW = { down: 0, right: 1, left: 2, up: 3 };

    const LEVEL_COLORS = [
      '#ffffff', '#7bed9f', '#70a1ff', '#a29bfe', '#fffa65',
      '#ffaf40', '#ff4d4d', '#ff6b81', '#18dcff', '#f368e0'
    ];

    const REALMS = [
      {
        name: 'Verdant Reach',
        bg: '#0c1622',
        grid: 'rgba(103, 242, 192, 0.10)',
        accent: '#67f2c0',
        portal: { x: 1850, y: 1180 },
        entry: { x: 1200, y: 800 },
        spawnDelay: 2.5,
        enemyCap: 6,
        minBlades: 3,
        maxBlades: 6,
        enemySpeed: 108,
        levelOffset: 0
      },
      {
        name: 'Ashen Rift',
        bg: '#1c1028',
        grid: 'rgba(255, 138, 102, 0.11)',
        accent: '#ff8a66',
        portal: { x: 550, y: 420 },
        entry: { x: 1200, y: 800 },
        spawnDelay: 1.85,
        enemyCap: 9,
        minBlades: 5,
        maxBlades: 9,
        enemySpeed: 144,
        levelOffset: 1
      },
      {
        name: 'Astral Void',
        bg: '#110c29',
        grid: 'rgba(167, 139, 250, 0.12)',
        accent: '#a78bfa',
        portal: { x: 1900, y: 420 },
        entry: { x: 1200, y: 800 },
        spawnDelay: 1.45,
        enemyCap: 11,
        minBlades: 6,
        maxBlades: 11,
        enemySpeed: 168,
        levelOffset: 2
      }
    ];

    // --- WEB AUDIO SYNTH SFX ---
    let audioCtx = null;
    let soundMuted = false;
    function unlockAudio() {
      if (soundMuted) return;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    }
    function playTone(freq, endFreq, dur, type = 'triangle', vol = 0.08) {
      if (soundMuted || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + dur);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur);
      } catch {}
    }

    // --- VIEWPORT & DPI ---
    let viewW = 1280;
    let viewH = 720;
    let dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth || 1280;
      viewH = window.innerHeight || 720;
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- INPUT STATE ---
    const keys = {};
    window.addEventListener('keydown', (e) => {
      unlockAudio();
      keys[e.code] = true;
      if ((e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && state.screen === 'playing') {
        e.preventDefault();
        triggerDash();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        if (state.screen === 'title' || state.screen === 'gameover') {
          startGame();
        }
      }
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    const joystick = {
      active: false,
      pointerId: null,
      baseX: 96,
      baseY: 0,
      thumbX: 96,
      thumbY: 0,
      radius: 54,
      ax: 0,
      ay: 0
    };

    function getDashBtnCenter() {
      return { x: viewW - 86, y: viewH - 96, r: 40 };
    }
    function getMuteBtnRect() {
      return { x: viewW - 52, y: 18, w: 36, h: 36 };
    }
    function getExitBtnRect() {
      return { x: viewW - 96, y: 18, w: 36, h: 36 };
    }

    canvas.addEventListener('pointerdown', (e) => {
      unlockAudio();
      const px = e.clientX;
      const py = e.clientY;

      // Mute toggle
      const mb = getMuteBtnRect();
      if (px >= mb.x && px <= mb.x + mb.w && py >= mb.y && py <= mb.y + mb.h) {
        soundMuted = !soundMuted;
        return;
      }

      // Exit to app button
      const eb = getExitBtnRect();
      if (px >= eb.x && px <= eb.x + eb.w && py >= eb.y && py <= eb.y + eb.h) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_GAME' }));
        } else if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        }
        return;
      }

      if (state.screen === 'title' || state.screen === 'gameover') {
        startGame();
        return;
      }

      // Dash button hit test
      const db = getDashBtnCenter();
      if (Math.hypot(px - db.x, py - db.y) <= db.r + 16) {
        triggerDash();
        return;
      }

      // Dynamic left-side virtual joystick
      if (px <= viewW * 0.55 && !joystick.active) {
        joystick.active = true;
        joystick.pointerId = e.pointerId;
        joystick.baseX = Math.max(66, Math.min(viewW * 0.42, px));
        joystick.baseY = Math.max(120, Math.min(viewH - 68, py));
        joystick.thumbX = joystick.baseX;
        joystick.thumbY = joystick.baseY;
        joystick.ax = 0;
        joystick.ay = 0;
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (joystick.active && e.pointerId === joystick.pointerId) {
        const dx = e.clientX - joystick.baseX;
        const dy = e.clientY - joystick.baseY;
        const dist = Math.min(Math.hypot(dx, dy), joystick.radius);
        const ang = Math.atan2(dy, dx);
        joystick.thumbX = joystick.baseX + Math.cos(ang) * dist;
        joystick.thumbY = joystick.baseY + Math.sin(ang) * dist;
        joystick.ax = (joystick.thumbX - joystick.baseX) / joystick.radius;
        joystick.ay = (joystick.thumbY - joystick.baseY) / joystick.radius;
      }
    });

    function releasePointer(e) {
      if (joystick.active && e.pointerId === joystick.pointerId) {
        joystick.active = false;
        joystick.pointerId = null;
        joystick.ax = 0;
        joystick.ay = 0;
      }
    }
    canvas.addEventListener('pointerup', releasePointer);
    canvas.addEventListener('pointercancel', releasePointer);

    // --- GAME STATE ---
    let bestScore = 0;
    try { bestScore = Number(localStorage.getItem('blade_rift_best') || 0); } catch {}

    const state = {
      screen: 'title', // 'title' | 'playing' | 'gameover'
      realmIndex: 0,
      survivalTime: 0,
      score: 0,
      kills: 0,
      combo: 0,
      comboTimer: 0,
      bossKills: 0,
      nextBossAt: 35,
      spawnTimer: 0,
      pickupTimer: 0,
      shakeTime: 0,
      shakeMag: 0,
      flashAlpha: 0,
      flashColor: '#ffffff',
      transitionAlpha: 0,
      transitionDir: 0,
      bannerText: '',
      bannerTimer: 0,
      camX: WORLD_W / 2,
      camY: WORLD_H / 2,
      player: null,
      enemies: [],
      pickups: [],
      particles: [],
      popups: []
    };

    function createPlayer() {
      return {
        x: WORLD_W / 2,
        y: WORLD_H / 2,
        vx: 0,
        vy: 0,
        radius: 18,
        bladeLevel: 1,
        bladeCount: 4,
        orbitAngle: 0,
        orbitRadius: 62,
        facing: 'down',
        animTime: 0,
        isMoving: false,
        dashTimer: 0,
        dashCooldown: 0,
        dashDirX: 0,
        dashDirY: 1,
        slashTimer: 0,
        invulnTimer: 0,
        damageReadyAt: 0
      };
    }

    function startGame() {
      state.screen = 'playing';
      state.realmIndex = 0;
      state.survivalTime = 0;
      state.score = 0;
      state.kills = 0;
      state.combo = 0;
      state.comboTimer = 0;
      state.bossKills = 0;
      state.nextBossAt = 35;
      state.spawnTimer = 0.8;
      state.pickupTimer = 0.5;
      state.shakeTime = 0;
      state.flashAlpha = 0;
      state.transitionAlpha = 0;
      state.transitionDir = 0;
      state.bannerText = 'REALM 01: VERDANT REACH';
      state.bannerTimer = 2.4;
      state.player = createPlayer();
      state.camX = state.player.x - viewW / 2;
      state.camY = state.player.y - viewH / 2;
      state.enemies = [];
      state.pickups = [];
      state.particles = [];
      state.popups = [];

      for (let i = 0; i < 8; i++) {
        spawnPickup(
          state.player.x + (Math.random() - 0.5) * 560,
          state.player.y + (Math.random() - 0.5) * 420
        );
      }
      spawnEnemy('stalker');
      playTone(320, 640, 0.18, 'triangle', 0.08);
    }

    function triggerDash() {
      const p = state.player;
      if (!p || p.dashCooldown > 0 || state.transitionDir !== 0) return;
      p.dashTimer = 0.19;
      p.dashCooldown = 1.6;
      p.slashTimer = 0.28;
      p.invulnTimer = 0.26;

      let dx = p.vx;
      let dy = p.vy;
      if (Math.hypot(dx, dy) < 10) {
        const fMap = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
        [dx, dy] = fMap[p.facing] || [0, 1];
      }
      const len = Math.hypot(dx, dy) || 1;
      p.dashDirX = dx / len;
      p.dashDirY = dy / len;
      spawnBurst(p.x, p.y, LEVEL_COLORS[p.bladeLevel - 1], 12, 160);
      playTone(460, 180, 0.14, 'sawtooth', 0.07);
    }

    function spawnPickup(x, y, isRelic = false) {
      if (state.pickups.length >= 18 && !isRelic) return;
      const px = Math.max(48, Math.min(WORLD_W - 48, x ?? (48 + Math.random() * (WORLD_W - 96))));
      const py = Math.max(48, Math.min(WORLD_H - 48, y ?? (48 + Math.random() * (WORLD_H - 96))));
      state.pickups.push({
        x: px,
        y: py,
        r: isRelic ? 14 : 10,
        isRelic,
        phase: Math.random() * Math.PI * 2
      });
    }

    function spawnEnemy(forcedType) {
      const realm = REALMS[state.realmIndex];
      const tier = Math.min(4, Math.floor(state.survivalTime / 40));
      const cap = Math.min(13, realm.enemyCap + tier);
      if (!forcedType && state.enemies.length >= cap) return;

      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (edge === 0) { x = Math.random() * WORLD_W; y = -30; }
      else if (edge === 1) { x = WORLD_W + 30; y = Math.random() * WORLD_H; }
      else if (edge === 2) { x = Math.random() * WORLD_W; y = WORLD_H + 30; }
      else { x = -30; y = Math.random() * WORLD_H; }

      const roll = Math.random();
      const type = forcedType || (roll < 0.28 && state.survivalTime > 12 ? 'charger' : 'stalker');
      const p = state.player;
      const minLv = Math.max(1, p.bladeLevel + realm.levelOffset - 1);
      const maxLv = Math.min(MAX_LEVEL, p.bladeLevel + realm.levelOffset + 1 + tier);
      const bladeLevel = type === 'boss'
        ? Math.min(MAX_LEVEL, p.bladeLevel + 1 + realm.levelOffset)
        : Math.floor(minLv + Math.random() * (maxLv - minLv + 1));

      const bladeCount = type === 'boss'
        ? Math.min(12, 7 + tier)
        : Math.floor(realm.minBlades + Math.random() * (Math.min(11, realm.maxBlades + tier) - realm.minBlades + 1));

      state.enemies.push({
        type,
        x,
        y,
        radius: type === 'boss' ? 30 : 20,
        bladeLevel,
        bladeCount,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: type === 'boss' ? 78 : 54,
        speed: type === 'boss' ? realm.enemySpeed * 0.92 : realm.enemySpeed + Math.min(42, tier * 8),
        chargeCooldown: 2.5 + Math.random() * 1.5,
        windupTimer: 0,
        lungeTimer: 0,
        lungeVx: 0,
        lungeVy: 0,
        hitFlash: 0,
        clashCooldown: 0
      });

      if (type === 'boss') {
        state.bannerText = 'WARNING: RIFT WARDEN APPEARED!';
        state.bannerTimer = 2.6;
        state.shakeTime = 0.3;
        state.shakeMag = 7;
        playTone(150, 90, 0.35, 'sawtooth', 0.1);
      }
    }

    function addBlades(amount) {
      const p = state.player;
      for (let i = 0; i < amount; i++) {
        if (p.bladeCount >= MAX_BLADES) {
          state.score += 25;
          continue;
        }
        p.bladeCount++;
        if (p.bladeCount >= 5 && p.bladeLevel < MAX_LEVEL) {
          p.bladeLevel++;
          p.bladeCount = 5;
          state.flashAlpha = 0.45;
          state.flashColor = LEVEL_COLORS[p.bladeLevel - 1];
          addPopup(p.x, p.y - 44, 'LEVEL ' + p.bladeLevel + '!', LEVEL_COLORS[p.bladeLevel - 1], 18);
          playTone(440, 880, 0.24, 'triangle', 0.1);
        }
      }
    }

    function spawnBurst(x, y, color, count = 10, speed = 130) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (0.35 + Math.random() * 0.85) * speed;
        state.particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6,
          size: 2 + Math.random() * 3.5,
          color
        });
      }
    }

    function addPopup(x, y, text, color = '#ffffff', size = 13) {
      state.popups.push({ x, y, text, color, size, life: 0.9, maxLife: 0.9 });
    }

    function killEnemy(idx) {
      const e = state.enemies[idx];
      state.enemies.splice(idx, 1);
      state.kills++;
      state.combo++;
      state.comboTimer = 4.0;
      const mult = Math.min(5, 1 + Math.floor(state.combo / 3));
      const pts = (e.type === 'boss' ? 350 : 60) * mult;
      state.score += pts;
      if (e.type === 'boss') {
        state.bossKills++;
        spawnPickup(e.x, e.y, true);
      } else {
        spawnPickup(e.x - 14, e.y);
        spawnPickup(e.x + 14, e.y);
      }
      spawnBurst(e.x, e.y, e.type === 'boss' ? '#f368e0' : '#ff6b81', e.type === 'boss' ? 28 : 16, 200);
      addPopup(e.x, e.y - 26, '+' + pts + (mult > 1 ? ' x' + mult : ''), '#ffe066', e.type === 'boss' ? 18 : 13);
      playTone(260, 520, 0.12, 'triangle', 0.08);
    }

    function getBladePositions(entity) {
      const list = [];
      const count = entity.bladeCount;
      if (count <= 0) return list;
      const step = (Math.PI * 2) / count;
      for (let i = 0; i < count; i++) {
        const ang = entity.orbitAngle + i * step;
        list.push({
          x: entity.x + Math.cos(ang) * entity.orbitRadius,
          y: entity.y + Math.sin(ang) * entity.orbitRadius,
          ang
        });
      }
      return list;
    }

    function enterPortal() {
      if (state.transitionDir !== 0) return;
      state.transitionDir = 1;
      state.transitionAlpha = 0;
      playTone(300, 750, 0.28, 'sine', 0.09);
    }

    function completeRealmWarp() {
      state.realmIndex = (state.realmIndex + 1) % REALMS.length;
      const realm = REALMS[state.realmIndex];
      state.player.x = realm.entry.x;
      state.player.y = realm.entry.y;
      state.player.vx = 0;
      state.player.vy = 0;
      state.enemies = [];
      state.pickups = [];
      state.score += 150;
      state.bannerText = 'REALM 0' + (state.realmIndex + 1) + ': ' + realm.name.toUpperCase();
      state.bannerTimer = 2.4;
      for (let i = 0; i < 6; i++) {
        spawnPickup(
          state.player.x + (Math.random() - 0.5) * 440,
          state.player.y + (Math.random() - 0.5) * 320
        );
      }
      spawnEnemy('stalker');
      state.transitionDir = -1;
    }

    function triggerGameOver() {
      state.screen = 'gameover';
      if (state.score > bestScore) {
        bestScore = state.score;
        try { localStorage.setItem('blade_rift_best', String(bestScore)); } catch {}
      }
      playTone(220, 70, 0.4, 'sawtooth', 0.11);
    }

    // --- UPDATE LOOP ---
    function update(dt) {
      if (state.screen !== 'playing') return;

      // Realm fade transition
      if (state.transitionDir === 1) {
        state.transitionAlpha += dt * 3.5;
        if (state.transitionAlpha >= 1) {
          state.transitionAlpha = 1;
          completeRealmWarp();
        }
        return;
      } else if (state.transitionDir === -1) {
        state.transitionAlpha -= dt * 3.0;
        if (state.transitionAlpha <= 0) {
          state.transitionAlpha = 0;
          state.transitionDir = 0;
        }
      }

      const p = state.player;
      const realm = REALMS[state.realmIndex];

      state.survivalTime += dt;
      if (state.survivalTime >= state.nextBossAt) {
        state.nextBossAt += 45;
        spawnEnemy('boss');
      }

      if (state.comboTimer > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0) state.combo = 0;
      }
      if (state.bannerTimer > 0) state.bannerTimer -= dt;
      if (state.shakeTime > 0) state.shakeTime -= dt;
      if (state.flashAlpha > 0) state.flashAlpha = Math.max(0, state.flashAlpha - dt * 1.8);

      // Spawners
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        state.spawnTimer = realm.spawnDelay;
        spawnEnemy();
      }
      state.pickupTimer -= dt;
      if (state.pickupTimer <= 0) {
        state.pickupTimer = 1.35;
        spawnPickup();
      }

      // Player movement
      if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
      if (p.slashTimer > 0) p.slashTimer = Math.max(0, p.slashTimer - dt);
      if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
      if (p.damageReadyAt > 0) p.damageReadyAt = Math.max(0, p.damageReadyAt - dt);

      const moveSpeed = 235;
      if (p.dashTimer > 0) {
        p.dashTimer -= dt;
        p.vx = p.dashDirX * 620;
        p.vy = p.dashDirY * 620;
        p.isMoving = true;
      } else {
        let ix = 0, iy = 0;
        if (joystick.active && (Math.abs(joystick.ax) > 0.08 || Math.abs(joystick.ay) > 0.08)) {
          ix = joystick.ax;
          iy = joystick.ay;
        } else {
          if (keys.KeyA || keys.ArrowLeft) ix -= 1;
          if (keys.KeyD || keys.ArrowRight) ix += 1;
          if (keys.KeyW || keys.ArrowUp) iy -= 1;
          if (keys.KeyS || keys.ArrowDown) iy += 1;
        }
        const len = Math.hypot(ix, iy);
        if (len > 0.01) {
          const norm = Math.min(1, len);
          p.vx = (ix / len) * moveSpeed * norm;
          p.vy = (iy / len) * moveSpeed * norm;
          p.isMoving = true;
          if (Math.abs(p.vx) > Math.abs(p.vy)) p.facing = p.vx < 0 ? 'left' : 'right';
          else p.facing = p.vy < 0 ? 'up' : 'down';
        } else {
          p.vx = 0;
          p.vy = 0;
          p.isMoving = false;
        }
      }

      p.x = Math.max(24, Math.min(WORLD_W - 24, p.x + p.vx * dt));
      p.y = Math.max(24, Math.min(WORLD_H - 24, p.y + p.vy * dt));
      p.animTime += dt;
      p.orbitAngle += (3.1 + p.bladeLevel * 0.42) * dt;

      // Smooth camera follow
      const targetCamX = Math.max(0, Math.min(WORLD_W - viewW, p.x - viewW / 2));
      const targetCamY = Math.max(0, Math.min(WORLD_H - viewH, p.y - viewH / 2));
      state.camX += (targetCamX - state.camX) * Math.min(1, dt * 8);
      state.camY += (targetCamY - state.camY) * Math.min(1, dt * 8);

      // Pickups
      for (let i = state.pickups.length - 1; i >= 0; i--) {
        const orb = state.pickups[i];
        orb.phase += dt * 4;
        const d = Math.hypot(orb.x - p.x, orb.y - p.y);
        // Subtle magnet pull
        if (d < 95) {
          orb.x += ((p.x - orb.x) / (d || 1)) * 220 * dt;
          orb.y += ((p.y - orb.y) / (d || 1)) * 220 * dt;
        }
        if (d < p.radius + orb.r + 6) {
          state.pickups.splice(i, 1);
          addBlades(orb.isRelic ? 3 : 1);
          state.score += orb.isRelic ? 100 : 15;
          spawnBurst(orb.x, orb.y, orb.isRelic ? '#ffd166' : '#00ffcc', 8, 110);
          playTone(580, 820, 0.08, 'sine', 0.06);
        }
      }

      // Portal check
      if (Math.hypot(p.x - realm.portal.x, p.y - realm.portal.y) < 52) {
        enterPortal();
        return;
      }

      const pBlades = getBladePositions(p);

      // Enemies update & collisions
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.clashCooldown > 0) e.clashCooldown -= dt;

        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (e.type === 'charger') {
          if (e.lungeTimer > 0) {
            e.lungeTimer -= dt;
            e.x += e.lungeVx * dt;
            e.y += e.lungeVy * dt;
          } else if (e.windupTimer > 0) {
            e.windupTimer -= dt;
            if (e.windupTimer <= 0) {
              e.lungeTimer = 0.42;
              e.lungeVx = (dx / dist) * 420;
              e.lungeVy = (dy / dist) * 420;
            }
          } else {
            e.chargeCooldown -= dt;
            if (e.chargeCooldown <= 0 && dist < 340) {
              e.windupTimer = 0.55;
              e.chargeCooldown = 3.2;
            } else {
              e.x += (dx / dist) * e.speed * dt;
              e.y += (dy / dist) * e.speed * dt;
            }
          }
        } else {
          e.x += (dx / dist) * e.speed * dt;
          e.y += (dy / dist) * e.speed * dt;
        }

        e.orbitAngle += (2.8 + e.bladeLevel * 0.35) * dt;

        // Dash slash direct hit
        if (p.slashTimer > 0 && dist < p.orbitRadius + e.radius + 14 && e.hitFlash <= 0) {
          e.hitFlash = 0.22;
          e.bladeCount = Math.max(0, e.bladeCount - 2);
          spawnBurst(e.x, e.y, '#ffffff', 8, 150);
          if (e.bladeCount <= 0) {
            killEnemy(i);
            continue;
          }
        }

        const eBlades = getBladePositions(e);
        let removedEnemy = false;

        // Blade vs Blade clash
        if (e.clashCooldown <= 0) {
          outer: for (const pb of pBlades) {
            for (const eb of eBlades) {
              if (Math.hypot(pb.x - eb.x, pb.y - eb.y) < 22) {
                e.clashCooldown = 0.16;
                spawnBurst((pb.x + eb.x) / 2, (pb.y + eb.y) / 2, '#ffe066', 6, 120);
                playTone(720, 420, 0.05, 'square', 0.04);
                if (p.bladeLevel > e.bladeLevel) {
                  e.bladeCount--;
                  e.hitFlash = 0.15;
                } else if (e.bladeLevel > p.bladeLevel && p.invulnTimer <= 0) {
                  p.bladeCount = Math.max(0, p.bladeCount - 1);
                  state.shakeTime = 0.12;
                  state.shakeMag = 4;
                } else {
                  e.bladeCount--;
                  if (p.invulnTimer <= 0) p.bladeCount = Math.max(0, p.bladeCount - 1);
                }
                if (e.bladeCount <= 0) {
                  killEnemy(i);
                  removedEnemy = true;
                }
                break outer;
              }
            }
          }
        }
        if (removedEnemy) continue;

        // Player blade hits exposed enemy
        if (e.bladeCount <= 0) {
          for (const pb of pBlades) {
            if (Math.hypot(pb.x - e.x, pb.y - e.y) < e.radius + 14) {
              killEnemy(i);
              removedEnemy = true;
              break;
            }
          }
        }
        if (removedEnemy) continue;

        // Enemy blade hits player
        if (p.invulnTimer <= 0 && p.damageReadyAt <= 0) {
          for (const eb of eBlades) {
            if (Math.hypot(eb.x - p.x, eb.y - p.y) < p.radius + 12) {
              p.damageReadyAt = 0.65;
              state.shakeTime = 0.16;
              state.shakeMag = 6;
              playTone(160, 90, 0.15, 'sawtooth', 0.09);
              if (p.bladeCount > 0) {
                p.bladeCount--;
                addPopup(p.x, p.y - 30, '-1 BLADE', '#ff7285', 13);
              } else {
                triggerGameOver();
                return;
              }
              break;
            }
          }
        }
      }

      // Particles & popups
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) state.particles.splice(i, 1);
      }
      for (let i = state.popups.length - 1; i >= 0; i--) {
        const pop = state.popups[i];
        pop.y -= 36 * dt;
        pop.life -= dt;
        if (pop.life <= 0) state.popups.splice(i, 1);
      }
    }

    // --- RENDER ---
    function drawBlade(x, y, ang, color, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang + Math.PI / 2);
      ctx.scale(scale, scale);
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(10, 4);
      ctx.lineTo(0, 14);
      ctx.lineTo(-10, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawPlayer() {
      const p = state.player;
      if (p.damageReadyAt > 0 && Math.floor(p.damageReadyAt * 16) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      // Slash arc effect
      if (p.slashTimer > 0) {
        ctx.save();
        ctx.strokeStyle = LEVEL_COLORS[p.bladeLevel - 1];
        ctx.lineWidth = 4;
        ctx.globalAlpha = p.slashTimer / 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.orbitRadius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (knightReady) {
        const row = DIR_ROW[p.facing] || 0;
        let col = 0;
        if (p.slashTimer > 0) {
          col = 3 + (Math.floor((0.28 - p.slashTimer) * 16) % 4);
        } else if (p.isMoving) {
          col = Math.floor(p.animTime * 9) % 3;
        }
        const drawSize = FRAME_W * 1.25;
        ctx.drawImage(
          knightImg,
          col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H,
          p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize
        );
      } else {
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const bColor = LEVEL_COLORS[p.bladeLevel - 1];
      const bScale = 0.78 + p.bladeLevel * 0.055;
      for (const b of getBladePositions(p)) {
        drawBlade(b.x, b.y, b.ang, bColor, bScale);
      }
    }

    function render() {
      const realm = REALMS[state.realmIndex];
      ctx.fillStyle = realm.bg;
      ctx.fillRect(0, 0, viewW, viewH);

      if (state.player) {
        ctx.save();
        let sx = 0, sy = 0;
        if (state.shakeTime > 0) {
          sx = (Math.random() - 0.5) * state.shakeMag * 2;
          sy = (Math.random() - 0.5) * state.shakeMag * 2;
        }
        ctx.translate(-state.camX + sx, -state.camY + sy);

        // Floor grid
        const tileSize = 128;
        const startX = Math.floor(state.camX / tileSize) * tileSize;
        const startY = Math.floor(state.camY / tileSize) * tileSize;
        ctx.strokeStyle = realm.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = startX; gx <= state.camX + viewW + tileSize; gx += tileSize) {
          if (gx < 0 || gx > WORLD_W) continue;
          ctx.moveTo(gx, Math.max(0, state.camY));
          ctx.lineTo(gx, Math.min(WORLD_H, state.camY + viewH));
        }
        for (let gy = startY; gy <= state.camY + viewH + tileSize; gy += tileSize) {
          if (gy < 0 || gy > WORLD_H) continue;
          ctx.moveTo(Math.max(0, state.camX), gy);
          ctx.lineTo(Math.min(WORLD_W, state.camX + viewW), gy);
        }
        ctx.stroke();

        // Arena border
        ctx.strokeStyle = realm.accent;
        ctx.lineWidth = 5;
        ctx.strokeRect(4, 4, WORLD_W - 8, WORLD_H - 8);

        // Portal
        const pr = realm.portal;
        const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.1;
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = realm.accent;
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#151324';
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = realm.accent;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        const nextRealm = REALMS[(state.realmIndex + 1) % REALMS.length];
        ctx.fillText('ENTER ' + nextRealm.name.toUpperCase(), pr.x, pr.y + 62);

        // Pickups
        for (const orb of state.pickups) {
          const s = 1 + Math.sin(orb.phase) * 0.18;
          ctx.save();
          ctx.translate(orb.x, orb.y);
          ctx.scale(s, s);
          ctx.shadowColor = orb.isRelic ? '#ffd166' : '#00ffcc';
          ctx.shadowBlur = 12;
          ctx.fillStyle = orb.isRelic ? '#ffd166' : '#00ffcc';
          ctx.beginPath();
          ctx.arc(0, 0, orb.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        // Enemies
        for (const e of state.enemies) {
          if (e.windupTimer > 0) {
            ctx.strokeStyle = 'rgba(255, 107, 129, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius + 14 * (e.windupTimer / 0.55), 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.save();
          ctx.fillStyle = e.hitFlash > 0
            ? '#ffffff'
            : e.type === 'boss'
              ? '#8b5cf6'
              : e.type === 'charger'
                ? '#f97316'
                : '#e11d48';
          const sz = e.radius * 2;
          ctx.beginPath();
          ctx.roundRect(e.x - e.radius, e.y - e.radius, sz, sz, e.type === 'boss' ? 14 : 10);
          ctx.fill();
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = '#ffe4e6';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((e.type === 'boss' ? 'BOSS ' : '') + 'Lv.' + e.bladeLevel, e.x, e.y - e.radius - 10);

          const eColor = LEVEL_COLORS[e.bladeLevel - 1];
          const eScale = 0.72 + e.bladeLevel * 0.05;
          for (const b of getBladePositions(e)) {
            drawBlade(b.x, b.y, b.ang, eColor, eScale);
          }
        }

        // Player
        drawPlayer();

        // Particles & Popups
        for (const pt of state.particles) {
          ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (const pop of state.popups) {
          ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
          ctx.fillStyle = pop.color;
          ctx.font = 'bold ' + pop.size + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pop.text, pop.x, pop.y);
        }
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      // Flash & Transition overlays
      if (state.flashAlpha > 0) {
        ctx.fillStyle = state.flashColor;
        ctx.globalAlpha = state.flashAlpha;
        ctx.fillRect(0, 0, viewW, viewH);
        ctx.globalAlpha = 1;
      }
      if (state.transitionAlpha > 0) {
        ctx.fillStyle = '#090d16';
        ctx.globalAlpha = state.transitionAlpha;
        ctx.fillRect(0, 0, viewW, viewH);
        ctx.globalAlpha = 1;
      }

      // --- HUD (Glassmorphic Top-Left) ---
      if (state.screen === 'playing' && state.player) {
        const p = state.player;
        const hudW = Math.min(300, viewW - 126);
        ctx.fillStyle = 'rgba(12, 18, 32, 0.78)';
        ctx.strokeStyle = realm.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(14, 14, hudW, 76, 14);
        ctx.fill();
        ctx.stroke();

        const mins = String(Math.floor(state.survivalTime / 60)).padStart(2, '0');
        const secs = String(Math.floor(state.survivalTime % 60)).padStart(2, '0');
        ctx.fillStyle = realm.accent;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('R0' + (state.realmIndex + 1) + ' • ' + realm.name.toUpperCase(), 26, 34);
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'right';
        ctx.fillText(mins + ':' + secs, 14 + hudW - 12, 34);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('LV ' + p.bladeLevel + '  •  BLADES ' + p.bladeCount + '/' + MAX_BLADES, 26, 57);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px sans-serif';
        ctx.fillText('SCORE ' + state.score + (state.combo > 1 ? '  (' + state.combo + ' COMBO)' : ''), 26, 77);

        // Minimap (below exit/mute buttons on top-right)
        const mmW = 92, mmH = 62;
        const mmX = viewW - mmW - 14, mmY = 64;
        ctx.fillStyle = 'rgba(12, 18, 32, 0.75)';
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mmX, mmY, mmW, mmH, 8);
        ctx.fill();
        ctx.stroke();
        // Portal dot
        ctx.fillStyle = realm.accent;
        ctx.beginPath();
        ctx.arc(mmX + (realm.portal.x / WORLD_W) * mmW, mmY + (realm.portal.y / WORLD_H) * mmH, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Enemy dots
        for (const e of state.enemies) {
          ctx.fillStyle = e.type === 'boss' ? '#c084fc' : '#fb7185';
          ctx.fillRect(mmX + (e.x / WORLD_W) * mmW - 1.5, mmY + (e.y / WORLD_H) * mmH - 1.5, 3, 3);
        }
        // Player dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mmX + (p.x / WORLD_W) * mmW, mmY + (p.y / WORLD_H) * mmH, 3, 0, Math.PI * 2);
        ctx.fill();

        // Banner
        if (state.bannerTimer > 0) {
          ctx.globalAlpha = Math.min(1, state.bannerTimer);
          ctx.fillStyle = 'rgba(12, 18, 32, 0.85)';
          ctx.beginPath();
          ctx.roundRect(viewW / 2 - 150, 102, 300, 34, 17);
          ctx.fill();
          ctx.fillStyle = realm.accent;
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(state.bannerText, viewW / 2, 123);
          ctx.globalAlpha = 1;
        }

        // Virtual Joystick indicator
        if (joystick.active) {
          ctx.fillStyle = 'rgba(255,255,255,0.14)';
          ctx.strokeStyle = 'rgba(255,255,255,0.42)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.68)';
          ctx.beginPath();
          ctx.arc(joystick.thumbX, joystick.thumbY, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dash / Slash Action Button (bottom-right)
        const db = getDashBtnCenter();
        const ready = p.dashCooldown <= 0;
        ctx.fillStyle = ready ? 'rgba(124, 58, 237, 0.88)' : 'rgba(30, 41, 59, 0.78)';
        ctx.strokeStyle = ready ? '#c4b5fd' : 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(db.x, db.y, db.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ready ? 'DASH' : p.dashCooldown.toFixed(1) + 's', db.x, db.y + 4);
      }

      // Top-right Mute & Exit buttons
      const mb = getMuteBtnRect();
      const eb = getExitBtnRect();
      [
        { rect: eb, label: '✕' },
        { rect: mb, label: soundMuted ? '🔇' : '🔊' }
      ].forEach(({ rect, label }) => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.strokeStyle = 'rgba(255,255,255,0.24)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, rect.x + rect.w / 2, rect.y + 23);
      });

      // Title / Game Over Modal
      if (state.screen === 'title' || state.screen === 'gameover') {
        ctx.fillStyle = 'rgba(9, 13, 22, 0.72)';
        ctx.fillRect(0, 0, viewW, viewH);

        const cardW = Math.min(340, viewW - 40);
        const cardH = state.screen === 'gameover' ? 250 : 230;
        const cx = (viewW - cardW) / 2;
        const cy = (viewH - cardH) / 2;

        ctx.fillStyle = 'rgba(18, 24, 42, 0.94)';
        ctx.strokeStyle = state.screen === 'gameover' ? '#fb7185' : '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = state.screen === 'gameover' ? '#fb7185' : '#c4b5fd';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'RIFT FALLEN' : 'BLADE RIFT', viewW / 2, cy + 52);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px sans-serif';
        if (state.screen === 'gameover') {
          ctx.fillText('Score: ' + state.score + '   •   Best: ' + bestScore, viewW / 2, cy + 92);
          ctx.fillText('Kills: ' + state.kills + '   •   Time: ' + Math.floor(state.survivalTime) + 's', viewW / 2, cy + 118);
        } else {
          ctx.fillText('Drag left side / WASD to move', viewW / 2, cy + 92);
          ctx.fillText('DASH / Space to slash • Enter Rifts to warp', viewW / 2, cy + 118);
          ctx.fillText('Best Score: ' + bestScore, viewW / 2, cy + 144);
        }

        // Start / Retry Button
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.roundRect(viewW / 2 - 90, cy + cardH - 68, 180, 44, 14);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(state.screen === 'gameover' ? 'PLAY AGAIN' : 'TAP TO PLAY', viewW / 2, cy + cardH - 41);
      }
    }

    let lastTime = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      update(dt);
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();
  </script>
</body>
</html>`;
}
