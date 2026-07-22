// ── GAME DATA ──
// Static EHT reference data shared by studio.html (desktop) and mobile.html (phone wizard).
// Edit this file once and both pages pick up the change — no need to update two places.
const CLASS_TREE={
  Berserker:{second:['Duelist','Slayer','Warrior'],third:['Barbarian','SwordSaint','Destroyer'],paragon:['Battle Commander','Sword Emperor']},
  Ranger:{second:['HawkEye','Sniper','SummonArcher'],third:['Minstrel','Scout','ArcaneArcher'],paragon:['Deadeye','Star Shooter']},
  Paladin:{second:['Crusader','Templar','DarkPaladin'],third:['Guardian','Inquisitor','Executor'],paragon:['Holy Knight','High Priest']},
  Sorcerer:{second:['ArchMage','DarkMage','Ignis'],third:['Conjuror','DarkLord','Illusionist'],paragon:['Mana Lord','Oppositor']},
  'Dark Knight':{second:['Doomrider','ShadowLancer','LanceMaster'],third:['AbyssDefender','EvilKnight','DragonKnight'],paragon:['Deathbringer','Overlord']},
};

// ── PARAGON SKILL TREE (7 rows) ──
// Row 1 uses classPick.paragon directly as the icon name (icons/paragon-tree/row1/{Paragon}.png)
// Row 4/Row 6 look up the actual skill name via ROW4_BY_SECOND/ROW6_BY_THIRD below,
// keyed by whichever 2nd/3rd class was picked in the Class Progression picker.
// Rows 2/3/5/7 are user-clickable choices among a fixed option list per row.
const PARAGON_TREE_ROW2={ // base class -> 3 choices, shared by both of that class's Paragons
  Berserker:['Proficient Swordsmanship','Forbidden Sword Magic','Armored Tank'],
  Ranger:['Triple Arrow','Fast Reload','Disincarnate'],
  Paladin:['Light of Punishment','Blinding Light','Holy Barrier'],
  Sorcerer:['Critical Lightning','Lightning Rod','Ice Shield'],
  'Dark Knight':['Power Slash','Round Force','Focus Sustain'],
};
const PARAGON_TREE_ROW3=['Attack','HP']; // universal, same for every class
const PARAGON_TREE_ROW5=['Crit Dmg','Damage Reduction']; // universal, same for every class
const ROW4_BY_SECOND={ // 2nd class name -> row 4 skill name (same set regardless of which Paragon)
  Duelist:'Blade Dance',Slayer:'Death Armor',Warrior:'Focused Hit',
  HawkEye:'Deadly Rain',Sniper:'Precise Shot',SummonArcher:'Elder Phoenix',
  Crusader:'Crisis Averted',Templar:'Monster Slayer',DarkPaladin:'Dark Flame',
  ArchMage:'Fierce Snowstorm',DarkMage:'Advanced Curse',Ignis:'Comet Cluster',
  Doomrider:'Cavalry Charge',ShadowLancer:'Shadow Armor',LanceMaster:'Rapid Spin',
};
const ROW6_BY_THIRD={ // 3rd class name -> row 6 skill name (same set regardless of which Paragon)
  Barbarian:'Endless Cry',SwordSaint:'Open Wound',Destroyer:'Heavy Whirlwind',
  Minstrel:'Hymn of Protection',Scout:'Neurotoxin',ArcaneArcher:'Dimension Arrow',
  Guardian:'Steel Stance',Inquisitor:'Rage Fist',Executor:'Soul Taker',
  Conjuror:'High Familiar',DarkLord:'Dark Protection',Illusionist:'Master of Terror',
  AbyssDefender:'Dark Shield',EvilKnight:'Finishing Blow',DragonKnight:'Hyper Flame',
};
const ROW1_BY_PARAGON={ // paragon -> row 1 skill name
  'Holy Knight':'Token of Punishment','High Priest':"Light's Grace",
  Overlord:'Hyper Blitz',Deathbringer:'Mistilteinn',
  'Mana Lord':'Mana Charge',Oppositor:'Elemental Force',
  Deadeye:'Vengeance','Star Shooter':'Falling Star',
  'Sword Emperor':'Blade Finish','Battle Commander':'Commanding Shout',
};
const PARAGON_TREE_ROW7={ // paragon -> 2 choices
  'Holy Knight':['Nova Explosion','Surging Punishment'],
  'High Priest':['Light of Holy Flame','Light of Life'],
  Overlord:['Rage Blitz','Darkness Blitz'],
  Deathbringer:['Curse Drinker','Death Ground'],
  'Mana Lord':['Overcharge','Lightning Orb'],
  Oppositor:['Force Enchant','Force Fusion'],
  Deadeye:['Persistent Vengeance','Inner Peace'],
  'Star Shooter':['Star Rush','Star of Debility'],
  'Sword Emperor':['Blade of Annihilation','Wedge Sword'],
  'Battle Commander':['Brave Commander','Resilient Commander'],
};

