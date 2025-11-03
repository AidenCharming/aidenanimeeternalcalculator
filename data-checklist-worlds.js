// data-checklist-worlds.js
// This file replaces data-checklist.js
// It organizes all checklist items by their respective in-game world.
// UPDATED: Added 'auras' and 'accessories' categories with data from images.

const checklistDataByWorld = {
  "Halloween World": {
    gachas: [
      { id: 'h1', name: 'Halloween Gacha' }
    ],
    progressions: [
      { id: 'h3', name: 'Ghost Leveling' },
      { id: 'h999', name: 'Overdrive Saw' }
    ],
    sssRank: [],
    auras: [
      { id: 'h4', name: 'Candy Aura (Carotto)' },
      { id: 'h5', name: 'Pumpkin Aura (Evil Bald Man)' },
      { id: 'h6', name: 'Plague Aura (Pumpkinado)' },
      { id: 'h7', name: 'Spookweb Aura (Bald Warlock)' },
      { id: 'h8', name: 'Demonflame Aura (Spook-Suke)' }
    ],
    accessories: [],
    quests: []
  },
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
    ],
    quests: [
      { id: 'cq1', name: 'Hero License'},
      { id: 'cq2', name: 'Key Quests'},
      { id: 'cq3', name: 'Obelisk Quest'}
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
    ],
    quests: [
      { id: 'cq4', name: 'Key Quests'},
      { id: 'cq5', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq6', name: 'Key Quests'},
      { id: 'cq7', name: 'Obelisk Quest'}
    ]
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
    accessories: [],
    quests: [
      { id: 'cq8', name: 'Key Quests'},
      { id: 'cq9', name: 'Obelisk Quest'}
    ]
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
    accessories: [],
    quests: [
      { id: 'cq10', name: 'Key Quests'},
      { id: 'cq11', name: 'Obelisk Quest'}
    ]
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
    accessories: [],
    quests: [
      { id: 'cq12', name: 'Hero License Quest'},
      { id: 'cq13', name: 'Key Quests'},
      { id: 'cq14', name: 'Obelisk Quest'}
    ]
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
    accessories: [],
    quests: [
      { id: 'cq15', name: 'Key Quests'},
      { id: 'cq16', name: 'Obelisk Quest'}
    ]
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
    ],
    quests: [
      { id: 'cq17', name: 'Key Quests'},
      { id: 'cq18', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq19', name: 'Key Quests'},
      { id: 'cq20', name: 'Obelisk Quest'}
    ]
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
    accessories: [],
    quests: [
      { id: 'cq21', name: 'Hero License Quests'},
      { id: 'cq22', name: 'Key Quests'},
      { id: 'cq23', name: 'Obelisk Quest'}
    ]
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
    ],
    quests: [
      { id: 'cq24', name: 'Key Quests'},
      { id: 'cq25', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq24', name: 'Key Quests'},
      { id: 'cq25', name: 'Obelisk Quest'}
    ]
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
    accessories: [],
    quests: [
      { id: 'cq26', name: 'Key Quests'},
      { id: 'cq27', name: 'Obelisk Quest'}
    ]
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
    ],
    quests: [
      { id: 'cq28', name: 'Key Quests'},
      { id: 'cq29', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq30', name: 'Hero License Quest'},
      { id: 'cq31', name: 'Key Quests'},
      { id: 'cq32', name: 'Obelisk Quest'}
    ]
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
    ],
    quests: [
      { id: 'cq33', name: 'Key Quests'},
      { id: 'cq34', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq35', name: 'CCG Quests'},
      { id: 'cq36', name: 'Key Quests'},
      { id: 'cq37', name: 'Obelisk Quest'}
    ]
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
    ],
    quests: [
      { id: 'cq38', name: 'Hero License Quests'},
      { id: 'cq39', name: 'Key Quests'},
      { id: 'cq40', name: 'Obelisk Quest'}
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
    ],
    quests: [
      { id: 'cq42', name: 'Key Quests'},
      { id: 'cq43', name: 'Obelisk Quest'}
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
    ],
    quests: [
      { id: 'cq43', name: 'Green Planet Quests'},
      { id: 'cq44', name: 'Key Quests'},
      { id: 'cq45', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq46', name: 'Key Quests'},
      { id: 'cq47', name: 'Obelisk Quest'}
    ]
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
    ],
    quests: [
      { id: 'cq48', name: 'Hero License Quests'},
      { id: 'cq49', name: 'Key Quests'},
      { id: 'cq50', name: 'Obelisk Quest'}
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
    ],
    quests: [
      { id: 'cq51', name: 'Key Quests'},
      { id: 'cq52', name: 'Obelisk Quest'}
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
    ],
    quests: [
      { id: 'cq53', name: 'Key Quests'},
      { id: 'cq54', name: 'Obelisk Quest'}
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
    accessories: [],
    quests: [
      { id: 'cq56', name: 'Demon Fruit Quest'},
      { id: 'cq57', name: 'Key Quests'},
      { id: 'cq58', name: 'Obelisk Quest'}
    ]
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
      accessories: [],
    quests: [
      { id: 'cq59', name: 'Key Quests'},
      { id: 'cq60', name: 'Obelisk Quest'}
    ]
  },
};
