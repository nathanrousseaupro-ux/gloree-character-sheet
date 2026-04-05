/* ═══════════════════════════════════════════════════════
   GLORÉE — main.js
   Form logic, stat calculation, UI interactions
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── SKILL DEFINITIONS ──────────────────────────────────
const SKILLS = [
  { name: 'Endurance',              formula: 'CON + DEX', fn: s => s.CON + s.DEX },
  { name: 'Athlétisme',             formula: 'FOR',       fn: s => s.FOR },
  { name: 'Puissance',              formula: 'FOR',       fn: s => s.FOR },
  { name: 'Acrobaties',             formula: 'DEX',       fn: s => s.DEX },
  { name: 'Discrétion',             formula: 'DEX',       fn: s => s.DEX },
  { name: 'Manipulation & Escamotage', formula: 'DEX',   fn: s => s.DEX },
  { name: 'Intimidation',           formula: 'CHA',       fn: s => s.CHA },
  { name: 'Persuasion',             formula: 'CHA',       fn: s => s.CHA },
  { name: 'Représentation',         formula: 'CHA',       fn: s => s.CHA },
  { name: 'Tromperie',              formula: 'max(CHA,INT)', fn: s => Math.max(s.CHA, s.INT) },
  { name: 'Investigation',          formula: 'INT',       fn: s => s.INT },
  { name: 'Histoire & Connaissances', formula: 'INT',    fn: s => s.INT },
  { name: 'Nature',                 formula: 'INT',       fn: s => s.INT },
  { name: 'Religion',               formula: 'INT',       fn: s => s.INT },
  { name: 'Énergies',               formula: 'max(INT,SAG)', fn: s => Math.max(s.INT, s.SAG) },
  { name: 'Intuition',              formula: 'moy(INT,SAG)', fn: s => Math.floor((s.INT + s.SAG) / 2) },
  { name: 'Médecine',               formula: 'SAG',       fn: s => s.SAG },
  { name: 'Perception',             formula: 'SAG',       fn: s => s.SAG },
  { name: 'Survivaliste',           formula: 'moy(INT,SAG)', fn: s => Math.floor((s.INT + s.SAG) / 2) },
  { name: 'Dressage',               formula: 'max(SAG,CHA)', fn: s => Math.max(s.SAG, s.CHA) },
];

// ── STATE ──────────────────────────────────────────────
let selectedBonusSkills = new Set();
let photoDataUrl = null;

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  spawnParticles();
  renderSkillsGrid();
  updateAll();
});

// ── STAT CALCULATION ───────────────────────────────────
function calcSave(stat) {
  return Math.floor((parseInt(stat) - 10) / 2);
}

function getSaves() {
  return {
    FOR: calcSave(document.getElementById('statFOR').value),
    DEX: calcSave(document.getElementById('statDEX').value),
    CON: calcSave(document.getElementById('statCON').value),
    INT: calcSave(document.getElementById('statINT').value),
    SAG: calcSave(document.getElementById('statSAG').value),
    CHA: calcSave(document.getElementById('statCHA').value),
  };
}

function formatSave(v) {
  return v >= 0 ? `+${v}` : `${v}`;
}

function updateSaveDisplay(id, val) {
  const el = document.getElementById(id);
  el.textContent = formatSave(val);
  el.className = 'save-val ' + (val > 0 ? 'pos' : val < 0 ? 'neg' : '');
}

function updateAll() {
  const saves = getSaves();

  updateSaveDisplay('saveFOR', saves.FOR);
  updateSaveDisplay('saveDEX', saves.DEX);
  updateSaveDisplay('saveCON', saves.CON);
  updateSaveDisplay('saveINT', saves.INT);
  updateSaveDisplay('saveSAG', saves.SAG);
  updateSaveDisplay('saveCHA', saves.CHA);

  updateHP(saves);
  updateSkillScores(saves);
  updateEquipSlots(saves);
}

// ── HP CALCULATION ─────────────────────────────────────
function updateHP(saves) {
  if (!saves) saves = getSaves();
  const d1  = Math.max(1, Math.min(20, parseInt(document.getElementById('mjDie1').value) || 10));
  const d2  = Math.max(1, Math.min(20, parseInt(document.getElementById('mjDie2').value) || 10));
  const con = parseInt(document.getElementById('statCON').value) || 10;
  const hp  = Math.max(15, d1 + d2 + con * 3);
  document.getElementById('hpTotal').textContent = hp;
}

// ── EQUIPMENT SLOTS ────────────────────────────────────
function updateEquipSlots(saves) {
  if (!saves) saves = getSaves();
  const slots = 3 + Math.max(0, saves.CON);
  document.getElementById('equipSlots').textContent = slots;
}

// ── SKILLS GRID ────────────────────────────────────────
function renderSkillsGrid() {
  const grid = document.getElementById('skillsGrid');
  grid.innerHTML = '';

  SKILLS.forEach((skill, idx) => {
    const div = document.createElement('div');
    div.className = 'skill-item';
    div.dataset.idx = idx;
    div.onclick = () => toggleBonus(div, idx);

    div.innerHTML = `
      <div class="skill-name">${skill.name}</div>
      <div class="skill-formula">${skill.formula}</div>
      <span class="skill-bonus-badge">+2</span>
      <div class="skill-score" id="skillScore_${idx}">+0</div>
    `;

    grid.appendChild(div);
  });
}

function updateSkillScores(saves) {
  if (!saves) saves = getSaves();

  SKILLS.forEach((skill, idx) => {
    const base  = skill.fn(saves);
    const bonus = selectedBonusSkills.has(idx) ? 2 : 0;
    const total = base + bonus;
    const el    = document.getElementById(`skillScore_${idx}`);
    if (!el) return;
    el.textContent = formatSave(total);
    el.className = 'skill-score ' + (total > 0 ? 'pos' : total < 0 ? 'neg' : '');
  });
}

function toggleBonus(el, idx) {
  if (selectedBonusSkills.has(idx)) {
    selectedBonusSkills.delete(idx);
    el.classList.remove('bonus-selected');
  } else {
    if (selectedBonusSkills.size >= 3) {
      flashNotice('Vous avez déjà sélectionné 3 compétences bonus !');
      return;
    }
    selectedBonusSkills.add(idx);
    el.classList.add('bonus-selected');
  }

  const counter = document.getElementById('bonusCount');
  counter.textContent = `${selectedBonusSkills.size} / 3 sélectionnées`;
  counter.className = 'bonus-counter' + (selectedBonusSkills.size === 3 ? ' full' : '');

  updateSkillScores();
}

// ── EQUIPMENT LISTS ────────────────────────────────────
function addItem(listId) {
  const list = document.getElementById(listId);
  const row  = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `<input type="text" class="item-inp" placeholder="…"><button type="button" class="rm-btn" onclick="removeItem(this)">✕</button>`;
  list.appendChild(row);
  row.querySelector('input').focus();
}

function removeItem(btn) {
  const row = btn.closest('.item-row');
  const list = row.parentElement;
  if (list.querySelectorAll('.item-row').length > 1) {
    row.remove();
  } else {
    row.querySelector('input').value = '';
  }
}

// ── PHOTO UPLOAD ────────────────────────────────────────
function loadPhoto(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    photoDataUrl = e.target.result;
    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');
    preview.src = photoDataUrl;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    document.getElementById('removePhotoBtn').style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  photoDataUrl = null;
  const preview = document.getElementById('photoPreview');
  const placeholder = document.getElementById('photoPlaceholder');
  preview.src = '';
  preview.style.display = 'none';
  placeholder.style.display = 'flex';
  document.getElementById('removePhotoBtn').style.display = 'none';
  document.getElementById('photoUpload').value = '';
}

// ── PARTICLES ──────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${80 + Math.random() * 20}%;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      animation-duration: ${8 + Math.random() * 16}s;
      animation-delay: ${Math.random() * 12}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

// ── UTILITY ────────────────────────────────────────────
function flashNotice(msg) {
  let notice = document.getElementById('flash-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'flash-notice';
    notice.style.cssText = `
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: #1a1205; border: 1px solid #c9a84c; color: #e8c97a;
      padding: 0.7rem 1.5rem; border-radius: 6px; font-family: 'Cinzel', serif;
      font-size: 0.8rem; letter-spacing: 0.1em; z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.8); transition: opacity 0.3s;
    `;
    document.body.appendChild(notice);
  }
  notice.textContent = msg;
  notice.style.opacity = '1';
  clearTimeout(notice._timer);
  notice._timer = setTimeout(() => { notice.style.opacity = '0'; }, 2500);
}

// ── GETTERS FOR GENERATOR ─────────────────────────────
function getFormData() {
  const saves = getSaves();

  // Gather items from a list
  function getItems(id) {
    return Array.from(document.querySelectorAll(`#${id} .item-inp`))
      .map(i => i.value.trim())
      .filter(Boolean);
  }

  // Gather hand
  const handEl = document.querySelector('input[name="hand"]:checked');

  // Religion
  let religionStr = '—';
  const relType = document.getElementById('religionType') ? document.getElementById('religionType').value : 'gloree';
  if (relType === 'gloree')       religionStr = 'Glorée';
  else if (relType === 'demidieu') {
    const dd = document.getElementById('religionDemidieu').value;
    religionStr = dd ? `Branche Demi-Dieu · ${dd}` : 'Branche Demi-Dieu';
  } else if (relType === 'culte') {
    const cu = document.getElementById('religionCulte').value;
    religionStr = cu ? `Culte · ${cu}` : 'Culte';
  } else if (relType === 'noncroyant') religionStr = 'Non-Croyant';

  // Class 2
  const class2Val = document.getElementById('class2Enable') && document.getElementById('class2Enable').checked
    ? document.getElementById('class2').value
    : '';

  // Height
  const heightStr = `${currentHeight} cm`;

  // Age category
  const ageBadgeEl = document.getElementById('ageCategoryBadge');
  const ageCat = ageBadgeEl ? ageBadgeEl.textContent : '';

  // Gather bonus skill names
  const bonusNames = [...selectedBonusSkills].map(i => SKILLS[i].name);

  // Skills with scores
  const skillScores = SKILLS.map((skill, idx) => {
    const base = skill.fn(saves);
    const bonus = selectedBonusSkills.has(idx) ? 2 : 0;
    return {
      name:    skill.name,
      formula: skill.formula,
      score:   base + bonus,
      hasBonus: selectedBonusSkills.has(idx),
    };
  });

  const d1  = parseInt(document.getElementById('mjDie1').value) || 10;
  const d2  = parseInt(document.getElementById('mjDie2').value) || 10;
  const con = parseInt(document.getElementById('statCON').value) || 10;
  const hp  = Math.max(15, d1 + d2 + con * 3);
  const slots = 3 + Math.max(0, saves.CON);

  return {
    // Identity
    playerName:  document.getElementById('playerName').value.trim(),
    charName:    document.getElementById('charName').value.trim() || 'Personnage Inconnu',
    race:        document.getElementById('race').value,
    nation:      document.getElementById('nation').value,
    originDetail: document.getElementById('originDetail').value.trim(),
    religion:    religionStr,
    hand:        handEl ? handEl.value : '—',
    class1:      document.getElementById('class1').value,
    class2:      class2Val,
    socialClass: document.getElementById('socialClass').value,
    job:         document.getElementById('job').value.trim(),
    sex:         document.getElementById('sex').value.trim(),
    age:         document.getElementById('age').value,
    ageCategory: ageCat,
    height:      heightStr,
    physique:    document.getElementById('physique').value.trim(),
    personality: document.getElementById('personality').value.trim(),
    alignment:   document.getElementById('alignment').value,

    // Photo
    photo: photoDataUrl,

    // Stats
    stats: {
      FOR: parseInt(document.getElementById('statFOR').value),
      DEX: parseInt(document.getElementById('statDEX').value),
      CON: parseInt(document.getElementById('statCON').value),
      INT: parseInt(document.getElementById('statINT').value),
      SAG: parseInt(document.getElementById('statSAG').value),
      CHA: parseInt(document.getElementById('statCHA').value),
    },
    saves,
    hp,
    equipSlots: slots,

    // Skills
    skillScores,
    bonusNames,

    // Equipment
    heavyEquip: getItems('heavyList'),
    descEquip:  getItems('descList'),
    inventory:  getItems('invList'),
    money: {
      Cu: document.getElementById('mCu').value,
      Fe: document.getElementById('mFe').value,
      Ag: document.getElementById('mAg').value,
      Au: document.getElementById('mAu').value,
      R:  document.getElementById('mR').value,
    },

    // Lore
    history:    document.getElementById('history').value.trim(),
    powers:     document.getElementById('powers').value.trim(),
    relations:  document.getElementById('relations').value.trim(),
    goalMain:   document.getElementById('goalMain').value.trim(),
    goalSecond: document.getElementById('goalSecond').value.trim(),
    property:   document.getElementById('property').value.trim(),
    misc:       document.getElementById('misc').value.trim(),
  };
}

// ── RELIGION UI ────────────────────────────────────────
function updateReligionUI() {
  const val = document.getElementById('religionType').value;
  document.getElementById('religionSubDemidieu').style.display = val === 'demidieu' ? 'block' : 'none';
  document.getElementById('religionSubCulte').style.display = val === 'culte' ? 'block' : 'none';
}

// ── CLASS 2 TOGGLE ─────────────────────────────────────
function toggleClass2() {
  const cb = document.getElementById('class2Enable');
  const sel = document.getElementById('class2');
  sel.disabled = !cb.checked;
  sel.className = cb.checked ? '' : 'locked-select';
  if (!cb.checked) sel.value = '';
}

// ── RACE CONFIG ────────────────────────────────────────
const RACE_CONFIG = {
  'Humain':      { heightMin: 150, heightMax: 210, heightDefault: 170,
                   ages: { jeune:[1,17], adulte:[18,59], age:[60,79], tresage:[80,999] },
                   ageHint: 'Humain · Adulte : 18–59 ans', heightHint: 'Humain · 150–210 cm' },
  'Orphérique':  { heightMin: 190, heightMax: 250, heightDefault: 210,
                   ages: { jeune:[1,35], adulte:[36,119], age:[120,159], tresage:[160,999] },
                   ageHint: 'Orphérique · Adulte : 36–119 ans (longévité ×2)', heightHint: 'Orphérique · 190–250 cm' },
  'Géant':       { heightMin: 250, heightMax: 500, heightDefault: 350,
                   ages: { jeune:[1,50], adulte:[51,200], age:[201,350], tresage:[351,999] },
                   ageHint: 'Géant · Adulte : 51–200 ans', heightHint: 'Géant · 250–500 cm' },
};

let currentHeight = 170;

function getRaceConfig() {
  const race = document.getElementById('race').value;
  return RACE_CONFIG[race] || RACE_CONFIG['Humain'];
}

function onRaceChange() {
  const cfg = getRaceConfig();
  currentHeight = cfg.heightDefault;
  document.getElementById('heightVal').textContent = currentHeight;
  document.getElementById('heightHint').textContent = cfg.heightHint;
  document.getElementById('ageHint').textContent = cfg.ageHint;
  document.getElementById('age').value = Math.round((cfg.ages.adulte[0] + cfg.ages.adulte[1]) / 2);
  updateAgeBadge();
}

function changeHeight(delta) {
  const cfg = getRaceConfig();
  currentHeight = Math.max(cfg.heightMin, Math.min(cfg.heightMax, currentHeight + delta));
  document.getElementById('heightVal').textContent = currentHeight;
}

function changeAge(delta) {
  const inp = document.getElementById('age');
  inp.value = Math.max(1, parseInt(inp.value || 1) + delta);
  updateAgeBadge();
}

function updateAgeBadge() {
  const cfg = getRaceConfig();
  const age = parseInt(document.getElementById('age').value) || 1;
  const badge = document.getElementById('ageCategoryBadge');

  let cat = 'adulte', label = 'Adulte';
  if      (age <= cfg.ages.jeune[1])   { cat = 'jeune';   label = 'Jeune'; }
  else if (age <= cfg.ages.adulte[1])  { cat = 'adulte';  label = 'Adulte'; }
  else if (age <= cfg.ages.age[1])     { cat = 'age';     label = 'Âgé'; }
  else                                  { cat = 'tresage'; label = 'Très Âgé'; }

  badge.textContent = label;
  badge.className = 'age-category-badge ' + cat;
}

// ── DICE ROLLER ────────────────────────────────────────
let rollsLeft = 3;
let diceValues = [];
let selectedDieIdx = null;
let assignedStats = {}; // { statName: value }

// Weighted random dice roll: mostly mid-values, some highs/lows
function weightedDie() {
  // Roll 4d6 drop lowest (classic RPG method, gives 3-18 range, avg ~12)
  const rolls = [1,2,3,4].map(() => Math.ceil(Math.random() * 6));
  rolls.sort((a,b) => a - b);
  const sum = rolls[1] + rolls[2] + rolls[3]; // drop lowest
  // Scale to 1-20 range: sum is 3-18, map to 1-20
  return Math.round(1 + (sum - 3) * (19 / 15));
}

function rollDice() {
  if (rollsLeft <= 0) return;
  rollsLeft--;
  diceValues = Array.from({ length: 6 }, weightedDie).sort((a,b) => a - b);
  selectedDieIdx = null;
  assignedStats = {};
  renderDice();
  updateRollUI();
}

function renderDice() {
  const row = document.getElementById('drDiceRow');
  row.innerHTML = '';

  diceValues.forEach((val, idx) => {
    const save = calcSave(val);
    const chip = document.createElement('div');
    chip.className = 'die-chip roll-anim' + (assignedStats[idx] !== undefined ? ' used' : '');
    chip.dataset.idx = idx;
    chip.style.animationDelay = `${idx * 0.06}s`;
    chip.innerHTML = `<div class="die-val">${val}</div><div class="die-save">${fmt(save)}</div>`;
    chip.onclick = () => selectDie(idx);
    row.appendChild(chip);
  });

  document.getElementById('drAssignHint').style.display = diceValues.length ? 'block' : 'none';
  updateAssignedDisplay();
}

function selectDie(idx) {
  if (assignedStats[idx] !== undefined) return; // already used
  selectedDieIdx = idx;

  // Highlight
  document.querySelectorAll('.die-chip').forEach(c => c.classList.remove('selected'));
  const chip = document.querySelector(`.die-chip[data-idx="${idx}"]`);
  if (chip) chip.classList.add('selected');

  // Make stat cards clickable
  document.querySelectorAll('.stat-card').forEach(card => {
    card.classList.add('awaiting-assign');
    card.onclick = () => assignDie(card.dataset.stat);
  });

  flashNotice(`Valeur ${diceValues[idx]} sélectionnée · Cliquez sur une stat pour l'assigner`);
}

function assignDie(statKey) {
  if (selectedDieIdx === null) return;

  const val = diceValues[selectedDieIdx];

  // Update stat input
  document.getElementById(`stat${statKey}`).value = val;
  updateAll();

  // Mark die as used
  assignedStats[selectedDieIdx] = statKey;

  // Reset stat-card click handlers
  document.querySelectorAll('.stat-card').forEach(card => {
    card.classList.remove('awaiting-assign');
    card.onclick = null;
  });

  selectedDieIdx = null;
  renderDice();
}

function updateRollUI() {
  const btn = document.getElementById('btnRoll');
  const lbl = document.getElementById('drRerollsLeft');

  if (rollsLeft <= 0) {
    btn.disabled = true;
    btn.textContent = '⚄ Aucune relance restante';
    lbl.classList.add('depleted');
  } else {
    btn.disabled = false;
    btn.textContent = rollsLeft < 3 ? `⚄ Relancer (${rollsLeft} restante${rollsLeft > 1 ? 's' : ''})` : '⚄ Lancer les 6 dés';
    lbl.classList.remove('depleted');
  }
  lbl.textContent = `${rollsLeft} relance${rollsLeft > 1 ? 's' : ''} restante${rollsLeft > 1 ? 's' : ''}`;
}

function updateAssignedDisplay() {
  const container = document.getElementById('drAssigned');
  const list = document.getElementById('drAssignedList');
  const statLabels = { FOR:'Force', DEX:'Dextérité', CON:'Constitution', INT:'Intelligence', SAG:'Sagesse', CHA:'Charisme' };

  const tags = Object.entries(assignedStats).map(([dieIdx, stat]) =>
    `<span class="assigned-tag">${statLabels[stat] || stat} : ${diceValues[dieIdx]}</span>`
  ).join('');

  if (tags) {
    container.style.display = 'block';
    list.innerHTML = tags;
  } else {
    container.style.display = 'none';
  }
}

