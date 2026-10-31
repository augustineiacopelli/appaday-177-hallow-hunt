#!/usr/bin/env node
/*
  Monte Carlo of the Hallow Hunt catch formula.
  Run from the repo root:  node tests/catch_sim.js
  The CATCH object is extracted from index.html between the CATCH:BEGIN and
  CATCH:END markers, so this test always exercises the shipped formula.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/\/\* CATCH:BEGIN \*\/([\s\S]*?)\/\* CATCH:END \*\//);
if (!m) { console.error('FAIL  CATCH block markers not found'); process.exit(1); }
const ctx = {};
vm.createContext(ctx);
vm.runInContext(m[1] + '\nthis.CATCH = CATCH;', ctx);
const CATCH = ctx.CATCH;

let seed = 177;
function rng() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

let fails = 0;
function check(ok, msg) { console.log((ok ? 'PASS  ' : 'FAIL  ') + msg); if (!ok) fails++; }

const BASES = { 'common s1': 0.55, 'uncommon s1': 0.40, 'rare s1': 0.26, 'legendary': 0.13, 'rare s3': 0.156 };
const THROWS = [
  ['plain', { inRing: false }],
  ['nice r=0.85', { inRing: true, ring: 0.85 }],
  ['great r=0.55', { inRing: true, ring: 0.55 }],
  ['excellent r=0.3', { inRing: true, ring: 0.3 }],
  ['excellent curve', { inRing: true, ring: 0.25, curve: true }],
  ['plain glow', { inRing: false, glow: true }]
];
const N = 200000;

console.log('Catch rate table (analytic p versus simulated wobble outcome, N=' + N + ')');
console.log('base        throw               p       sim     wobbles 0/1/2 breakouts');
for (const [bn, base] of Object.entries(BASES)) {
  for (const [tn, o] of THROWS) {
    const p = CATCH.probability(base, o);
    let caught = 0; const br = [0, 0, 0];
    for (let i = 0; i < N; i++) { const r = CATCH.wobbles(p, rng); if (r.caught) caught++; else br[r.wobbles]++; }
    const sim = caught / N;
    console.log(bn.padEnd(12) + tn.padEnd(20) + p.toFixed(3).padEnd(8) + sim.toFixed(3).padEnd(8) + br.map((b) => (b / N).toFixed(2)).join('/'));
    if (Math.abs(sim - p) > 0.01) { check(false, 'simulation matches p for ' + bn + ' ' + tn); }
  }
}

console.log('');
check(CATCH.multiplier({ inRing: true, ring: 0.25, curve: true }) <= CATCH.MULT_CAP, 'multiplier never exceeds the cap (' + CATCH.MULT_CAP + ')');
check(CATCH.probability(0.99, { inRing: true, ring: 0.25, curve: true }) <= CATCH.P_MAX, 'probability never exceeds P_MAX');
check(CATCH.probability(0.001, {}) >= CATCH.P_MIN, 'probability never drops below P_MIN');
check(CATCH.probability(0.4, { inRing: true, ring: 0.3 }) > CATCH.probability(0.4, { inRing: true, ring: 0.85 }), 'smaller ring gives a better chance');
check(CATCH.probability(0.4, { curve: true }) > CATCH.probability(0.4, {}), 'curveball improves the chance');
check(CATCH.probability(0.4, { glow: true }) < CATCH.probability(0.4, {}), 'glowing spooks are a little harder');
check(CATCH.gradeFor(0.9) === 'nice' && CATCH.gradeFor(0.6) === 'great' && CATCH.gradeFor(0.3) === 'excellent', 'grade thresholds');
check(CATCH.ringBonus(1) === 1 && Math.abs(CATCH.ringBonus(CATCH.RING_MIN) - 2) < 1e-9, 'ring bonus runs from 1 to 2');
let monotone = true; let prev = 0;
for (let r = 1; r >= CATCH.RING_MIN; r -= 0.01) { const p = CATCH.probability(0.3, { inRing: true, ring: r }); if (p + 1e-12 < prev) monotone = false; prev = p; }
check(monotone, 'chance rises steadily as the ring shrinks');
let fled = 0; for (let i = 0; i < N; i++) if (CATCH.flees(0.1, rng)) fled++;
check(Math.abs(fled / N - 0.1) < 0.005, 'flee rate 0.10 simulates to ' + (fled / N).toFixed(3));
const kid = CATCH.probability(0.55, { inRing: false });
check(kid >= 0.5, 'a plain throw at a common spook catches at least half the time (' + kid.toFixed(2) + ')');

console.log('');
if (fails) { console.log(fails + ' check(s) failed'); process.exit(1); }
console.log('All checks passed');
