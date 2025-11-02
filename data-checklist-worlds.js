// data-checklist-worlds.js
// This file replaces data-checklist.js
// It organizes all checklist items by their respective in-game world.
// UPDATED: Added 'auras' and 'accessories' categories with data from images.

const checklistDataByWorld = {
  "Earth City": {
    gachas: [
      { id: 'c1', name: 'Dragon Race' },
      { id: 'c2', name: 'Saiyan' }
    ],
    progressions: [],
    sssRank: [
      { id: 'c3', name: 'Kid Kohan' }
    ],
    auras: [
      { id: 'c4', name: 'Luck Aura (SS)' }
    ],
    accessories: [
      { id: 'c5', name: '4 Star Hat (SS)' },
      { id: 'c6', name: 'Imp Tail (Halloween)' }
    ]
  },
  "Windmill Island": {
    gachas: [
      { id: 'c7', name: 'Pirate Crew' },
      { id: 'c8', name: 'Swords' }
    ],
    progressions: [
      { id: 'c9', name: 'Haki (60)' }
    ],
    sssRank: [
      { id: 'c10', name: 'Shanks' }
    ],
    auras: [
      { id: 'c11', name: 'Red Emperor Aura (SS)' }
    ],
    accessories: [
      { id: 'c12', name: 'Armless Cloak (SS)' }
    ]
  },
  "Soul Society": {
    gachas: [
      { id: 'c13', name: 'Reiatsu Color' },
      { id: 'c14', name: 'Zanpakuto' }
    ],
    progressions: [
      { id: 'c15', name: 'Pressure (210)' }
    ],
    sssRank: [
      { id: 'c16', name: 'Eizen' }
    ],
    auras: [
      { id: 'c17', name: 'Purple Traitor Aura(SS)' }
    ],
    accessories: []
  },
  "Cursed School": {
    gachas: [
      { id: 'c18', name: 'Curses' }
    ],
    progressions: [
      { id: 'c19', name: 'Cursed Progression (410)' }
    ],
    sssRank: [
      { id: 'c20', name: 'Sakuni' }
    ],
    auras: [
      { id: 'c21', name: 'Fire King Aura (SS)' }
    ],
    accessories: []
  },
  "Slayer Village": {
    gachas: [
	  { id: 'c22', name: 'Breathings'},
      { id: 'c23', name: 'Demon Arts' }
    ],
    progressions: [
    ],
    sssRank: [
      { id: 'c24', name: 'Rangaki' }
    ],
    auras: [
      { id: 'c25', name: 'Flaming Aura (SS)' }
    ],
    accessories: []
  },
  "Solo Island": {
    gachas: [
	  { id: 'c26', name: 'Solo Hunter Rank' }
    ],
    progressions: [
	  { id: 'c27', name: 'Reawakening (210)' },
      { id: 'c28', name: 'Monarch (200)' },
	  { id: 'c29', name: 'Shadow Upgrades' }
    ],
    sssRank: [
      { id: 'c30', name: 'Statue of God' }
    ],
    auras: [
      { id: 'c31', name: 'Statue Aura (SS)' }
    ],
    accessories: []
  },
  "Clover Village": {
    gachas: [
      { id: 'c32', name: 'Grimoire' }
    ],
    progressions: [
      { id: 'c33', name: 'Water Spirit (100)' },
      { id: 'c34', name: 'Fire Spirit (100)' },
      { id: 'c35', name: 'Wind Spirit (10)' }
    ],
    sssRank: [
      { id: 'c36', name: 'Novi Chroni' }
    ],
    auras: [],
    accessories: []
  },
  "Leaf Village": {
    gachas: [
      { id: 'c37', name: 'Power Eyes' }
	],
    progressions: [
      { id: 'c38', name: 'Chakra (210)' },
	  { id: 'c39', name: 'Attack Range 2 (4)' }
    ],
    sssRank: [
      { id: 'c40', name: 'Madera/Itachi' }
    ],
    auras: [
      { id: 'c41', name: 'Leafy Aura (SS)' }
    ],
    accessories: [
      { id: 'c42', name: 'Shinobi Flops (SS)' }
    ]
  },
  "Spirit Residence": {
    gachas: [
      { id: 'c43', name: 'Psychic Mayhem' }
	],
    progressions: [
	  { id: 'c44', name: 'Spiritual Upgrade (60)' },
      { id: 'c45', name: 'Lucky Spirit (50)' },
	],
    sssRank: [
      { id: 'c46', name: 'Ken Turbo' }
    ],
    auras: [],
    accessories: []
  },
  "Magic Hunter City": {
    gachas: [
	  { id: 'c47', name: 'Energy Card Shop' },
      { id: 'c48', name: 'Damage Card Shop' },
    ],
    progressions: [
      { id: 'c49', name: 'Ten (110)' },
	  { id: 'c50', name: 'Contract of Greed (100)' },
	  { id: 'c51', name: 'Energy Obelisk (30)' }
    ],
    sssRank: [
      { id: 'c52', name: 'Killas Godspeed' }
    ],
    auras: [
      { id: 'c53', name: 'Energetic Aura (SS)' }
    ],
    accessories: []
  },
  "Titan City": {
    gachas: [
      { id: 'c54', name: 'Families' },
	  { id: 'c55', name: 'Titans' },
	  { id: 'c56', name: 'Titan Injection' }
    ],
    progressions: [
    ],
    sssRank: [
      { id: 'c57', name: 'Eran' }
    ],
    auras: [
      { id: 'c58', name: 'Titanic Aura (SS)' }
    ],
    accessories: [
      { id: 'c59', name: 'Red Scarf (C)' },
      { id: 'c60', name: 'Clean Hat (S)' },
      { id: 'c61', name: 'Scout Cloak (SS)' }
    ]
  },
  "Village of Sins": {
    gachas: [
      { id: 'c62', name: 'Sins' },
      { id: 'c63', name: 'Commandments' }
    ],
    progressions: [
	  { id: 'c64', name: 'Energy (50)' },
	  { id: 'c65', name: 'Sin Upgrades' }
    ],
    sssRank: [
      { id: 'c66', name: 'Esanor' }
    ],
    auras: [],
    accessories: []
  },
  "Kaiju Base": {
    gachas: [
      { id: 'c67', name: 'Kaiju Powers' }
    ],
    progressions: [
	  { id: 'c68', name: 'Fortitude (210)' },
      { id: 'c69', name: 'Kaiju Energy (110)' }
    ],
    sssRank: [
      { id: 'c70', name: 'Number 8' }
    ],
    auras: [
      { id: 'c71', name: 'Monster Aura (SS)' }
    ],
    accessories: []
  },
  "Tempest Capital": {
    gachas: [
      { id: 'c72', name: 'Ultimate Skill' },
      { id: 'c73', name: 'Species' }
    ],
    progressions: [
	  { id: 'c74', name: 'Demon Lord Energy (210)' },
      { id: 'c75', name: 'Demon Lord Damage (210)' },
      { id: 'c76', name: 'Demon Lord Coins (100)' },
      { id: 'c77', name: 'Demon Lord Luck (50)' }
	  ],
    sssRank: [
      { id: 'c78', name: 'Valzora' }
    ],
    auras: [],
    accessories: [
      { id: 'c79', name: 'Slime Mask (S)' }
    ]
  },
  "Virtual City": {
    gachas: [
	  { id: 'c80', name: 'Power Energy Runes' },
      { id: 'c81', name: 'Damage Runes' }
	],
    progressions: [
	  { id: 'c82', name: 'Swordsman Energy (210)' },
      { id: 'c83', name: 'Swordsman Damage (110)' },
	  { id: 'c84', name: 'Damage Obelisk (30)' }
	],
    sssRank: [
      { id: 'c85', name: 'The Paladin' }
    ],
    auras: [
      { id: 'c86', name: 'Virtual Aura (SS)' }
    ],
    accessories: []
  },
  "Cairo": {
    gachas: [
	  { id: 'c87', name: 'Stands' },
      { id: 'c88', name: 'Onomatopoeia' },
      { id: 'c89', name: 'Requium Injection'}
    ],
    progressions: [
      { id: 'c90', name: 'Ripple Energy (110)' }
    ],
    sssRank: [
      { id: 'c91', name: 'Dino' }
    ],
    auras: [
      { id: 'c92', name: 'Hamon Aura (SS)' }
    ],
    accessories: [
      { id: 'c93', name: 'Greenello Scarf (C)' }
    ]
  },
  "Ghoul City": {
    gachas: [
      { id: 'c94', name: 'Investigators' },
      { id: 'c95', name: 'Kagune' }
    ],
    progressions: [
      { id: 'c96', name: 'Damage Cells (110)' },
      { id: 'c97', name: 'Kagune Leveling (50)' }
    ],
    sssRank: [
      { id: 'c98', name: 'Arama' }
    ],
    auras: [
      { id: 'c99', name: 'Ghoul Aura (SS)' }
    ],
    accessories: []
  },
  "Chainsaw City": {
    gachas: [
      { id: 'c100', name: 'Debiru Hunter' },
      { id: 'c101', name: 'Akuma Powers' }
    ],
    progressions: [
	  { id: 'c102', name: 'Akuma Damage (110)' },
	  { id: 'c103', name: 'Akuma Energy (160)' },
      { id: 'c104', name: 'Pokita (50)' }
    ],
    sssRank: [
      { id: 'c105', name: 'Hero Of Hell' }
    ],
    auras: [],
    accessories: [
      { id: 'c106', name: 'Pokita Slides (D)' }
    ]
  },
  "Tokyo Empire": {
    gachas: [
      { id: 'c107', name: 'Special Fire Force' },
      { id: 'c108', name: 'Mushi Bite' },
	  { id: 'c109', name: 'Adolla Blessing' }
    ],
    progressions: [
      { id: 'c110', name: '1st Gen Leveling (20)' },
      { id: 'c111', name: '2nd Gen Leveling (40)' },
      { id: 'c112', name: '3rd Gen Leveling (60)' },
      { id: 'c113', name: '4th Gen Leveling (80)' },
      { id: 'c114', name: 'Adolla Leveling (100)' }
    ],
    sssRank: [
      { id: 'c115', name: 'Bansho' }
    ],
    auras: [
      { id: 'c116', name: 'Fire Captain Aura (SS)' }
    ],
    accessories: [
      { id: 'c117', name: 'Fire Force Pants (C)' },
      { id: 'c118', name: 'Fire Force Cape (S)' },
      { id: 'c119', name: 'Fire Witch Hat (S)' },
      { id: 'c120', name: 'Fire Eye Patch (SS)' }
    ]
  },
  "Green Planet": {
    gachas: [
      { id: 'c121', name: 'Grand Elder Power' },
      { id: 'c122', name: 'Frost Demon Evolution' },
    ],
    progressions: [
	{ id: 'c123', name: 'Dragon Race Leveling (25)' },
	{ id: 'c124', name: 'Saiyan Evolution Leveling (25)' },
	{ id: 'c125', name: 'Eternal Dragon (50)' },
    { id: 'c126', name: 'Dragon Energy (50)' },
    { id: 'c127', name: 'Dragon Damage (500)' },
	{ id: 'c128', name: 'Luck Obelisk (15)' }
	],
    sssRank: [
      { id: 'c129', name: 'Frezi Final Form' }
    ],
    auras: [],
    accessories: [
      { id: 'c130', name: 'Scarffy (D)' }
    ]
  },
  "Hollow World": {
    gachas: [
	{ id: 'c131', name: 'Scythes' },
	{ id: 'c132', name: 'Bankai' },
	{ id: 'c133', name: 'Espada' }
	],
    progressions: [
	{ id: 'c134', name: 'Reiatsu Leveling' },
	{ id: 'c135', name: 'Zanpakuto Leveling' }
	],
    sssRank: [      
	{ id: 'c136', name: 'Vasto Ichige' }
	],
    auras: [],
    accessories: []
  },
  "Shadow Academy": {
    gachas: [
      { id: 'c137', name: 'Shadow Garden' },
      { id: 'c138', name: 'Shadow Arts' }
    ],
    progressions: [
      { id: 'c139', name: 'Eminence Energy (100)' },
      { id: 'c140', name: 'Eminence Damage (100)' },
      { id: 'c141', name: 'Eminence Luck (100)' },
      { id: 'c142', name: 'Eminence Coins (100)' },
      { id: 'c143', name: 'Shadow Garden Leveling (50)' },
      { id: 'c144', name: 'Shadow Arts Leveling (50)' }
    ],
    sssRank: [
      { id: 'c150', name: 'Shadow' }
    ],
    auras: [
      { id: 'c160', name: 'Bloody Aura (SS)' }
    ],
    accessories: [
      { id: 'c161', name: 'Neck Fur (D)' },
      { id: 'c162', name: 'Crested Wingbands (B)' }
    ]
  },
  "Z City": {
    gachas: [
      { id: 'c163', name: 'Energy Threat Level' },
      { id: 'c164', name: 'Punch Power' }
    ],
    progressions: [
      { id: 'c165', name: 'Energy Threat Leveling (50)' },
      { id: 'c166', name: 'Punch Power Leveling (50)' },
	  { id: 'c167', name: 'Hide N Punch (10)' },
    ],
    sssRank: [
      { id: 'c168', name: 'Galaxy Hunter' }
    ],
    auras: [],
    accessories: [
      { id: 'c169', name: 'Red Hero Boots (S)' }
    ]
  },
  "Great Tomb": {
    gachas: [
      { id: 'c170', name: 'Adventurer Rank' },
      { id: 'c171', name: 'Magic Tier' }
    ],
    progressions: [
      { id: 'c172', name: 'Mana Growth (100)' },
      { id: 'c173', name: 'Ultimate Cast (100)' },
      { id: 'c174', name: 'Adventurer Level (50)' },
      { id: 'c175', name: 'Magic Tier Level (50)' }
    ],
    sssRank: [
      { id: 'c176', name: 'Anz Ool Gawn' }
    ],
    auras: [],
    accessories: [
      { id: 'c177', name: 'Jalbathar Tail (Tomb Arena)' },
      { id: 'c178', name: 'Jalbathar Mask (Tomb Arena)' },
      { id: 'c179', name: 'Jalbathar Wings (Tomb Arena)' }
    ]
  },
  "Thriller Park": {
    gachas: [
        { id: 'c180', name: 'Thriller Zombie' },
        { id: 'c181', name: 'Nightmare Evolution' },
        { id: 'c182', name: 'Zombie Crafts' },
        { id: 'c183', name: 'Special Zombie' },
        { id: 'c184', name: 'Zombie Booster' }
    ],
    progressions: [
        { id: 'c185', name: 'Special Zombie Crafting (10)' },
        { id: 'c186', name: 'Special Zombie Fusion (2)' },
        { id: 'c187', name: 'Demon Fruit Leveling (4)' }
    ],
    sssRank: [
        { id: 'c188', name: 'Gekar Morra' }
    ],
    auras: [],
    accessories: []
  },
  "Amusement Park": {
      gachas: [
          { id: 'c189', name: 'Assasin Grade' },
          { id: 'c190', name: 'Assasin Skill' }
      ],
      progressions: [
        { id: 'c191', name: 'Assassin Energy (100)' },
        { id: 'c192', name: 'Assassin Damage (100)' },
        { id: 'c193', name: 'Assassin Critical Energy (10)' },
        { id: 'c194', name: 'Assassin Critical Damage (10)' }
      ],
      sssRank: [
          { id: 'c195', name: 'Tagamura' }
      ],
      auras: [],
      accessories: []
  },
};
