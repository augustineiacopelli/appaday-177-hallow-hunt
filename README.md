# Hallow Hunt | AppADay 177

Hallow Hunt is a family friendly Halloween creature collector played through your phone camera. Spot original ghosts, goblins, pumpkin sprites, and more pinned around your room or found on a walk, then swipe a glowing lantern to catch them, fill a 44 spook Spookydex, evolve your favorites, and snap AR photo cards.

**Live:** https://augustineiacopelli.github.io/appaday-177-hallow-hunt/
**Category:** G (Games) &middot; **Claude API:** No &middot; **Part of:** [AppADay](https://augustineiacopelli.github.io/appaday/)

## Status

Shipped October 31, 2026. Session A built the playable core; Session B added XP and levels, candy and evolution, Send Home, seeded daily quests, Walk mode, photo cards, multiple hunters with a Family board, and sound.

## How to play

Tap **Start Hunt**. The app asks for motion access first, then the camera. Turn slowly and look for spooks pinned around you; arrows at the screen edge point to spooks you cannot see. Tap a spook to start an encounter, then swipe the lantern up to throw it. Land it inside the shrinking colored ring for a Nice, Great, or Excellent throw, and spin the lantern in a small circle before letting go for a curveball. The lantern wobbles up to three times before the catch is sealed. Some spooks only come out at night, and about one in forty glows.

## View modes

| Mode | When | What you see |
| --- | --- | --- |
| Magic window | Motion and camera allowed | Spooks over the live camera, steered by the phone |
| Spooky yard with motion | Motion allowed, camera off or declined | Spooks over a painted night yard, steered by the phone |
| Drag to look | No motion sensor (desktop) or Drag only chosen | Painted yard, drag to look around |

Recenter re-anchors the view to the direction you are facing. Settings (gear) chooses the view, renames the hunter, replays the throwing tip, and erases catches with a two tap guard.

## The 44 spooks

Twenty one families. Three stage lines: Wisp, Pumpkin, Goblin, Witch Hat (Hatling, Hexhat, Grand Hexhat), and Slime (Gloop, Oozle, Slimeking). Two stage lines: Bat, Spider, Cat, Skeleton, Candle, Owl (Hootle to Hootmaster), Mummy (Wrapsy to Pharaowrap), Cauldron (Bubblepot, Brewbelly), Patchwork (Stitchkin, Boltbrute), Scarecrow (Strawby, Scarecrown), Crow (Cawlet, Ravenshade), Vampire (Fangle, Nocturne), and Tombstone (Gravelet, Tombtop). Single stage: Peeper and the two legendaries, Lunamoth, which only visits at night, and Sugarcomet, a candy corn shooting star that only streaks by in daylight. Every creature is painted in code on a 2D canvas, cached, and used as a three.js sprite texture. Each has a glowing variant with its own palette.

## Growing your spooks

Every catch earns XP: 50 for the catch, 150 for a new species, 150 for a glowing one, 10, 30, or 60 for a Nice, Great, or Excellent throw, and 10 for a curveball. The first catch of each day adds 100 XP and doubles the candy. Levels run from 1 to 30. Level L needs 600(L-1) + 150(L-1)(L-2) total XP, so level 2 is 600, level 3 is 1,500, level 10 is 16,200, and level 30 sits at 139,200. Even the best possible first catch (520 XP) stays short of level 2.

Each catch also gives 3 candy for its family (6 for a glowing one). Evolving costs 12 candy for a first stage spook and 36 for a second stage, earns 250 XP, and keeps a glowing spook glowing. Send Home trades an extra for 1 candy and always keeps your last one of a kind.

## Daily quests

Three quests a day, seeded by the date so everyone in the family gets the same set. The first is always a catch count; the other two come from family catches, ring throws, Great or Excellent throws, Excellent throws, curveballs, Send Home, and photos. Each pays 150 XP and 4 candy, and finishing all three adds a 300 XP bonus. New quests arrive at midnight.

## Walk mode

Tap Walk while hunting and the app watches your location (it is only asked for here). Every 100 meters, about 130 steps, a spook appears in front of you with better odds of an uncommon or rare, plus 15 XP. Distance uses the haversine formula between fixes, ignores fixes less accurate than 35 meters and jitter under 5 meters, and pays nothing above 3 meters per second, which turns the safety banner red. The banner stays up the whole time you walk. Only the distance total is saved, never your location.

## Photos

The round shutter button, or the camera button during an encounter, saves a photo of the camera view and the spooks with a Hallow Hunt caption. Photos live in each hunter's album (up to 80) where you can share, save, or delete them.

## Hunters and the Family board

Up to 8 hunters share a phone, each with their own Spookydex, candy, quests, and photos. Tap the hunter pill or Family to switch, add, or remove hunters and see everyone ranked by spooks found, with how many of today's quests each has done and the family's combined Spookydex.

## Sound

Fifteen small Web Audio synths (no audio files) for throws, hits, wobbles, catches, breakouts, level ups, quests, evolution, the shutter, and walk spawns. Settings turns sound on or off.

## Catch formula

`p = 1 - (1 - base)^m`, where base comes from rarity and stage (glowing spooks use 0.85 of base) and m is the ring bonus (1 to 2 as the ring shrinks, only when the lantern lands inside it) times 1.7 for a curveball, capped at 3.4. The result is clamped to 0.02 through 0.97. Each of three wobbles succeeds with probability p^(1/3), so the chance of a full catch is exactly p. After a breakout the spook may flee at its rarity's flee rate.

## Tech

One `index.html` with inline CSS and JS. three.js r128 from cdnjs as a classic script. IndexedDB (`hallowhunt`: profiles, photos as JPEG data URLs, meta) with an in memory fallback; settings in localStorage under `hallowhunt.settings`. A screen wake lock keeps the phone awake while hunting. Orientation uses an inlined DeviceOrientationControls quaternion with screen angle correction. No build step and no Claude API.

## Tests

```
python3 tests/validate.py   # node --check, top level await, ASCII, forbidden APIs, seven head tags
node tests/catch_sim.js     # Monte Carlo of the catch formula, extracted live from index.html
```

## Privacy

The camera feed and photos never leave the phone unless you share a photo yourself, location is used only while Walk is on and is never stored, and nothing is uploaded. Hunt with a grown up and watch where you step.
