import { buildBladeRiftHtml } from "./bladeRiftHtml";
import { buildNeonBlockSurgeHtml } from "./neonBlockSurgeHtml";
import { buildMemoryRiftHtml } from "./memoryRiftHtml";
import { buildAstroBreakerHtml } from "./astroBreakerHtml";
import { buildBlitzRunnerHtml } from "./blitzRunnerHtml";
import { buildNitroDriftHtml } from "./nitroDriftHtml";
import { buildSudokuHtml } from "./sudokuHtml";
import { buildMiliMilitiaHtml } from "./miliMilitiaHtml";

export type ArcadeGameId =
  | "blade-rift"
  | "neon-block-surge"
  | "memory-rift"
  | "astro-breaker"
  | "blitz-runner"
  | "nitro-drift"
  | "violet-sudoku"
  | "mili-militia";

export interface ArcadeGameMeta {
  id: ArcadeGameId;
  title: string;
  genrePill: string;
  tagline: string;
  description: string;
  highlights: string[];
  controls: string;
  buildHtml: () => string;
}

export const ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: "blade-rift",
    title: "Blade Rift",
    genrePill: "action · arena survival",
    tagline: "Orbiting-Blade Arena Survival",
    description:
      "2400×1600 multi-realm arena with orbiting sword blades, dash-slash invulnerability frames, Rift Warden bosses, and a live minimap.",
    highlights: [
      "3 realms linked by glowing Rift Portals",
      "Up to 15 orbiting blades & 10 blade levels",
      "Boss encounters & pixel-art knight spritesheet",
    ],
    controls: "WASD / Arrows + Space (Dash) · Touch joystick + DASH",
    buildHtml: buildBladeRiftHtml,
  },
  {
    id: "neon-block-surge",
    title: "Neon Block Surge",
    genrePill: "puzzle · 2048 merge",
    tagline: "Falling-Block + 2048 Cascade Puzzle",
    description:
      "7×11 grid puzzle combining falling numbered tiles with 2048-style adjacent merges, gravity cascades, and 3×3 Bomb tile clears.",
    highlights: [
      "Adjacent matching numbers merge & double (2 → 2048)",
      "Bomb tiles clear 3×3 clusters on impact",
      "Full-row Line Clear (+180) & speed scaling",
    ],
    controls: "Arrows / WASD + Space (Hard Drop) · Touch buttons / swipe",
    buildHtml: buildNeonBlockSurgeHtml,
  },
  {
    id: "memory-rift",
    title: "Memory Rift",
    genrePill: "memory · focus trainer",
    tagline: "Expanding Grid Sequence Recall",
    description:
      "Watch-and-repeat pattern recall on a glowing tile grid that expands from 3×3 to 4×4 and 5×5 with accelerating flash speed.",
    highlights: [
      "Progressive grid expansion (3×3 → 4×4 → 5×5)",
      "Countdown timer bar with fast-completion bonuses",
      "3 lives & persistent high-score tracking",
    ],
    controls: "Click or tap tiles directly",
    buildHtml: buildMemoryRiftHtml,
  },
  {
    id: "astro-breaker",
    title: "Astro Breaker",
    genrePill: "arcade · brick breaker",
    tagline: "Neon Brick-Breaker Arcade",
    description:
      "Escalating brick waves with 2-HP armored bricks, chain-exploding red core bricks, +2 Multi-Ball orbs, and Wide Paddle power-ups.",
    highlights: [
      "Up to 6 simultaneous balls with Multi-Ball orbs",
      "Explosive core bricks trigger chain detonations",
      "60fps HiDPI canvas with Web Audio synth SFX",
    ],
    controls: "Mouse hover/drag or A/D / Arrows · Touch drag",
    buildHtml: buildAstroBreakerHtml,
  },
  {
    id: "blitz-runner",
    title: "Math Blitz Runner",
    genrePill: "quiz · reflex runner",
    tagline: "3-Lane Reflex Quiz Runner",
    description:
      "Endless 3-lane track with live arithmetic prompts scaling from addition/subtraction to multiplication and multi-step problems.",
    highlights: [
      "Dynamic difficulty scaling with score streaks",
      "3-lane gate steering & streak multiplier",
      "Instant Web Audio feedback & best-score save",
    ],
    controls: "A/D / Arrows or click lane · Tap lane or swipe",
    buildHtml: buildBlitzRunnerHtml,
  },
  {
    id: "nitro-drift",
    title: "Neon Drift",
    genrePill: "racing · nitro boost",
    tagline: "4-Lane Night Highway Racer",
    description:
      "Dodge rival sedans and trucks across 4 highway lanes while collecting Coins and Nitro Orbs to trigger invulnerable Nitro Boosts.",
    highlights: [
      "Nitro Boost (1.65× speed) smashes traffic for +120 pts",
      "Live KM/H speedometer & Nitro gauge",
      "3 lives with smooth lane-switching physics",
    ],
    controls: "A/D / Arrows + Space (Nitro) · Tap/swipe + NITRO",
    buildHtml: buildNitroDriftHtml,
  },
  {
    id: "violet-sudoku",
    title: "Violet Sudoku",
    genrePill: "logic · 9×9 puzzle",
    tagline: "Randomized 9×9 Logic Puzzle",
    description:
      "Procedural valid 9×9 Sudoku generator with Easy, Medium, and Hard modes, row/column/box highlighting, hints, and mistake tracking.",
    highlights: [
      "3 difficulty presets (30, 40, or 50 blanks)",
      "Active row, column, 3×3 box & digit highlighting",
      "Elapsed timer, 3 hints per game & 0/3 mistakes",
    ],
    controls: "Click cell + 1–9 pad or Arrow keys + Backspace",
    buildHtml: buildSudokuHtml,
  },
  {
    id: "mili-militia",
    title: "Mili Militia",
    genrePill: "shooter · 2d jetpack",
    tagline: "2D Jetpack Arena Shooter",
    description:
      "Side-scrolling 2200×1200 tactical arena with jetpack flight, 4 weapons (Assault, Shotgun, Railgun, Rocket), frag grenades, and AI militia waves.",
    highlights: [
      "Easy, Medium & Hard difficulty levels",
      "Staggered patrol & engagement AI (no instant swarming)",
      "4 switchable weapons, frag grenades & live minimap",
    ],
    controls: "WASD/Arrows + Space (Jetpack) · Mouse (Aim/Fire) · G (Frag) · Q (Swap)",
    buildHtml: buildMiliMilitiaHtml,
  },
];
