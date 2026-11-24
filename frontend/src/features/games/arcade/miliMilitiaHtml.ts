export function buildMiliMilitiaHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<title>Mili Militia</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0b0f14; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; }
  canvas { display: block; width: 100%; height: 100%; touch-action: none; }
</style>
</head>
<body>
<canvas id="game"></canvas>
<script>
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Audio Synth
  let audioCtx = null;
  let muted = false;
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  }
  function playTone(freq, dur, type = 'square', vol = 0.08, slide = 0) {
    if (muted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }
  function playNoise(dur, vol = 0.1) {
    if (muted || !audioCtx) return;
    const len = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const gain = audioCtx.createGain();
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
  }

  // World & Platforms
  const WORLD_W = 2200;
  const WORLD_H = 1200;
  const GRAVITY = 960;

  const PLATFORMS = [
    // Ground floor
    { x: 0, y: 1120, w: 2200, h: 80, kind: 'ground' },
    // Left bunker
    { x: 120, y: 920, w: 280, h: 24, kind: 'steel' },
    { x: 80, y: 720, w: 240, h: 24, kind: 'steel' },
    { x: 260, y: 510, w: 260, h: 24, kind: 'steel' },
    // Center bridge & tower
    { x: 600, y: 950, w: 300, h: 24, kind: 'steel' },
    { x: 960, y: 800, w: 280, h: 24, kind: 'steel' },
    { x: 760, y: 610, w: 240, h: 24, kind: 'steel' },
    { x: 1180, y: 580, w: 260, h: 24, kind: 'steel' },
    { x: 960, y: 380, w: 280, h: 24, kind: 'steel' },
    // Right outpost
    { x: 1320, y: 950, w: 300, h: 24, kind: 'steel' },
    { x: 1680, y: 830, w: 260, h: 24, kind: 'steel' },
    { x: 1840, y: 620, w: 260, h: 24, kind: 'steel' },
    { x: 1580, y: 450, w: 240, h: 24, kind: 'steel' },
    // Cover pillars
    { x: 520, y: 1030, w: 36, h: 90, kind: 'crate' },
    { x: 1080, y: 710, w: 36, h: 90, kind: 'crate' },
    { x: 1620, y: 1030, w: 36, h: 90, kind: 'crate' },
  ];

  // Weapons
  const WEAPONS = {
    rifle: { name: 'ASSAULT', dmg: 18, rate: 0.13, speed: 980, spread: 0.05, pellets: 1, mag: 30, reload: 1.3, color: '#fbbf24', explosive: false },
    shotgun: { name: 'SHOTGUN', dmg: 14, rate: 0.58, speed: 820, spread: 0.22, pellets: 5, mag: 8, reload: 1.5, color: '#fb923c', explosive: false },
    sniper: { name: 'RAILGUN', dmg: 65, rate: 0.85, speed: 1500, spread: 0.01, pellets: 1, mag: 5, reload: 1.8, color: '#38bdf8', explosive: false },
    rocket: { name: 'ROCKET', dmg: 80, rate: 1.05, speed: 580, spread: 0.02, pellets: 1, mag: 4, reload: 2.0, color: '#f43f5e', explosive: true },
  };
  const WEAPON_KEYS = ['rifle', 'shotgun', 'sniper', 'rocket'];

  // State
  const BEST_KEY = 'mili_militia_best';
  let bestScore = Number(localStorage.getItem(BEST_KEY) || '0');
  let screen = 'title'; // title | playing | gameover
  let score = 0;
  let kills = 0;
  let streak = 0;
  let wave = 1;
  let shake = 0;
  let lastTime = performance.now();

  let player = null;
  let bots = [];
  let bullets = [];
  let grenades = [];
  let particles = [];
  let pickups = [];
  let floatTexts = [];
  let cam = { x: 0, y: 0 };

  // Input
  const keys = {};
  let mouse = { x: W / 2, y: H / 2, down: false };
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let leftStick = { id: null, sx: 0, sy: 0, dx: 0, dy: 0 };
  let rightStick = { id: null, sx: 0, sy: 0, dx: 0, dy: 0, active: false };

  function makeSoldier(x, y, isPlayer) {
    return {
      x, y, vx: 0, vy: 0, w: 28, h: 42,
      hp: isPlayer ? 100 : 55 + wave * 8,
      maxHp: isPlayer ? 100 : 55 + wave * 8,
      fuel: 100,
      maxFuel: 100,
      aim: 0,
      onGround: false,
      isPlayer,
      weapon: isPlayer ? 'rifle' : (Math.random() < 0.25 ? 'shotgun' : 'rifle'),
      altWeapon: isPlayer ? 'shotgun' : null,
      ammo: WEAPONS.rifle.mag,
      reloading: 0,
      fireCd: 0,
      grenades: isPlayer ? 3 : 0,
      grenadeCd: 0,
      invuln: isPlayer ? 1.2 : 0.4,
      jetActive: false,
      aiTimer: 0,
      aiDir: Math.random() < 0.5 ? -1 : 1,
      aiJet: false,
    };
  }

  function spawnPickup(x, y, kind) {
    pickups.push({
      x, y, vy: -120,
      kind, // medkit | ammo | shotgun | sniper | rocket
      life: 22,
    });
  }

  function spawnBot() {
    const spots = [
      { x: 160, y: 650 }, { x: 1960, y: 550 }, { x: 1050, y: 310 },
      { x: 1850, y: 1040 }, { x: 260, y: 1040 }, { x: 1450, y: 880 },
    ];
    let spot = spots[Math.floor(Math.random() * spots.length)];
    if (player && Math.hypot(spot.x - player.x, spot.y - player.y) < 340) {
      spot = spots[(spots.indexOf(spot) + 2) % spots.length];
    }
    const b = makeSoldier(spot.x, spot.y, false);
    if (wave >= 3 && Math.random() < 0.25) b.weapon = 'rocket';
    else if (wave >= 2 && Math.random() < 0.3) b.weapon = 'sniper';
    b.ammo = WEAPONS[b.weapon].mag;
    bots.push(b);
  }

  function startGame() {
    ensureAudio();
    score = 0;
    kills = 0;
    streak = 0;
    wave = 1;
    shake = 0;
    player = makeSoldier(1100, 1020, true);
    bots = [];
    bullets = [];
    grenades = [];
    particles = [];
    pickups = [];
    floatTexts = [];
    for (let i = 0; i < 3; i++) spawnBot();
    spawnPickup(340, 480, 'sniper');
    spawnPickup(1700, 420, 'rocket');
    spawnPickup(1100, 760, 'medkit');
    screen = 'playing';
    playTone(440, 0.15, 'triangle', 0.1, 220);
  }

  function addParticles(x, y, color, count, speed = 220) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.3 + Math.random() * 0.7) * speed;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        r: 2 + Math.random() * 3.5,
        color,
        life: 0.25 + Math.random() * 0.45,
        maxLife: 0.7,
      });
    }
  }

  function addFloatText(x, y, text, color) {
    floatTexts.push({ x, y, text, color, life: 1.0 });
  }

  function explode(x, y, radius, maxDmg, fromPlayer) {
    shake = Math.max(shake, 11);
    playNoise(0.28, 0.16);
    playTone(90, 0.28, 'sawtooth', 0.12, -55);
    addParticles(x, y, '#f97316', 26, 360);
    addParticles(x, y, '#fef08a', 14, 240);

    const targets = fromPlayer ? bots : [player, ...bots];
    for (const t of targets) {
      if (!t || t.invuln > 0) continue;
      const d = Math.hypot(t.x - x, t.y - y);
      if (d < radius) {
        const dmg = Math.round(maxDmg * (1 - d / radius));
        damageSoldier(t, dmg, fromPlayer);
        const ang = Math.atan2(t.y - y, t.x - x);
        t.vx += Math.cos(ang) * 320;
        t.vy += Math.sin(ang) * 320 - 120;
      }
    }
  }

  function damageSoldier(s, dmg, fromPlayer) {
    if (!s || s.invuln > 0) return;
    s.hp -= dmg;
    addParticles(s.x, s.y, '#ef4444', 7, 160);
    addFloatText(s.x, s.y - 26, '-' + dmg, '#fca5a5');
    if (s.isPlayer) {
      shake = Math.max(shake, 7);
      playTone(150, 0.12, 'sawtooth', 0.1, -60);
    }
    if (s.hp <= 0) {
      if (s.isPlayer) {
        screen = 'gameover';
        if (score > bestScore) {
          bestScore = score;
          localStorage.setItem(BEST_KEY, String(bestScore));
        }
        playNoise(0.4, 0.2);
      } else {
        const idx = bots.indexOf(s);
        if (idx >= 0) bots.splice(idx, 1);
        addParticles(s.x, s.y, '#fb923c', 20, 260);
        if (fromPlayer) {
          kills += 1;
          streak += 1;
          const pts = 100 + Math.min(streak - 1, 5) * 25;
          score += pts;
          if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_KEY, String(bestScore));
          }
          addFloatText(s.x, s.y - 36, '+' + pts, '#fde047');
          playTone(620, 0.14, 'triangle', 0.1, 240);
        }
        // Drop pickup
        const roll = Math.random();
        if (roll < 0.35) spawnPickup(s.x, s.y, 'medkit');
        else if (roll < 0.55) spawnPickup(s.x, s.y, WEAPON_KEYS[1 + Math.floor(Math.random() * 3)]);
        else if (roll < 0.75) spawnPickup(s.x, s.y, 'ammo');

        // Next wave check
        if (kills > 0 && kills % 4 === 0) {
          wave += 1;
          addFloatText(player.x, player.y - 48, 'WAVE ' + wave + '!', '#38bdf8');
        }
        const targetBots = Math.min(2 + wave, 7);
        while (bots.length < targetBots) spawnBot();
      }
    }
  }

  function fireWeapon(s) {
    const w = WEAPONS[s.weapon];
    if (s.fireCd > 0 || s.reloading > 0) return;
    if (s.ammo <= 0) {
      s.reloading = w.reload;
      if (s.isPlayer) playTone(260, 0.08, 'triangle', 0.06, -80);
      return;
    }
    s.ammo -= 1;
    s.fireCd = w.rate;
    const muzzleX = s.x + Math.cos(s.aim) * 22;
    const muzzleY = s.y - 4 + Math.sin(s.aim) * 22;

    for (let i = 0; i < w.pellets; i++) {
      const a = s.aim + (Math.random() - 0.5) * w.spread;
      bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(a) * w.speed,
        vy: Math.sin(a) * w.speed,
        dmg: w.dmg,
        color: w.color,
        explosive: w.explosive,
        fromPlayer: s.isPlayer,
        life: 1.6,
      });
    }
    addParticles(muzzleX, muzzleY, w.color, 3, 120);
    if (s.isPlayer) {
      shake = Math.max(shake, w.explosive ? 5 : 2);
      if (s.weapon === 'sniper') playTone(880, 0.14, 'sawtooth', 0.09, -520);
      else if (s.weapon === 'rocket') playNoise(0.18, 0.12);
      else if (s.weapon === 'shotgun') playNoise(0.12, 0.11);
      else playTone(520, 0.06, 'square', 0.05, -240);
    }
    if (s.ammo === 0) s.reloading = w.reload;
  }

  function throwGrenade(s) {
    if (!s || s.grenades <= 0 || s.grenadeCd > 0) return;
    s.grenades -= 1;
    s.grenadeCd = 0.7;
    grenades.push({
      x: s.x + Math.cos(s.aim) * 16,
      y: s.y - 8,
      vx: Math.cos(s.aim) * 520 + s.vx * 0.3,
      vy: Math.sin(s.aim) * 520 - 140,
      fuse: 1.5,
      fromPlayer: s.isPlayer,
    });
    playTone(320, 0.09, 'sine', 0.07, 120);
  }

  function switchWeapon(s) {
    if (!s || !s.altWeapon) return;
    const prev = s.weapon;
    s.weapon = s.altWeapon;
    s.altWeapon = prev;
    s.ammo = WEAPONS[s.weapon].mag;
    s.reloading = 0;
    playTone(540, 0.06, 'triangle', 0.06, 120);
  }

  function resolvePlatforms(ent, hw, hh) {
    ent.onGround = false;
    for (const p of PLATFORMS) {
      if (
        ent.x + hw > p.x &&
        ent.x - hw < p.x + p.w &&
        ent.y + hh > p.y &&
        ent.y - hh < p.y + p.h
      ) {
        const overlapLeft = (ent.x + hw) - p.x;
        const overlapRight = (p.x + p.w) - (ent.x - hw);
        const overlapTop = (ent.y + hh) - p.y;
        const overlapBottom = (p.y + p.h) - (ent.y - hh);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapTop && ent.vy >= 0) {
          ent.y = p.y - hh;
          ent.vy = 0;
          ent.onGround = true;
        } else if (minOverlap === overlapBottom && ent.vy < 0) {
          ent.y = p.y + p.h + hh;
          ent.vy = 0;
        } else if (minOverlap === overlapLeft) {
          ent.x = p.x - hw;
          ent.vx = 0;
        } else if (minOverlap === overlapRight) {
          ent.x = p.x + p.w + hw;
          ent.vx = 0;
        }
      }
    }
    if (ent.x < hw) { ent.x = hw; ent.vx = 0; }
    if (ent.x > WORLD_W - hw) { ent.x = WORLD_W - hw; ent.vx = 0; }
    if (ent.y < hh) { ent.y = hh; ent.vy = 0; }
  }

  function pointInPlatform(x, y) {
    for (const p of PLATFORMS) {
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return p;
    }
    return null;
  }

  function update(dt) {
    if (screen !== 'playing' || !player) return;

    shake = Math.max(0, shake - dt * 28);

    // Player movement
    let moveX = 0;
    let jet = false;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    if (keys['KeyW'] || keys['ArrowUp'] || keys['Space']) jet = true;
    if (leftStick.id !== null) {
      if (Math.abs(leftStick.dx) > 0.18) moveX = leftStick.dx;
      if (leftStick.dy < -0.28) jet = true;
    }

    player.vx += (moveX * 320 - player.vx) * Math.min(1, dt * 11);
    if (jet && player.fuel > 0) {
      player.vy -= 1750 * dt;
      player.vy = Math.max(player.vy, -460);
      player.fuel = Math.max(0, player.fuel - 36 * dt);
      player.jetActive = true;
      if (Math.random() < 0.65) {
        addParticles(player.x - Math.cos(player.aim) * 4, player.y + 16, '#fb923c', 1, 80);
      }
    } else {
      player.jetActive = false;
      player.fuel = Math.min(player.maxFuel, player.fuel + (player.onGround ? 55 : 22) * dt);
    }

    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    resolvePlatforms(player, 14, 21);

    // Aim & Fire
    if (rightStick.active && (Math.abs(rightStick.dx) > 0.15 || Math.abs(rightStick.dy) > 0.15)) {
      player.aim = Math.atan2(rightStick.dy, rightStick.dx);
      fireWeapon(player);
    } else {
      const worldMx = mouse.x + cam.x;
      const worldMy = mouse.y + cam.y;
      player.aim = Math.atan2(worldMy - (player.y - 4), worldMx - player.x);
      if (mouse.down) fireWeapon(player);
    }

    player.fireCd = Math.max(0, player.fireCd - dt);
    player.grenadeCd = Math.max(0, player.grenadeCd - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    if (player.reloading > 0) {
      player.reloading -= dt;
      if (player.reloading <= 0) {
        player.reloading = 0;
        player.ammo = WEAPONS[player.weapon].mag;
      }
    }

    // Bots AI
    for (const b of bots) {
      b.fireCd = Math.max(0, b.fireCd - dt);
      b.invuln = Math.max(0, b.invuln - dt);
      if (b.reloading > 0) {
        b.reloading -= dt;
        if (b.reloading <= 0) {
          b.reloading = 0;
          b.ammo = WEAPONS[b.weapon].mag;
        }
      }

      const dx = player.x - b.x;
      const dy = player.y - b.y;
      const dist = Math.hypot(dx, dy);
      b.aim = Math.atan2(dy, dx) + Math.sin(performance.now() * 0.004 + b.x) * 0.08;

      b.aiTimer -= dt;
      if (b.aiTimer <= 0) {
        b.aiTimer = 0.6 + Math.random() * 0.9;
        if (dist > 280) b.aiDir = Math.sign(dx);
        else if (dist < 140) b.aiDir = -Math.sign(dx);
        else b.aiDir = Math.random() < 0.5 ? -1 : 1;
        b.aiJet = dy < -70 || (b.onGround && Math.random() < 0.35);
      }

      b.vx += (b.aiDir * 210 - b.vx) * Math.min(1, dt * 7);
      if (b.aiJet && b.fuel > 10) {
        b.vy -= 1550 * dt;
        b.vy = Math.max(b.vy, -390);
        b.fuel = Math.max(0, b.fuel - 32 * dt);
        b.jetActive = true;
      } else {
        b.jetActive = false;
        b.fuel = Math.min(b.maxFuel, b.fuel + 35 * dt);
      }
      b.vy += GRAVITY * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      resolvePlatforms(b, 14, 21);

      if (dist < 620 && Math.random() < 0.08 + wave * 0.015) {
        fireWeapon(b);
      }
    }

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bl = bullets[i];
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;
      bl.life -= dt;
      if (bl.life <= 0 || bl.x < 0 || bl.x > WORLD_W || bl.y < 0 || bl.y > WORLD_H) {
        bullets.splice(i, 1);
        continue;
      }
      if (pointInPlatform(bl.x, bl.y)) {
        if (bl.explosive) explode(bl.x, bl.y, 125, bl.dmg, bl.fromPlayer);
        else addParticles(bl.x, bl.y, bl.color, 4, 120);
        bullets.splice(i, 1);
        continue;
      }
      const targets = bl.fromPlayer ? bots : [player];
      let hit = false;
      for (const t of targets) {
        if (!t || t.invuln > 0) continue;
        if (Math.abs(bl.x - t.x) < 16 && Math.abs(bl.y - t.y) < 22) {
          if (bl.explosive) explode(bl.x, bl.y, 125, bl.dmg, bl.fromPlayer);
          else damageSoldier(t, bl.dmg, bl.fromPlayer);
          hit = true;
          break;
        }
      }
      if (hit) bullets.splice(i, 1);
    }

    // Grenades
    for (let i = grenades.length - 1; i >= 0; i--) {
      const g = grenades[i];
      g.vy += GRAVITY * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.fuse -= dt;
      const hitP = pointInPlatform(g.x, g.y + 6);
      if (hitP) {
        g.y = hitP.y - 6;
        g.vy = -g.vy * 0.48;
        g.vx *= 0.72;
      }
      if (g.fuse <= 0) {
        explode(g.x, g.y, 150, 95, g.fromPlayer);
        grenades.splice(i, 1);
      }
    }

    // Pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pk = pickups[i];
      pk.vy += GRAVITY * dt;
      pk.y += pk.vy * dt;
      pk.life -= dt;
      const hitP = pointInPlatform(pk.x, pk.y + 12);
      if (hitP && pk.vy > 0) {
        pk.y = hitP.y - 12;
        pk.vy = 0;
      }
      if (pk.life <= 0) {
        pickups.splice(i, 1);
        continue;
      }
      if (Math.hypot(pk.x - player.x, pk.y - player.y) < 32) {
        if (pk.kind === 'medkit') {
          player.hp = Math.min(player.maxHp, player.hp + 35);
          addFloatText(player.x, player.y - 30, '+35 HP', '#4ade80');
        } else if (pk.kind === 'ammo') {
          player.ammo = WEAPONS[player.weapon].mag;
          player.grenades = Math.min(5, player.grenades + 1);
          addFloatText(player.x, player.y - 30, '+AMMO & GRENADE', '#fde047');
        } else {
          player.altWeapon = player.weapon;
          player.weapon = pk.kind;
          player.ammo = WEAPONS[pk.kind].mag;
          player.reloading = 0;
          addFloatText(player.x, player.y - 30, WEAPONS[pk.kind].name + '!', '#38bdf8');
        }
        playTone(720, 0.12, 'triangle', 0.08, 220);
        pickups.splice(i, 1);
      }
    }

    // Particles & Float Texts
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const ft = floatTexts[i];
      ft.y -= 34 * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatTexts.splice(i, 1);
    }

    // Camera
    const targetCamX = Math.max(0, Math.min(WORLD_W - W, player.x - W / 2));
    const targetCamY = Math.max(0, Math.min(WORLD_H - H, player.y - H / 2));
    cam.x += (targetCamX - cam.x) * Math.min(1, dt * 8);
    cam.y += (targetCamY - cam.y) * Math.min(1, dt * 8);
  }

  function drawSoldier(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    if (s.invuln > 0 && Math.floor(performance.now() / 70) % 2 === 0) ctx.globalAlpha = 0.55;

    const facing = Math.cos(s.aim) >= 0 ? 1 : -1;

    // Jetpack
    ctx.fillStyle = '#334155';
    ctx.fillRect(facing > 0 ? -15 : 7, -8, 8, 20);
    if (s.jetActive) {
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(facing > 0 ? -11 : 11, 15, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = s.isPlayer ? '#16a34a' : '#dc2626';
    ctx.fillRect(-10, -10, 20, 24);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 24);

    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-9, 14, 7, 8);
    ctx.fillRect(2, 14, 7, 8);

    // Helmet & Visor
    ctx.fillStyle = s.isPlayer ? '#15803d' : '#991b1b';
    ctx.beginPath();
    ctx.arc(0, -16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = s.isPlayer ? '#fde047' : '#fca5a5';
    ctx.fillRect(facing > 0 ? 2 : -8, -19, 6, 4);

    // Weapon
    ctx.save();
    ctx.translate(0, -2);
    ctx.rotate(s.aim);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -3, 20, 6);
    ctx.fillStyle = WEAPONS[s.weapon].color;
    ctx.fillRect(10, -2, 10, 3);
    ctx.restore();

    // HP Bar above bots
    if (!s.isPlayer) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-16, -34, 32, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -34, 32 * Math.max(0, s.hp / s.maxHp), 5);
    }

    ctx.restore();
  }

  function render() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    if (screen === 'playing' || screen === 'gameover') {
      ctx.save();
      ctx.translate(-cam.x + sx, -cam.y + sy);

      // Subtle tactical grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1;
      const gx0 = Math.floor(cam.x / 80) * 80;
      const gy0 = Math.floor(cam.y / 80) * 80;
      for (let x = gx0; x < cam.x + W + 80; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, cam.y); ctx.lineTo(x, cam.y + H); ctx.stroke();
      }
      for (let y = gy0; y < cam.y + H + 80; y += 80) {
        ctx.beginPath(); ctx.moveTo(cam.x, y); ctx.lineTo(cam.x + W, y); ctx.stroke();
      }

      // Platforms
      for (const p of PLATFORMS) {
        if (p.kind === 'ground') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#334155';
          ctx.fillRect(p.x, p.y, p.w, 6);
        } else if (p.kind === 'crate') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(p.x, p.y, p.w, 4);
        }
      }

      // Pickups
      for (const pk of pickups) {
        ctx.save();
        ctx.translate(pk.x, pk.y + Math.sin(performance.now() * 0.005) * 3);
        ctx.fillStyle = pk.kind === 'medkit' ? '#16a34a' : pk.kind === 'ammo' ? '#eab308' : '#0284c7';
        ctx.fillRect(-11, -11, 22, 22);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-11, -11, 22, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lbl = pk.kind === 'medkit' ? '+' : pk.kind === 'ammo' ? 'A' : pk.kind[0].toUpperCase();
        ctx.fillText(lbl, 0, 1);
        ctx.restore();
      }

      // Soldiers
      for (const b of bots) drawSoldier(b);
      if (player) drawSoldier(player);

      // Bullets
      for (const bl of bullets) {
        ctx.fillStyle = bl.color;
        ctx.beginPath();
        ctx.arc(bl.x, bl.y, bl.explosive ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Grenades
      for (const g of grenades) {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Float texts
      for (const ft of floatTexts) {
        ctx.globalAlpha = Math.min(1, ft.life * 1.5);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
    }

    // HUD
    if (screen === 'playing' && player) {
      // Top-left HP, Fuel, Weapon
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(14, 14, 210, 82);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(14, 14, 210, 82);

      // HP
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('HP ' + Math.max(0, player.hp) + '/100', 24, 30);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(88, 22, 124, 9);
      ctx.fillStyle = player.hp > 35 ? '#22c55e' : '#ef4444';
      ctx.fillRect(88, 22, 124 * Math.max(0, player.hp / 100), 9);

      // Fuel
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('JET', 24, 48);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(88, 40, 124, 8);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(88, 40, 124 * (player.fuel / player.maxFuel), 8);

      // Weapon & Ammo
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      const wInfo = WEAPONS[player.weapon];
      const ammoStr = player.reloading > 0 ? 'RELOADING...' : player.ammo + '/' + wInfo.mag;
      ctx.fillText(wInfo.name + '  ' + ammoStr, 24, 68);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('GRENADES: ' + player.grenades + '  [G]', 24, 84);

      // Top-center Score & Wave
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(W / 2 - 110, 14, 220, 42);
      ctx.strokeRect(W / 2 - 110, 14, 220, 42);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SCORE ' + score + ' · WAVE ' + wave, W / 2, 33);
      ctx.fillStyle = '#fde047';
      ctx.font = '10px monospace';
      ctx.fillText('KILLS: ' + kills + '  BEST: ' + bestScore, W / 2, 48);

      // Minimap (below top-right buttons)
      const mw = 132, mh = 72;
      const mx = W - mw - 14, my = 56;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(mx, my, mw, mh);
      for (const b of bots) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(mx + (b.x / WORLD_W) * mw - 2, my + (b.y / WORLD_H) * mh - 2, 4, 4);
      }
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(mx + (player.x / WORLD_W) * mw - 2.5, my + (player.y / WORLD_H) * mh - 2.5, 5, 5);

      // Touch controls overlay
      if (isTouchDevice) {
        // Left stick base
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(82, H - 82, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(82 + leftStick.dx * 28, H - 82 + leftStick.dy * 28, 20, 0, Math.PI * 2);
        ctx.fill();

        // Right aim/fire stick
        ctx.strokeStyle = 'rgba(249,115,22,0.45)';
        ctx.beginPath();
        ctx.arc(W - 82, H - 82, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(249,115,22,0.5)';
        ctx.beginPath();
        ctx.arc(W - 82 + rightStick.dx * 28, H - 82 + rightStick.dy * 28, 20, 0, Math.PI * 2);
        ctx.fill();

        // Grenade & Swap buttons
        ctx.fillStyle = 'rgba(22,163,74,0.75)';
        ctx.fillRect(W - 156, H - 46, 52, 32);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FRAG', W - 130, H - 26);

        ctx.fillStyle = 'rgba(59,130,246,0.75)';
        ctx.fillRect(W - 156, H - 86, 52, 32);
        ctx.fillStyle = '#fff';
        ctx.fillText('SWAP', W - 130, H - 66);
      }
    }

    // Top-right Mute & Exit buttons
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(W - 84, 14, 32, 32);
    ctx.fillRect(W - 46, 14, 32, 32);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W - 84, 14, 32, 32);
    ctx.strokeRect(W - 46, 14, 32, 32);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(muted ? '🔇' : '🔊', W - 68, 30);
    ctx.fillText('✕', W - 30, 30);

    // Title & Game Over overlays
    if (screen === 'title' || screen === 'gameover') {
      ctx.fillStyle = 'rgba(11, 15, 20, 0.84)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f97316';
      ctx.font = '800 38px system-ui, sans-serif';
      ctx.fillText('MILI MILITIA', W / 2, H / 2 - 72);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px monospace';
      if (screen === 'gameover') {
        ctx.fillText('MISSION FAILED · SCORE: ' + score + ' · KILLS: ' + kills, W / 2, H / 2 - 30);
        ctx.fillStyle = '#fde047';
        ctx.fillText('BEST SCORE: ' + bestScore, W / 2, H / 2 - 6);
      } else {
        ctx.fillText('2D JETPACK ARENA SHOOTER', W / 2, H / 2 - 32);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText('WASD/Arrows + Space (Jetpack) · Mouse (Aim/Fire) · G (Frag) · Q (Swap)', W / 2, H / 2 - 6);
      }

      // Start button
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(W / 2 - 96, H / 2 + 24, 192, 46);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(W / 2 - 96, H / 2 + 24, 192, 46);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(screen === 'gameover' ? 'DEPLOY AGAIN' : 'DEPLOY NOW', W / 2, H / 2 + 48);
    }
  }

  function handleTopButtons(x, y) {
    if (y >= 14 && y <= 46) {
      if (x >= W - 84 && x <= W - 52) {
        ensureAudio();
        muted = !muted;
        return true;
      }
      if (x >= W - 46 && x <= W - 14) {
        window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_GAME' }));
        }
        return true;
      }
    }
    return false;
  }

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if ((screen === 'title' || screen === 'gameover') && (e.code === 'Enter' || e.code === 'Space')) {
      e.preventDefault();
      startGame();
      return;
    }
    if (screen === 'playing' && player) {
      if (e.code === 'KeyG') throwGrenade(player);
      if (e.code === 'KeyQ' || e.code === 'Digit1' || e.code === 'Digit2') switchWeapon(player);
      if (e.code === 'KeyR' && player.ammo < WEAPONS[player.weapon].mag && player.reloading === 0) {
        player.reloading = WEAPONS[player.weapon].reload;
      }
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  canvas.addEventListener('mousedown', (e) => {
    ensureAudio();
    if (handleTopButtons(e.clientX, e.clientY)) return;
    if (screen === 'title' || screen === 'gameover') {
      if (
        e.clientX >= W / 2 - 96 && e.clientX <= W / 2 + 96 &&
        e.clientY >= H / 2 + 24 && e.clientY <= H / 2 + 70
      ) {
        startGame();
      }
      return;
    }
    if (e.button === 2) throwGrenade(player);
    else mouse.down = true;
  });
  window.addEventListener('mouseup', () => { mouse.down = false; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    ensureAudio();
    for (const t of e.changedTouches) {
      if (handleTopButtons(t.clientX, t.clientY)) continue;
      if (screen === 'title' || screen === 'gameover') {
        startGame();
        continue;
      }
      if (t.clientX >= W - 156 && t.clientX <= W - 104 && t.clientY >= H - 46 && t.clientY <= H - 14) {
        throwGrenade(player);
        continue;
      }
      if (t.clientX >= W - 156 && t.clientX <= W - 104 && t.clientY >= H - 86 && t.clientY <= H - 54) {
        switchWeapon(player);
        continue;
      }
      if (t.clientX < W / 2 && leftStick.id === null) {
        leftStick = { id: t.identifier, sx: t.clientX, sy: t.clientY, dx: 0, dy: 0 };
      } else if (t.clientX >= W / 2 && rightStick.id === null) {
        rightStick = { id: t.identifier, sx: t.clientX, sy: t.clientY, dx: 0, dy: 0, active: true };
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === leftStick.id) {
        const dx = (t.clientX - leftStick.sx) / 40;
        const dy = (t.clientY - leftStick.sy) / 40;
        const m = Math.hypot(dx, dy);
        leftStick.dx = m > 1 ? dx / m : dx;
        leftStick.dy = m > 1 ? dy / m : dy;
      } else if (t.identifier === rightStick.id) {
        const dx = (t.clientX - rightStick.sx) / 40;
        const dy = (t.clientY - rightStick.sy) / 40;
        const m = Math.hypot(dx, dy);
        rightStick.dx = m > 1 ? dx / m : dx;
        rightStick.dy = m > 1 ? dy / m : dy;
      }
    }
  }, { passive: false });

  function endTouches(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === leftStick.id) leftStick = { id: null, sx: 0, sy: 0, dx: 0, dy: 0 };
      if (t.identifier === rightStick.id) rightStick = { id: null, sx: 0, sy: 0, dx: 0, dy: 0, active: false };
    }
  }
  canvas.addEventListener('touchend', endTouches);
  canvas.addEventListener('touchcancel', endTouches);

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
