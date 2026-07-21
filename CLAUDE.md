# CLAUDE.md — EHT Community Hub & Card Studio

## What this project is
A **community toolset for the mobile game Evil Hunter Tycoon (EHT)**, built by Vonner (a.k.a. PapaV) for a Discord community (guild "NG" / OXO circles). It is NOT a public wiki — it's a private/community tool for quickly creating and sharing META hunter build cards and keeping the community updated.

The flagship feature is a **drag-and-drop / click-to-upload Build Card Creator** that exports polished PNG cards matching the community's established visual style.

## Files
- `studio.html` — the Build Card Creator (single-file HTML app, no backend). Main file.
- `/icons/` — game icon assets organized by category. Auto-loading folders (drop a correctly-named file in and it shows up in the studio automatically, no code changes needed — falls back to placeholder emoji if missing, and manual per-card upload always overrides the auto-loaded default without being wiped by re-picking/reloading/Save-Load):
  - `Paragon Badge (subclass)/{Base Class}/{Paragon Name}.png` — single badge icon, used for the 4th-class icon slot. 10/10 done.
  - `classes/{Base Class} Subclasses/{Paragon Name}/M.png` + `F.png` — the two big male/female sprite portraits, top-left of the card. All 10 done (backgrounds made transparent + auto-cropped to content — see `classes_originals_backup/` for pre-edit originals).
  - `classes/{Base Class} Subclasses/{Paragon Name}/crest.png` — optional compact (~1:1) combined image (both characters flanking the OXO crown/logo) that replaces BOTH the M/F sprite boxes AND the OXO footer badge when present for that Paragon, sitting in the same upper-left spot the sprite boxes normally occupy (falls back to the separate M/F sprites + OXO badge if no crest.png exists). Only Holy Knight has one so far — Vonner plans to eventually provide one per Paragon. (An earlier full-width "banner above the title" version of this idea was tried and reverted — don't resurrect that layout without being asked.)
  - `skills/{Name}.png` — icons for the Subclasses row (base/2nd/3rd class), one file per name in `CLASS_TREE` (35 total: 5 base + 15 second + 15 third). All 35 done.
  - `traits/{Trait Name}.png` — one per trait in the 10-trait list (Quicken, Double Attack, Curse, Stone Skin, Penetration, Vital, Sixth Sense, Finding, Rich, Wisdom). All 10 done.
  - `mounts/`, `runes/` — currently manual-upload only, no fixed name list/picker built yet.
  - `equipment/` (`Abyss/`, `PVP/`, `Uniques/`) — has some assets already, manual-upload only (no picker).
- `/branding/` — OXO logo (`oxo-logo.png`, auto-loaded as the card's badge, bottom-right of the footer — currently a compact ~1:1 crest with two chibi characters flanking the crown/OXO wordmark) and `borders/` (reference screenshots of EHT's in-game UI, used to inform the card's frame/corner styling).
- `/references/` — sample exported build cards used as visual style references.
- (future) `hub.html` — community dashboard: meta tier list, build library, codes tracker, patch notes.
- (future) `/builds/` — saved build presets as JSON.

## Tech constraints (IMPORTANT)
- **Pure HTML/CSS/JS, single-file where possible.** No build step, no framework, no npm packages to run. Vonner is non-technical and hosts by double-clicking the HTML or via GitHub Pages later.
- **No browser localStorage/sessionStorage** unless explicitly hosting (artifacts-style restriction is gone here since it's local, but keep state simple).
- Export uses **html2canvas** (loaded via CDN) to render the card to PNG at 2x scale.
- Fonts via Google Fonts CDN: Cinzel Decorative, Cinzel, IM Fell English.

## The Card Format (match this exactly)
Cards are **1100px wide**, dark gothic fantasy aesthetic. Structure:

**Title bar** (top): `~TYPE BUILD-TITLE FLOOR~` in Cinzel Decorative, per-word coloring. Types: PVE (green), PVP (red), DUNGEON (blue), FIELD (purple), DS (gold).

**Two-column body:**
- **LEFT panel:** two character sprite boxes, build name + characteristic, Description (with optional red warning note), Subclasses row (icons + "+" separators), Characteristic + Mount slots (with steel slots below), Trait Combo (two rows with "OR" between, each slot has a level label like "Lvl 5").
- **RIGHT panel** splits again:
  - **Class column** (4TH CLASS): class name, class icon, "Unlock all skills first (lvl 5)" note, "Prio Max Lvl", and a **centered** skill tree (rows of skill icon slots — MUST be center-aligned, not left).
  - **Equipment column:** EQUIPMENT header, multiple equipment Sets (each with label, optional "Better Version available" badge, italic note, and item slots + "Optional" slot), Runes + Virtue panels side by side, then General Stats Allocation (8 stats in 2 columns, "Note: Sorted by priority.").

**Footer:** creator credit (left), watermark (right).

**Styling signature:** semi-transparent dark panels over an optional uploaded **background image** (atmospheric character/dungeon art), gold ornate SVG corner decorations, runic strips top & bottom, gold (#d4a030) borders. This matches the quality of the competitor "TheGoddess" cards while keeping the community's own layout.

## Game knowledge (EHT)

### Classes & Class Tree
There are **5 base classes**: Berserker, Ranger, Paladin, Sorcerer, Dark Knight.

Each class follows a progression: 1st class (base) → 2nd class → 3rd class → 4th class (Paragon). The 1st/2nd/3rd class icons are not a separate asset category in-game — they live inside the Skills tab UI alongside the actual skill icons. Only the Paragon (4th class) has its own distinct "badge" icon.

**Important:** the 2nd class, 3rd class, and Paragon picks are each independently selectable — they are NOT locked branch pairs. Any 2nd class choice can combine with any 3rd class choice, and either can lead into either Paragon option. (Confirmed from the community's own build cards: `Sorcerer + ArchMage + DarkLord` appears under both **Oppositor** and **Mana Lord** in different builds.) The Build Card Studio's class picker reflects this — it's a cascading picker (base → 2nd → 3rd → Paragon), not a fixed tree.

Note: Ranger's base-class icon is labeled "Archer" in-game on at least one community card, but "Ranger" is used consistently as the category name elsewhere and in the Studio.

**2nd class options (each base class has 3):**
| Base Class   | Option 1  | Option 2   | Option 3     |
|--------------|-----------|------------|--------------|
| Berserker    | Duelist   | Slayer     | Warrior      |
| Ranger       | HawkEye   | Sniper     | SummonArcher |
| Paladin      | Crusader  | Templar    | DarkPaladin  |
| Sorcerer     | ArchMage  | DarkMage   | Ignis        |
| Dark Knight  | Doomrider | ShadowLancer | LanceMaster |

**3rd class options (each base class has 3):**
| Base Class   | Option 1   | Option 2     | Option 3      |
|--------------|------------|--------------|---------------|
| Berserker    | Barbarian  | SwordSaint   | Destroyer     |
| Ranger       | Minstrel   | Scout        | ArcaneArcher  |
| Paladin      | Guardian   | Inquisitor   | Executor      |
| Sorcerer     | Conjuror   | DarkLord     | Illusionist   |
| Dark Knight  | AbyssDefender | EvilKnight | DragonKnight |

**4th class (Paragon class) — each base class has TWO Paragon options:**
| Base Class   | Paragon Option A    | Paragon Option B   |
|--------------|---------------------|--------------------|
| Berserker    | Sword Emperor       | Battle Commander   |
| Ranger       | Deadeye             | Star Shooter       |
| Paladin      | Holy Knight         | High Priest        |
| Sorcerer     | Mana Lord           | Oppositor          |
| Dark Knight  | Overlord            | Deathbringer       |

The "Paragon" system was added in a major update; unlocking requires all skills at lvl 5 first, then "Prio Max Lvl."

Known Paragon signature skills (from official docs):
- **Sword Emperor:** Blade Finish — deals 3500–8000% DPS as burst damage
- **Deadeye:** Vengeance — transforms into spirit of vengeance, fires special arrows (30s cooldown)
- **Holy Knight:** Token of Punishment — creates tokens during normal attacks that enhance the caster
- **Mana Lord:** Mana Charge — gathers mana orbs that power up skills
- **Battle Commander:** Hyper Blitz — chance to trigger during normal attacks

### Hunter Stats
9 tracked stats per hunter:
| Stat | Description | Cap |
|------|-------------|-----|
| HP | Health points | — |
| Satiety | Decreases per hit dealt; at 0 hunter returns to town | — |
| Mood | Decreases when hit; other stats scale with Mood gauge | — |
| Stamina | Energy reserve | — |
| ATK | Raw attack damage | — |
| DEF | Damage reduction | — |
| Crit Chance | Chance for 1.5× critical hit | **50% cap** |
| ATK SPD | Lower = faster; hard stat to get | **0.25 minimum (best target)** |
| Evasion | Chance to dodge attacks | **40% cap** |

**Stat quality color coding** (on equipment and hunter stat lines):
- White = Normal
- Sky Blue = High
- Orange = Highest
- Purple = Ultimate

Stats NOT counted as "lines": weapon base stats, Chaos options, Abyss options.

### Hunter Tiers (by total stat points)
| Tier       | Point Range |
|------------|-------------|
| Normal     | 0–1         |
| Rare       | 2–5         |
| Superior   | 6–9         |
| Heroic     | 10–13       |
| Legendary  | 14–21       |
| Ultimate   | 22–27       |

### Characteristics
Hunters spawn with a characteristic that permanently affects behavior/stats. Highly valued in build cards. Full list below verified against [ehtmanager.com/database/characteristics](https://ehtmanager.com/database/characteristics) (34 total) — this replaced an earlier, less accurate community-notes version, so treat this table as authoritative over prior assumptions. Studio's Characteristic field is a dropdown restricted to the 13 Positive ones only.

**Positive (13):**
- **Charismatic** — help party's stats when in the Dungeon and Coliseum by 5%
- **Strong** — increase ATK by 10%
- **Swift** — increase ATK SPD by 10%
- **Heroic** — increase ATK SPD, ATK and movement speed by 7%
- **Man of Steel** — decrease damage taken by 10%
- **Nimble** — increase Evasion by 3%
- **Optimistic** — decrease Mood consumption by 20%
- **Rich** — find more gold when hunting by 20%
- **Energetic** — decrease Stamina consumption by 20%
- **Fast Runner** — increase movement speed by 10%
- **Gambler** — increase enchantment success rate by 5%
- **Sharp** — increase CRIT by 3%
- **Skinny** — decrease Food consumption by 20%

**Negative (11):**
- **Baggy Eyes** — increase Stamina consumption by 20%
- **Coward** — always runs away early when hunting with just a few hits
- **Dead Weight** — reduces party's stats when in the Dungeon and Coliseum by 5%
- **Thickheaded** — decrease ATK SPD by 10%
- **Dull** — decrease CRIT by 3%
- **Fragile** — decrease ATK by 10%
- **Laggard** — decrease EXP gain by 10%
- **Overweight** — increase Food consumption by 20%
- **Pessimistic** — increase Mood consumption by 20%
- **Slow** — decrease movement speed by 10%
- **Sluggish** — decrease Evasion by 3%

**Neutral (10):**
- **Careless** — sell items 20% cheaper
- **Addict** — makes weird noise when consuming a potion (flavor only)
- **Fearless** — does not run away from battle
- **Stingy** — sell items 20% more expensive
- **Internet Troll** — no effect
- **Naughty** — no effect
- **Ordinary** — no effect
- **Rude** — no effect
- **Scared of Hospital** — afraid when going to the Infirmary, always leaves from hunting with low HP
- **YOLO** — never runs away

### Reincarnation System
- Hunters reincarnate at level 100 (up to **5 times**)
- Each reincarnation: level resets to 1, stats are boosted, earn **+1 Trait Point**
- After 5 reincarnations: hunters at lv100 generate **Shadow Souls** instead of EXP
- Shadow Souls are spent at the Academy to perform **2nd class change** (costs ~1,000,000 Shadow Souls)

### Traits
- 10 total learnable traits; each costs 1 Trait Point (earned via reincarnation)
- Traits can be reset using a **Phoenix Feather**
- You can pick any combination of traits up to your available points

### Equipment
**Slot types:** Weapon, Headpiece, Armor, Gloves, Shoes, Necklace, Ring  
(Weapons are class-specific; armor/accessories are shared by all classes)

**Quality tiers:** Normal → Sturdy → Sophisticated/Refined → Powerful → Transcended  
**Weapon tiers:** C → B → A → S → SS

**Equipment options system:**
- B-tier and above have additional options
- Options split into: Positive, Negative, and Unique
- Up to 5 **Virtues** can be assigned to each piece
- **Runes** and **Skill Runes** can be embedded

**Advanced equipment systems:**
- **Inheritance** — transfers quality tier, option tier, rune, and skill rune from a parent item to an heir item
- For endgame inheritance: only Chaos and Abyss equipment can be heir items
- **Chaos Options** — modified an unlimited number of times (costs 10 Chaos Souls for SSS gear; Abyss Souls + gold for L gear)
- **Hidden abilities** — unlocked with Angel Teardrops on Transcended-prefix gear
- **Slot Engraving** — a feature that adds special engravings to equipment slots
- **Dual Unique Equipment** — recent update allows hunters to equip TWO unique items instead of one (the "Dual Equip" toggle in the studio)

**Enhancement:** Upgrade gear to +10 early, +15 at Expert stage (high success rate needed)

### Game Modes
| Mode | Description |
|------|-------------|
| **Field Hunt** | Standard hunter farming in zones |
| **Dungeon Raid** | 5-hunter team clears underground dungeon floors for rare materials (Cyclops' Eye, Vampire Essence) |
| **Field Boss** | Horn-summoned boss fight; 10-min limit; berserk at <2 min remaining |
| **PVP Colosseum** | 5v5 team battle against other players; recommended: 2 Berserkers, 2 Rangers, 1 Sorcerer or Paladin |
| **Darkness' Front Yard** | Portal defense mode; now has sweep feature (up to 10× at once after clearing once) |
| **Infinite Dungeon** | Endless dungeon pushing for records |
| **Shadow of the Dark Lord** | Special challenge mode |

### Difficulty & Progression
- **8 difficulty levels** total
- Endgame path: **bx30 → Chaos x1 → Abyss → Chaos Boost 20 / Dungeon Floor 326**
- Chaos Souls and Abyss Souls are the endgame currencies for gear modification
- Dungeon floor 376 appears in community builds (DS Solo Holy Knight 376F)

### Key Town Buildings
- **Academy** — class changes, research
- **Blacksmith / Alchemist / Jeweler** — equipment crafting
- **Dungeon Entrance** — enables dungeon raids
- **Infirmary** — heals hunters (some characteristics interact with this)
- **Trading Post** — hunters sell looted materials here

### Coupon / Gift Codes
- Codes are time-limited and expire in days to weeks
- Redeem at: **gift.supermembers.net/coupon/** OR in-game Settings → Coupon
- Rewards: Elixirs, chests, summoning items
- Community tracks active codes on mrguider.org and tryhardguides.com

### Reference: ehtmanager.com
[ehtmanager.com](https://ehtmanager.com) is a fan-made EHT database/builder site — useful source of truth for game data when building studio features. It's a client-rendered SPA (plain fetches only return the empty shell; needs an actual browser/JS execution to read). Relevant pages: `/database/characteristics` (used to verify the Characteristics list above), `/database/classes`, `/database/items`, `/database/sets`, `/database/runes`, `/database/mounts`, and `/guide` (newbie guide). Not yet used: the items/sets/runes/mounts database, flagged by Vonner as a potential source for equipment icon data down the line.

## Build types in the community library (made by Vonner/PapaV)
Dungeon Slave Solo Holy Knight 376F, PVE/PVP HighPriest Tank, PVE Oppo DL Tank, PVE Battlelord (Mana Lord), PVE Mana Lord Demon/Animal Conju, PVP BC Deathcoil Cyclone, PVP BC Dual Aura Blade, PVE BC Dual Barb Bosser, PVE Sniper/Phoenix Deadeye Bosser, PVE SE Death Coil Cyclone Bosser, PVE SE Dual Barb Bosser, PVE SE Pulv Cyclone Fielder, and more.

## Style/working preferences
- Vonner is non-technical — explain changes in plain language, avoid jargon.
- Keep the studio easy to update as the game changes (new updates land often).
- Prioritize: clean export quality, easy icon management, matching the established card look.
- When adding icons, pre-load them into dropdowns/pickers so Vonner doesn't re-upload every time.

## Roadmap ideas (not yet built)
- Icon library picker (select from preloaded game icons instead of uploading each time).
- Save/load builds as JSON presets.
- Community hub page (meta tier list, codes tracker, patch notes).
- Batch export / template duplication.