const SET_MAX_ITEMS=4;
// Equipment provides 4 random stat lines each across 8 pieces (weapon/chaos/abyss options excluded).
// These 3 are treated as always-maxed caps for basically every build (Barbarian being the known exception),
// so they're pinned at the top and only their value/line-count need editing, not their name.
const DEFAULT_STAT_CAPS=[
  {n:'Atk Spd',v:'0.25',lines:3},
  {n:'Crit Chance',v:'50%',lines:3},
  {n:'Evasion',v:'40%',lines:2},
];
const STAT_SUGGESTIONS=['Crit Dmg','Atk %','Def %','HP %','Racial Dmg','Lifesteal','Boss Dmg','PVP Dmg','Skill Dmg','Debuff Resist'];

const MOUNT_SKILLS=['Fierce Attack','Steadfast Defense','Glittering Luck'];
const MOUNT_TRAITS=['Swift Motion','Bravery','Fortunate','Bloodthirst','Endurance','Toughness'];
const MOUNT_EQUIP_VERSIONS=['Divine Bind','Corrupted Curse','Deceitful Hunter','Steel Trooper'];
const MOUNT_SLOT_CONFIG={
  m0:{title:'MOUNT SKILL',list:MOUNT_SKILLS,group:'skill',path:n=>`icons/mounts/${n}.png`},
  m1:{title:'MOUNT TRAIT',list:MOUNT_TRAITS,group:'trait',path:n=>`icons/mounts/${n}.png`},
  m2:{title:'MOUNT TRAIT',list:MOUNT_TRAITS,group:'trait',path:n=>`icons/mounts/${n}.png`},
  st0:{title:'HORSESHOE',list:MOUNT_EQUIP_VERSIONS,group:'horseshoe',path:n=>`icons/mounts/equipment/Horseshoe/${n}.png`},
  st1:{title:'SADDLE',list:MOUNT_EQUIP_VERSIONS,group:'saddle',path:n=>`icons/mounts/equipment/Saddle/${n}.png`},
  st2:{title:'REIN',list:MOUNT_EQUIP_VERSIONS,group:'rein',path:n=>`icons/mounts/equipment/Rein/${n}.png`},
};

