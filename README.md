# Hallow Hunt | AppADay 177

Hallow Hunt is a family friendly Halloween creature collector played through your phone camera. Spot original ghosts, goblins, pumpkin sprites, and more pinned around your room or found on a walk, then swipe a glowing lantern to catch them, fill your Spookydex, evolve your favorites, and snap AR photo cards.

**Live:** https://augustineiacopelli.github.io/appaday-177-hallow-hunt/
**Category:** G (Games) &middot; **Claude API:** No &middot; **Part of:** [AppADay](https://augustineiacopelli.github.io/appaday/)

## Status

Session A (the playable core) is built and tested. Session B adds XP and levels, candy and evolution, daily quests, Walk mode, photo cards, multiple hunters, the Family board, and sound.

## How to play

Tap **Start Hunt**. The app asks for motion access first, then the camera. Turn slowly and look for spooks pinned around you; arrows at the screen edge point to spooks you cannot see. Tap a spook to start an encounter, then swipe the lantern up to throw it. Land it inside the shrinking colored ring for a Nice, Great, or Excellent throw, and spin the lantern in a small circle before letting go for a curveball. The lantern wobbles up to three times before the catch is sealed. Some spooks only come out at night, and about one in forty glows.

## View modes

| Mode | When | What you see |
| --- | --- | --- |
| Magic window | Motion and camera allowed | Spooks over the live camera, steered by the phone |
| Spooky yard with motion | Motion allowed, camera off or declined | Spooks over a painted night yard, steered by the phone |
| Drag to look | No motion sensor (desktop) or Drag only chosen | Painted yard, drag to look around |

Recenter re-anchors the view to the direction you are facing. Settings (gear) chooses the view, renames the hunter, replays the throwing tip, and erases catches with a two tap guard.

## The 22 spooks

Eleven families: Wisp (3 stages), Pumpkin (3), Goblin (3), Bat (2), Spider (2), Cat (2), Skeleton (2), Candle (2), and the single stage Hootle, Wrapsy, and the legendary Lunamoth. Every creature is painted in code on a 2D canvas, cached, and used as a three.js sprite texture. Each has a glowing variant with its own palette.

## Catch formula

`p = 1 - (1 - base)^m`, where base comes from rarity and stage (glowing spooks use 0.85 of base) and m is the ring bonus (1 to 2 as the ring shrinks, only when the lantern lands inside it) times 1.7 for a curveball, capped at 3.4. The result is clamped to 0.02 through 0.97. Each of three wobbles succeeds with probability p^(1/3), so the chance of a full catch is exactly p. After a breakout the spook may flee at its rarity's flee rate.

## Tech

One `index.html` with inline CSS and JS. three.js r128 from cdnjs as a classic script. IndexedDB (`hallowhunt`: profiles, photos, meta) with an in memory fallback; settings in localStorage under `hallowhunt.settings`. Orientation uses an inlined DeviceOrientationControls quaternion with screen angle correction. No build step and no Claude API.

## Tests

```
python3 tests/validate.py   # node --check, top level await, ASCII, forbidden APIs, seven head tags
node tests/catch_sim.js     # Monte Carlo of the catch formula, extracted live from index.html
```

## Privacy

The camera feed never leaves the phone and nothing is uploaded. Hunt with a grown up and watch where you step.
