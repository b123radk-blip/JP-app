---
name: pose-a-person
description: Pose a person or animal model (clips, turning, reaching, bending, sitting, gestures) in a card scene. Use when a pose looks wrong or a hand or foot misses its target.
---

# Posing people

## Order every frame
1. `a.pose(clip, t)` FIRST (only clips listed for that model in docs/MODELS.md).
2. Then position and turn: `a.group.position.set(...)`, `a.group.rotation.y` (0 faces the viewer, `-Math.PI/2` faces
   left toward the kanji).
3. Then bends and reaches: `a.turn('Abdomen'|'Torso'|'Head', ax, ay, az)` (+ax tips forward), `a.handTo`, `a.grip`,
   gestures (`toMouth sip toEar cupEar shadeEyes wave point holdOut bow nod shake write`, k 0..1).

## Limits of these chibi models
- Arms are short: a hand reaches only about 0.3 heights above the shoulder. No overhead lifts; hold to the chest.
- The fist has no fingers: "pointing up" or "finger raised" reads badly. Keep the hand beside the head, never over
  the face or eyes.
- `SitDown`'s last frame is a CHAIR seat. On a floor or cushion the hips hover. The hips need something under them
  (stool, thick cushion); feet touching a cushion doesn't mean he sits on it.
- Hands at the shins are not touching the toes. Judge contact with `measure`, not by eye.

## When a pose fails
`measure` the two body points the goal names at the failing moment. Move the person or target by the measured gap.
Don't add bone turns the plan didn't ask for; report it instead.