// ── SPECIAL EQUIPMENT ITEM CATALOG (verified against ehtmanager.com/database/items) ──
// n=name, s=slot, c=class restriction (weapons only), t=tier label
const ITEM_UNIQUE=[{n:'Sufferer\'s Armor',s:'Armor',t:'Unique'},{n:'Hecate\'s Gloves',s:'Gloves',t:'Unique'},{n:'Lugh\'s Belt',s:'Belt',t:'Unique'},{n:'Alchemist\'s Belt',s:'Belt',t:'Unique'},{n:'Juggernaut Helm',s:'Hat',t:'Unique'},{n:'Commander\'s Necklace',s:'Necklace',t:'Unique'},{n:'Sylph\'s Belt',s:'Belt',t:'Unique'},{n:'Dragon\'s Blessing Necklace',s:'Necklace',t:'Unique'},{n:'Truthful Thunder Dragon\'s Belt',s:'Belt',t:'Unique'},{n:'Vampire Boots',s:'Boots',t:'Unique'},{n:'Hand of Midas',s:'Gloves',t:'Unique'},{n:'Frost Giant Cuirass',s:'Armor',t:'Unique'},{n:'Pumpkin Witch Hat',s:'Hat',t:'Unique'},{n:'Greaves of Wind',s:'Boots',t:'Unique'},{n:'Helmet of Insight',s:'Hat',t:'Unique'},{n:'Cyclone Ring',s:'Ring',t:'Unique'},{n:'Hades Necklace',s:'Necklace',t:'Unique'},{n:'Guardian\'s Sacrifice Ring',s:'Ring',t:'Unique'},{n:'Dragon Lord\'s Crown',s:'Hat',t:'Unique'},{n:'Bloodfist',s:'Gloves',t:'Unique'},{n:'Armor of Absorption',s:'Armor',t:'Unique'},{n:'Truthful Frost Giant Cuirass',s:'Armor',t:'Unique'},{n:'Greaves of Tenacity',s:'Boots',t:'Unique'},{n:'Truthful Greaves of Wind',s:'Boots',t:'Unique'},{n:'Truthful Helmet of Insight',s:'Hat',t:'Unique'},{n:'Truthful Cyclone Ring',s:'Ring',t:'Unique'},{n:'Truthful Hades Necklace',s:'Necklace',t:'Unique'},{n:'Thunder Dragon\'s Belt',s:'Belt',t:'Unique'},{n:'Trinity Ring',s:'Ring',t:'Unique'},{n:'Truthful Bloodfist',s:'Gloves',t:'Unique'}];
const ITEM_PVP={
  challenger:[{n:'Blue Diadem',s:'Hat',t:'SSS (PvP)'},{n:'Ares\' Sword',s:'Weapon',c:'Berserker',t:'SSS (PvP)'},{n:'Omega Gandiva',s:'Weapon',c:'Ranger',t:'SSS (PvP)'},{n:'Uranus\' Staff',s:'Weapon',c:'Sorcerer',t:'SSS (PvP)'},{n:'Red Diadem',s:'Hat',t:'SSS (PvP)'},{n:'Omega Mahes',s:'Weapon',c:'Paladin',t:'SSS (PvP)'},{n:'Artemis\' Bow',s:'Weapon',c:'Ranger',t:'SSS (PvP)'},{n:'Omega Gungnir',s:'Weapon',c:'Dark Knight',t:'SSS (PvP)'},{n:'Omega Fenrir',s:'Weapon',c:'Berserker',t:'SSS (PvP)'},{n:'Helio\'s Hammer',s:'Weapon',c:'Paladin',t:'SSS (PvP)'},{n:'Omega Isis',s:'Weapon',c:'Sorcerer',t:'SSS (PvP)'},{n:'Poseidon\'s Spear',s:'Weapon',c:'Dark Knight',t:'SSS (PvP)'}]
};
const ITEM_BOSS={
  sss:[{n:'Truthful Venom Staff',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Venom Bow',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Darkness Spear',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Darkness Staff',s:'Weapon',t:'SSS (Boss)'},{n:'Glacial Spear',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Venom Blade',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Venom Pike',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Darkness Sword',s:'Weapon',t:'SSS (Boss)'},{n:'Glacial Sword',s:'Weapon',t:'SSS (Boss)'},{n:'Blaze Staff',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Venom Scythe',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Darkness Bow',s:'Weapon',t:'SSS (Boss)'},{n:'Truthful Darkness Hammer',s:'Weapon',t:'SSS (Boss)'},{n:'Glacial Bow',s:'Weapon',t:'SSS (Boss)'},{n:'Blaze Hammer',s:'Weapon',t:'SSS (Boss)'}]
};

const CHARACTERISTIC_DESC={ // verified against ehtmanager.com/database/characteristics
  Charismatic:"Help party's stats when in the Dungeon and Coliseum by 5%",
  Strong:'Increase ATK by 10%',
  Swift:'Increase ATK SPD by 10%',
  Heroic:'Increase ATK SPD, ATK and movement speed by 7%',
  'Man of Steel':'Decrease damage taken by 10%',
  Nimble:'Increase Evasion by 3%',
  Optimistic:'Decrease Mood consumption by 20%',
  Rich:'Find more gold when hunting by 20%',
  Energetic:'Decrease Stamina consumption by 20%',
  'Fast Runner':'Increase movement speed by 10%',
  Gambler:'Increase enchantment success rate by 5%',
  Sharp:'Increase CRIT by 3%',
  Skinny:'Decrease Food consumption by 20%',
};

const TRAITS=['Quicken','Double Attack','Curse','Stone Skin','Penetration','Vital','Sixth Sense','Finding','Rich','Wisdom'];
const TRAIT_MAX_LEVEL=5, TRAIT_BUDGET=15, TRAIT_MAX_PICKS=5;
const traitCost=lvl=>lvl*(lvl+1)/2;

const VIRTUES=['Mercy','Glory','Justice','Devotion','Honor'];
const VIRTUE_MAX_SLOTS=8;
