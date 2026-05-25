/**
 * VELIX OS V2.5 | CENTRAL GOD-TIER LEGENDARY REGISTRY
 * Aligned Blueprint Structure for Direct Secure Data Injections
 */

const godTierManifest = {
  yoriichi_godtier: {
    id: "yoriichi_godtier",
    name: "Yoriichi Tsugikuni",
    rarity: "God-Tier",
    atk: 5000, // Aligned property to use 'atk' natively for combat engine damage calculations
    power: 5000, // Kept 'power' for backward text rendering compatibility
    cost: 499,
    type: "Sun Breathing",
    image: "https://i.pinimg.com/736x/5e/fc/ba/5efcba72d1d495db3bd0340913ea80a0.jpg",
    level: 1,
    xp: 0,
    max_xp: 1000,
    isAwakened: false,
    awakeningStage: 0
  },
  muzan_godtier: {
    id: "muzan_godtier",
    name: "Muzan Kibutsuji",
    rarity: "God-Tier",
    atk: 4500,
    power: 4500,
    cost: 399,
    type: "Demon Blood",
    image: "https://i.pinimg.com/736x/4a/3b/a8/4a3ba8b84645185055a4469e85c62173.jpg",
    level: 1,
    xp: 0,
    max_xp: 1000,
    isAwakened: false,
    awakeningStage: 0
  },
  kokushibo_godtier: {
    id: "kokushibo_godtier",
    name: "Kokushibo",
    rarity: "God-Tier",
    atk: 4000,
    power: 4000,
    cost: 199,
    type: "Moon Breathing",
    image: "https://i.pinimg.com/1200x/a7/e1/d2/a7e1d2f6a2528d2d0e27a4c347ec2f55.jpg",
    level: 1,
    xp: 0,
    max_xp: 1000,
    isAwakened: false,
    awakeningStage: 0
  }
};

// Generates an array layout on-the-fly for clean shop looping if required!
const godTierArray = Object.values(godTierManifest);

module.exports = Object.assign(godTierManifest, {
  godTierArray,
  godTierManifest
});
