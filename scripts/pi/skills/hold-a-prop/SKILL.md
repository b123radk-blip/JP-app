---
name: hold-a-prop
description: Make a person hold, carry, pour from, drink from or hand over a prop (cup, jug, phone, key, book, umbrella). Use for any hand-on-thing contact.
---

# Holding a prop

The fist has no fingers. A held thing rests against the PALM side at the edge of the fist. It never sits inside the fist.

## Code (every frame, after `a.pose`)
1. Reach: `a.grip('R', centre, toward, r, k)`. `centre` = where the thing's middle should be (world), `toward` = unit
   vector from the hand to the thing, `r` = the thing's radius at the grip (world units).
2. Place: `a.hold(prop, 'R', group, r)`. It puts the prop r out from the palm. Use the same r as in grip.
3. Name it: `prop.name = 'cup'`, so goals and `measure` find it.
`a.carry(...)` is older; prefer grip + hold.

## Drinking and eating
- Drink: `a.sip('R', k)` with the cup held as above. The cup's RIM must reach the mouth (`a.at('mouth')` in code),
  not the cup's middle. `measure` the cup's top: just below `<person> eyes`, in front of the face. Tilt the cup as the
  head tips back.
- Eat: `a.toMouth('R', k)`.

## Two hands (box, tray, glasses)
`a.grip` each side on opposite faces of the thing; `a.holdOut(k)` for a book or bowl in front of the chest.

## Check it
- A hand can't reach: `measure` shoulder to target. If it's too far, move the person closer. Never stretch the arm.
- Open `held.jpg` (inspect without `--quick`): front and both sides. Fault: prop inside the fist, floating off the palm,
  or through the body.
