// Every glTF model the scenes may use: name -> file under assets/models/ (loader: effects/models.js). Clips, sizes and
// draw calls of each: docs/MODELS.md (node scripts/list-models.mjs --write). Style rule: Quaternius for people and
// animals, Kenney for vehicles and objects.
export const MODELS = {
  // Kenney (CC0): cube pets, mini characters (the first trial), nature, vehicles
  dog: 'kenney/cube-pets/animal-dog.glb', chick: 'kenney/cube-pets/animal-chick.glb', fish: 'kenney/cube-pets/animal-fish.glb',
  elephant: 'kenney/cube-pets/animal-elephant.glb',
  man: 'kenney/mini-characters/character-male-b.glb', hiker: 'kenney/mini-characters/character-male-e.glb',
  oak: 'kenney/nature-kit/tree_oak.glb', grass: 'kenney/nature-kit/grass_large.glb', sedan: 'kenney/car-kit/sedan.glb',
  tramCar: 'kenney/train-kit/train-electric-city-b.glb', track: 'kenney/train-kit/track.glb',
  // Quaternius (CC0; packs in assets/models/quaternius/License.txt). Animals
  shiba: 'quaternius/animals/shiba.glb', cow: 'quaternius/animals/cow.glb', horse: 'quaternius/animals/horse.glb',
  fox: 'quaternius/animals/fox.glb', deer: 'quaternius/animals/deer.glb', wolf: 'quaternius/animals/wolf.glb',
  husky: 'quaternius/animals/husky.glb',
  pig: 'quaternius/farm/pig.glb', sheep: 'quaternius/farm/sheep.glb', pug: 'quaternius/farm/pug.glb', llama: 'quaternius/farm/llama.glb',
  fishOrange: 'quaternius/sea/fish-orange.glb', fishBlue: 'quaternius/sea/fish-blue.glb', fishClown: 'quaternius/sea/fish-clown.glb',
  whale: 'quaternius/sea/whale.glb', dolphin: 'quaternius/sea/dolphin.glb', shark: 'quaternius/sea/shark.glb',
  // people (all share one rig and clip set; tint { Skin, Face } so they read on dark skies, see vignettes/models-b.js)
  guy: 'quaternius/characters/casual-male.glb', gal: 'quaternius/characters/casual-female.glb',
  guy2: 'quaternius/characters/casual2-male.glb', gal2: 'quaternius/characters/casual2-female.glb',
  guy3: 'quaternius/characters/casual3-male.glb', gal3: 'quaternius/characters/casual3-female.glb',
  kimono: 'quaternius/characters/kimono-female.glb', kimonoMan: 'quaternius/characters/kimono-male.glb',
  doctor: 'quaternius/characters/doctor.glb', doctorWoman: 'quaternius/characters/doctor-female.glb',
  chef: 'quaternius/characters/chef.glb', suitMan: 'quaternius/characters/suit-male.glb', suitWoman: 'quaternius/characters/suit-female.glb',
  worker: 'quaternius/characters/worker.glb', grandpa: 'quaternius/characters/old-man.glb', grandma: 'quaternius/characters/old-woman.glb',
  // sushi restaurant decorations (textured, static)
  sakuraTree: 'quaternius/sushi/sakura-tree.glb', sakuraFlower: 'quaternius/sushi/sakura-flower.glb', bamboo: 'quaternius/sushi/bamboo.glb',
  bell: 'quaternius/sushi/bell.glb', lantern: 'quaternius/sushi/lantern.glb', wallLight: 'quaternius/sushi/wall-light.glb',
  sign: 'quaternius/sushi/sign.glb', sign2: 'quaternius/sushi/sign2.glb', sign3: 'quaternius/sushi/sign3.glb',
  painting: 'quaternius/sushi/painting.glb', paintingSmall: 'quaternius/sushi/painting-small.glb', plant1: 'quaternius/sushi/plant1.glb',
  plant2: 'quaternius/sushi/plant2.glb', koiBanner: 'quaternius/sushi/koi-banner.glb', carpet: 'quaternius/sushi/carpet.glb',
};
