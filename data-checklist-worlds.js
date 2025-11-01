// data-checklist-worlds.js
// This file replaces data-checklist.js
// It organizes all checklist items by their respective in-game world.
// UPDATED: Added 'auras' and 'accessories' categories with data from images.

const checklistDataByWorld = {
  "Earth City": {
    gachas: [
      { id: 'g1', name: 'Dragon Race' },
      { id: 'g2', name: 'Saiyan' }
    ],
    progressions: [],
    sssRank: [
      { id: 's1', name: 'Kid Kohan' }
    ],
    auras: [
      { id: 'a1', name: 'Luck Aura (SS)' }
    ],
    accessories: [
      { id: 'ac1', name: '4 Star Hat (SS)' },
      { id: 'ac2', name: 'Imp Tail (Halloween)' }
    ]
  },
  "Windmill Island": {
    gachas: [
      { id: 'g3', name: 'Pirate Crew' },
      { id: 'g5', name: 'Swords' }
    ],
    progressions: [
      { id: 'l1', name: 'Haki (60)' }
    ],
    sssRank: [
      { id: 's2', name: 'Shanks' }
    ],
    auras: [
      { id: 'a2', name: 'Red Emperor Aura (SS)' }
    ],
    accessories: [
      { id: 'ac3', name: 'Armless Cloak (SS)' }
    ]
  },
  "Soul Society": {
    gachas: [
      { id: 'g6', name: 'Reiatsu Color' },
      { id: 'g7', name: 'Zanpakuto' }
    ],
    progressions: [
      { id: 'l2', name: 'Pressure (210)' }
    ],
    sssRank: [
      { id: 's3', name: 'Eizen' }
    ],
    auras: [
      { id: 'a3', name: 'Purple Traitor Aura(SS)' }
    ],
    accessories: []
  },
  "Cursed School": {
    gachas: [
      { id: 'g8', name: 'Curses' }
    ],
    progressions: [
      { id: 'l3', name: 'Cursed Progression (410)' }
    ],
    sssRank: [
      { id: 's4', name: 'Sakuni' }
    ],
    auras: [
      { id: 'a4', name: 'Fire King Aura (SS)' }
    ],
    accessories: []
  },
  "Slayer Village": {
    gachas: [
	  { id: 'g45', name: 'Breathings'},
      { id: 'g9', name: 'Demon Arts' }
    ],
    progressions: [
    ],
    sssRank: [
      { id: 's5', name: 'Rangaki' }
    ],
    auras: [
      { id: 'a5', name: 'Flaming Aura (SS)' }
    ],
    accessories: []
  },
  "Solo Island": {
    gachas: [
	  { id: 'g10', name: 'Solo Hunter Rank' }
    ],
    progressions: [
	  { id: 'l4', name: 'Reawakening (210)' },
      { id: 'l5', name: 'Monarch (200)' },
	  { id: 'g46', name: 'Shadow Ugrades' }
    ],
    sssRank: [
      { id: 's6', name: 'Statue of God' }
    ],
    auras: [
      { id: 'a6', name: 'Statue Aura (SS)' }
    ],
    accessories: []
  },
  "Clover Village": {
    gachas: [
      { id: 'g11', name: 'Grimoire' }
    ],
    progressions: [
      { id: 'l6', name: 'Water Spirit (100)' },
      { id: 'l7', name: 'Fire Spirit (100)' },
      { id: 'l8', name: 'Wind Spirit (10)' }
    ],
    sssRank: [
      { id: 's7', name: 'Novi Chroni' }
    ],
    auras: [],
    accessories: []
  },
  "Leaf Village": {
    gachas: [
	{ id: 'g12', name: 'Power Eyes' }
	],
    progressions: [
      { id: 'l9', name: 'Chakra (210)' },
	  { id: 'l9', name: 'Attack Range 2 (4)' }
    ],
    sssRank: [
      { id: 's8', name: 'Madera/Itachi' }
    ],
    auras: [
      { id: 'a7', name: 'Leafy Aura (SS)' }
    ],
    accessories: [
      { id: 'ac4', name: 'Shinobi Flops (SS)' }
    ]
  },
  "Spirit Residence": {
    gachas: [      
	  { id: 'g13', name: 'Psychic Mayhem' }
	],
    progressions: [
	  { id: 'l10', name: 'Spiritual Upgrade (60)' },
      { id: 'l11', name: 'Lucky Spirit (50)' },
	],
    sssRank: [
      { id: 's9', name: 'Ken Turbo' }
    ],
    auras: [],
    accessories: []
  },
  "Magic Hunter City": {
    gachas: [
	  { id: 'g14', name: 'Energy Card Shop' },
      { id: 'g15', name: 'Damage Card Shop' },
    ],
    progressions: [
      { id: 'l12', name: 'Ten (110)' },
	  { id: 'l13', name: 'Contract of Greed (100)' },
	  { id: 'l13', name: 'Energy Obelisk (30)' }
    ],
    sssRank: [
      { id: 's10', name: 'Killas Godspeed' }
    ],
    auras: [
      { id: 'a8', name: 'Energetic Aura (SS)' }
    ],
    accessories: []
  },
  "Titan City": {
    gachas: [
      { id: 'g16', name: 'Families' },
	  { id: 'g16', name: 'Titans' },
	  { id: 'g16', name: 'Titan Injection' }
    ],
    progressions: [
    ],
    sssRank: [
      { id: 's11', name: 'Eran' }
    ],
    auras: [
      { id: 'a9', name: 'Titanic Aura (SS)' }
    ],
    accessories: [
      { id: 'ac5', name: 'Red Scarf (C)' },
      { id: 'ac6', name: 'Clean Hat (S)' },
      { id: 'ac7', name: 'Scout Cloak (SS)' }
    ]
  },
  "Village of Sins": {
    gachas: [
      { id: 'g17', name: 'Sins' },
      { id: 'g18', name: 'Commandments' }
    ],
    progressions: [
	  { id: 'l29', name: 'Energy (50)' },
	  { id: 'l29', name: 'Sin Upgrades' }
    ],
    sssRank: [
      { id: 's12', name: 'Esanor' }
    ],
    auras: [],
    accessories: []
  },
  "Kaiju Base": {
    gachas: [
      { id: 'g19', name: 'Kaiju Powers' }
    ],
    progressions: [
	  { id: 'l17', name: 'Fortitude (210)' },
      { id: 'l16', name: 'Kaiju Energy (110)' }
    ],
    sssRank: [
      { id: 's13', name: 'Number 8' }
    ],
    auras: [
      { id: 'a10', name: 'Monster Aura (SS)' }
    ],
    accessories: []
  },
  "Tempest Capital": {
    gachas: [
      { id: 'g20', name: 'Ultimate Skill' },
      { id: 'g21', name: 'Species' }
    ],
    progressions: [
	  { id: 'l18', name: 'Demon Lord Energy (210)' },
      { id: 'l19', name: 'Demon Lord Damage (210)' },
      { id: 'l20', name: 'Demon Lord Coins (100)' },
      { id: 'l21', name: 'Demon Lord Luck (50)' }
	  ],
    sssRank: [
      { id: 's14', name: 'Valzora' }
    ],
    auras: [],
    accessories: [
      { id: 'ac8', name: 'Slime Mask (S)' }
    ]
  },
  "Virtual City": {
    gachas: [
	  { id: 'g47', name: 'Power Energy Runes' },
      { id: 'g48', name: 'Damage Runes' }
	],
    progressions: [
	  { id: 'l22', name: 'Swordsman Energy (210)' },
      { id: 'l24', name: 'Swordsman Damage (110)' },
	  { id: 'l24', name: 'Damage Obelisk (30)' }
	],
    sssRank: [
      { id: 's15', name: 'The Paladin' }
    ],
    auras: [
      { id: 'a11', name: 'Virtual Aura (SS)' }
    ],
    accessories: []
  },
  "Cairo": {
    gachas: [
	  { id: 'g23', name: 'Stands' },
      { id: 'g23', name: 'Onomatopoeia' },
      { id: 'g49', name: 'Requium Injection'}
    ],
    progressions: [
      { id: 'l25', name: 'Ripple Energy (110)' }
    ],
    sssRank: [
      { id: 's16', name: 'Dino' }
    ],
    auras: [
      { id: 'a12', name: 'Hamon Aura (SS)' }
    ],
    accessories: [
      { id: 'ac9', name: 'Greenello Scarf (C)' }
    ]
  },
  "Ghoul City": {
    gachas: [
      { id: 'g24', name: 'Investigators' },
      { id: 'g25', name: 'Kagune' }
    ],
    progressions: [
      { id: 'l26', name: 'Damage Cells (110)' },
      { id: 'l27', name: 'Kagune Leveling (50)' }
    ],
    sssRank: [
      { id: 's17', name: 'Arama' }
    ],
    auras: [
      { id: 'a13', name: 'Ghoul Aura (SS)' }
    ],
    accessories: []
  },
  "Chainsaw City": {
    gachas: [
      { id: 'g26', name: 'Debiru Hunter' },
      { id: 'g27', name: 'Akuma Powers' }
    ],
    progressions: [
	  { id: 'l30', name: 'Akuma Damage (110)' },
	  { id: 'l30', name: 'Akuma Energy (160)' },
      { id: 'l30', name: 'Pokita (50)' }
    ],
    sssRank: [
      { id: 's18', name: 'Hero Of Hell' }
    ],
    auras: [],
    accessories: [
      { id: 'ac10', name: 'Pokita Slides (D)' }
    ]
  },
  "Tokyo Empire": {
    gachas: [
      { id: 'g28', name: 'Special Fire Force' },
      { id: 'g50', name: 'Mushi Bite' },
	  { id: 'g51', name: 'Adolla Blessing' }
    ],
    progressions: [
      { id: 'l31', name: '1st Gen Leveling (20)' },
      { id: 'l32', name: '2nd Gen Leveling (40)' },
      { id: 'l33', name: '3rd Gen Leveling (60)' },
      { id: 'l34', name: '4th Gen Leveling (80)' },
      { id: 'l35', name: 'Adolla Leveling (100)' }
    ],
    sssRank: [
      { id: 's19', name: 'Bansho' }
    ],
    auras: [
      { id: 'a14', name: 'Fire Captain Aura (SS)' }
    ],
    accessories: [
      { id: 'ac11', name: 'Fire Force Pants (C)' },
      { id: 'ac12', name: 'Fire Force Cape (S)' },
      { id: 'ac13', name: 'Fire Witch Hat (S)' },
      { id: 'ac14', name: 'Fire Eye Patch (SS)' }
    ]
  },
  "Green Planet": {
    gachas: [
      { id: 'g29', name: 'Grand Elder Power' },
      { id: 'g30', name: 'Frost Demon Evolution' },
    ],
    progressions: [
	{ id: 'l38', name: 'Dragon Race Leveling (25)' },
	{ id: 'l38', name: 'Saiyan Evolution Leveling (25)' },
	{ id: 'l38', name: 'Eternal Dragon (50)' },
    { id: 'l39', name: 'Dragon Energy (50)' },
    { id: 'l40', name: 'Dragon Damage (500)' },
	{ id: 'l40', name: 'Luck Obelisk (15)' }
	],
    sssRank: [
      { id: 's20', name: 'Frezi Final Form' }
    ],
    auras: [],
    accessories: [
      { id: 'ac15', name: 'Scarffy (D)' }
    ]
  },
  "Hollow World": {
    gachas: [
	{ id: 'g31', name: 'Scythes' },
	{ id: 'g31', name: 'Bankai' },
	{ id: 'g31', name: 'Espada' }
	],
    progressions: [
	{ id: 'g31', name: 'Reiatsu Leveling' },
	{ id: 'g31', name: 'Zanpakuto Leveling' }
	],
    sssRank: [      
	{ id: 's21', name: 'Vasto Ichige' }
	],
    auras: [],
    accessories: []
  },
  "Shadow Academy": {
    gachas: [
      { id: 'g32', name: 'Shadow Garden' },
      { id: 'g33', name: 'Shadow Arts' }
    ],
    progressions: [
      { id: 'l44', name: 'Eminence Energy (100)' },
      { id: 'l45', name: 'Eminence Damage (100)' },
      { id: 'l46', name: 'Eminence Luck (100)' },
      { id: 'l47', name: 'Eminence Coins (100)' },
      { id: 'l48', name: 'Shadow Garden Leveling (50)' },
      { id: 'l49', name: 'Shadow Arts Leveling (50)' }
    ],
    sssRank: [
      { id: 's22', name: 'Shadow' }
    ],
    auras: [
      { id: 'a15', name: 'Bloody Aura (SS)' }
    ],
    accessories: [
      { id: 'ac16', name: 'Neck Fur (D)' },
      { id: 'ac17', name: 'Crested Wingbands (B)' }
    ]
  },
  "Z City": {
    gachas: [
      { id: 'g34', name: 'Energy Threat Level' },
      { id: 'g35', name: 'Punch Power' }
    ],
    progressions: [
      { id: 'l50', name: 'Energy Threat Leveling (50)' },
      { id: 'l51', name: 'Punch Power Leveling (50)' },
	  { id: 'l51', name: 'Hide N Punch (10)' },
    ],
    sssRank: [
      { id: 's23', name: 'Galaxy Hunter' }
    ],
    auras: [],
    accessories: [
      { id: 'ac18', name: 'Red Hero Boots (S)' }
    ]
  },
  "Great Tomb": {
    gachas: [
      { id: 'g36', name: 'Adventurer Rank' },
      { id: 'g37', name: 'Magic Tier' }
    ],
    progressions: [
      { id: 'l52', name: 'Mana Growth (100)' },
      { id: 'l53', name: 'Ultimate Cast (100)' },
      { id: 'l54', name: 'Adventurer Level (50)' },
      { id: 'l55', name: 'Magic Tier Level (50)' },
	  { id: '156', name: 'Demon Fruit Leveling (4)' }
    ],
    sssRank: [
      { id: 's24', name: 'Anz Ool Gawn' }
    ],
    auras: [],
    accessories: [
      { id: 'ac19', name: 'Jalbathar Tail (Tomb Arena)' },
      { id: 'ac20', name: 'Jalbathar Mask (Tomb Arena)' },
      { id: 'ac21', name: 'Jalbathar Wings (Tomb Arena)' }
    ]
  },
  "Thriller Park": {
    gachas: [
        { id: 'g38', name: 'Thriller Zombie' },
        { id: 'g39', name: 'Nightmare Evolution' },
        { id: 'g40', name: 'Zombie Crafts' },
        { id: 'g41', name: 'Special Zombie' },
        { id: 'g42', name: 'Zombie Booster' }
    ],
    progressions: [
        { id: '157', name: 'Special Zombie Crafting (10)' },
        { id: '158', name: 'Special Zombie Fusion (2)' }
    ],
    sssRank: [
        { id: 's25', name: 'Gekar Morra' }
    ],
    auras: [],
    accessories: []
  },
  "Amusement Park": {
      gachas: [
          { id: 'g43', name: 'Assasin Grade' },
          { id: 'g44', name: 'Assasin Skill' }
      ],
      progressions: [
        { id: '158', name: 'Assassin Energy (100)' },
        { id: '158', name: 'Assassin Damage (100)' },
        { id: '158', name: 'Assassin Critical Energy (10)' },
        { id: '158', name: 'Assassin Critical Damage (10)' }
      ],
      sssRank: [
          { id: 's26', name: 'Tagamura' }
      ],
      auras: [],
      accessories: []
  },
};
