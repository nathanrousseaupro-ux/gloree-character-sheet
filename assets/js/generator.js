/* ═══════════════════════════════════════════════════════
   GLORÉE — generator.js
   Character sheet HTML generation + print/PDF
   ═══════════════════════════════════════════════════════ */

'use strict';

function generateSheet() {
  const d = getFormData();
  const html = buildSheetHTML(d);

  const win = window.open('', '_blank', 'width=1100,height=800');
  if (!win) {
    alert('Veuillez autoriser les popups pour ce site afin de générer la fiche.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// ── HELPERS ────────────────────────────────────────────
const fmt = (v) => (v >= 0 ? `+${v}` : `${v}`);
const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
const orDash = (v) => v || '—';

function scoreColor(v) {
  return v > 0 ? '#6dbf8a' : v < 0 ? '#cc6666' : '#c9a84c';
}

// ── SHEET HTML ─────────────────────────────────────────
function buildSheetHTML(d) {
  const statKeys = ['FOR','DEX','CON','INT','SAG','CHA'];
  const statLabels = { FOR:'Force', DEX:'Dextérité', CON:'Constitution', INT:'Intelligence', SAG:'Sagesse', CHA:'Charisme' };

  const statsHTML = statKeys.map(k => `
    <div class="stat-cell">
      <div class="sc-key">${k}</div>
      <div class="sc-val">${d.stats[k]}</div>
      <div class="sc-save">${fmt(d.saves[k])}</div>
      <div class="sc-lbl">Save</div>
    </div>
  `).join('');

  const skillRows = d.skillScores.map(s => `
    <tr class="${s.hasBonus ? 'bonus-row' : ''}">
      <td class="sk-name">${esc(s.name)}${s.hasBonus ? ' <span class="bonus-star">★</span>' : ''}</td>
      <td class="sk-formula">${esc(s.formula)}</td>
      <td class="sk-score" style="color:${scoreColor(s.score)}">${fmt(s.score)}</td>
    </tr>
  `).join('');

  const heavyItems = d.heavyEquip.length
    ? d.heavyEquip.map(i => `<li>${esc(i)}</li>`).join('')
    : '<li class="empty">—</li>';

  const descItems = d.descEquip.length
    ? d.descEquip.map(i => `<li>${esc(i)}</li>`).join('')
    : '<li class="empty">—</li>';

  const invItems = d.inventory.length
    ? d.inventory.map(i => `<li>${esc(i)}</li>`).join('')
    : '<li class="empty">—</li>';

  const moneyStr = [
    d.money.Cu && `${d.money.Cu} C`,
    d.money.Fe && `${d.money.Fe} F`,
    d.money.Ag && `${d.money.Ag} A`,
    d.money.Au && `${d.money.Au} O`,
    d.money.R  && `${d.money.R} R`,
  ].filter(Boolean).join(' · ') || '—';

  const photoBlock = d.photo
    ? `<div class="portrait-wrapper">
         <div class="portrait-frame">
           <img src="${d.photo}" alt="Portrait">
           <svg class="pf-svg" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
             <rect x="4" y="4" width="192" height="252" fill="none" stroke="#c9a84c" stroke-width="1.5" opacity="0.7"/>
             <rect x="9" y="9" width="182" height="242" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.4"/>
             <path d="M4,30 L4,4 L30,4" fill="none" stroke="#d4a853" stroke-width="3"/>
             <circle cx="4" cy="4" r="3" fill="#d4a853"/>
             <path d="M170,4 L196,4 L196,30" fill="none" stroke="#d4a853" stroke-width="3"/>
             <circle cx="196" cy="4" r="3" fill="#d4a853"/>
             <path d="M4,230 L4,256 L30,256" fill="none" stroke="#d4a853" stroke-width="3"/>
             <circle cx="4" cy="256" r="3" fill="#d4a853"/>
             <path d="M170,256 L196,256 L196,230" fill="none" stroke="#d4a853" stroke-width="3"/>
             <circle cx="196" cy="256" r="3" fill="#d4a853"/>
           </svg>
         </div>
       </div>`
    : `<div class="portrait-wrapper">
         <div class="portrait-frame no-photo">
           <div class="no-photo-inner">Portrait<br>non fourni</div>
           <svg class="pf-svg" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
             <rect x="4" y="4" width="192" height="252" fill="none" stroke="#7a6028" stroke-width="1.5"/>
             <path d="M4,30 L4,4 L30,4" fill="none" stroke="#7a6028" stroke-width="2"/>
             <circle cx="4" cy="4" r="2.5" fill="#7a6028"/>
             <path d="M170,4 L196,4 L196,30" fill="none" stroke="#7a6028" stroke-width="2"/>
             <circle cx="196" cy="4" r="2.5" fill="#7a6028"/>
             <path d="M4,230 L4,256 L30,256" fill="none" stroke="#7a6028" stroke-width="2"/>
             <circle cx="4" cy="256" r="2.5" fill="#7a6028"/>
             <path d="M170,256 L196,256 L196,230" fill="none" stroke="#7a6028" stroke-width="2"/>
             <circle cx="196" cy="256" r="2.5" fill="#7a6028"/>
           </svg>
         </div>
       </div>`;

  const loreBlock = [
    { label: 'Histoire & Motivations',     val: d.history    },
    { label: 'Compétences / Pouvoirs / Reliques', val: d.powers  },
    { label: 'Relations & Alliances',      val: d.relations  },
    { label: 'Objectif Principal',         val: d.goalMain   },
    { label: 'Objectif Secondaire',        val: d.goalSecond },
    { label: 'Patrimoine & Propriété',     val: d.property   },
    { label: 'Informations Annexes',       val: d.misc       },
  ].filter(x => x.val).map(x => `
    <div class="lore-item">
      <div class="lore-label">${esc(x.label)}</div>
      <div class="lore-text">${nl2br(x.val)}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fiche — ${esc(d.charName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
/* ─── RESET & BASE ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0d0906;
  --gold:    #c9a84c;
  --goldl:   #e8c97a;
  --goldd:   #7a6028;
  --cream:   #e0cfa8;
  --creamd:  #9a8060;
  --border:  rgba(201,168,76,0.3);
  --red:     rgba(138,26,42,0.15);
  --fh:      'Cinzel', serif;
  --fd:      'Cinzel Decorative', serif;
  --fb:      'EB Garamond', serif;
}

body {
  background: var(--bg);
  color: var(--cream);
  font-family: var(--fb);
  font-size: 11.5pt;
  line-height: 1.55;
  min-height: 100vh;
}

/* ─── PAGE LAYOUT ─── */
.sheet-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 2.5rem 3rem;
}

/* ─── HEADER ─── */
.sh-header {
  text-align: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
  margin-bottom: 1.8rem;
  position: relative;
}

.sh-title-main {
  font-family: var(--fd);
  font-size: 2rem;
  color: var(--goldl);
  letter-spacing: 0.15em;
  text-shadow: 0 0 20px rgba(201,168,76,0.3);
}

.sh-rule {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.5rem 0 0.3rem;
}
.sh-rule span { flex:1; height:1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
.sh-rule em { color: var(--gold); font-style: normal; font-size: 0.6rem; }

.sh-charname {
  font-family: var(--fh);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--cream);
  letter-spacing: 0.08em;
}

.sh-meta {
  font-family: var(--fh);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: var(--creamd);
  text-transform: uppercase;
  margin-top: 0.2rem;
}

/* ─── PRINT BUTTON ─── */
.print-btn {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(135deg, #2a1c05, #150e00);
  border: 1px solid var(--goldd);
  color: var(--goldl);
  padding: 0.6rem 1.5rem;
  font-family: var(--fh);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
}
.print-btn:hover { border-color: var(--gold); box-shadow: 0 0 15px rgba(201,168,76,0.2); }

/* ─── MAIN GRID ─── */
.sh-body {
  display: grid;
  grid-template-columns: 220px 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ─── PANEL ─── */
.panel {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem 1rem 1.2rem;
  position: relative;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--goldd), var(--gold), var(--goldd), transparent);
}

.panel-title {
  font-family: var(--fh);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.4rem;
  margin-bottom: 0.8rem;
}

/* ─── LEFT COLUMN ─── */
.col-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Portrait */
.portrait-wrapper { display: flex; justify-content: center; }

.portrait-frame {
  width: 190px;
  height: 240px;
  position: relative;
  flex-shrink: 0;
}

.portrait-frame img {
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  object-fit: cover;
  border-radius: 2px;
}

.pf-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.portrait-frame.no-photo { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 4px; }

.no-photo-inner {
  position: absolute;
  inset: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: var(--fh);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--goldd);
}

/* Identity rows */
.id-row {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.id-row:last-child { border-bottom: none; }
.id-key {
  font-family: var(--fh);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--goldd);
}
.id-val {
  font-family: var(--fb);
  font-size: 0.9rem;
  color: var(--cream);
  line-height: 1.3;
}

/* ─── STATS ─── */
.stats-wrap {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat-cell {
  text-align: center;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 5px;
  padding: 0.5rem 0.3rem;
}

.sc-key {
  font-family: var(--fh);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--goldl);
}
.sc-val {
  font-family: var(--fh);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--cream);
  line-height: 1;
  margin: 0.15rem 0;
}
.sc-save {
  font-family: var(--fh);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gold);
}
.sc-lbl {
  font-size: 0.55rem;
  color: var(--creamd);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* HP */
.hp-block { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.hp-cell {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 5px;
  padding: 0.6rem;
  text-align: center;
}
.hp-cell-label {
  font-family: var(--fh);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--goldd);
  margin-bottom: 0.2rem;
}
.hp-cell-val {
  font-family: var(--fh);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--cream);
}

/* ─── SKILLS TABLE ─── */
table.skills-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

table.skills-table th {
  font-family: var(--fh);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--goldd);
  text-align: left;
  padding: 0.2rem 0.3rem;
  border-bottom: 1px solid var(--border);
}

table.skills-table td {
  padding: 0.25rem 0.3rem;
  border-bottom: 1px solid rgba(201,168,76,0.07);
  vertical-align: middle;
}

.sk-name { color: var(--cream); }
.sk-formula { color: var(--creamd); font-style: italic; font-size: 0.75rem; }
.sk-score { font-family: var(--fh); font-size: 0.85rem; font-weight: 700; text-align: right; }
.bonus-row td { background: rgba(201,168,76,0.06); }
.bonus-star { color: var(--gold); font-size: 0.6rem; }

/* ─── EQUIPMENT ─── */
.equip-col { display: flex; flex-direction: column; gap: 1rem; }

ul.item-ul {
  list-style: none;
  padding: 0;
  margin: 0.3rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

ul.item-ul li {
  font-size: 0.88rem;
  color: var(--cream);
  padding: 0.15rem 0;
  border-bottom: 1px solid rgba(201,168,76,0.07);
  line-height: 1.3;
}
ul.item-ul li:last-child { border-bottom: none; }
ul.item-ul li.empty { color: var(--creamd); font-style: italic; }
ul.item-ul li::before { content: '◦ '; color: var(--goldd); }

.money-display {
  font-family: var(--fh);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--goldl);
  margin-top: 0.3rem;
}

/* ─── LORE ─── */
.lore-col { display: flex; flex-direction: column; gap: 1rem; }

.lore-item {
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(201,168,76,0.15);
  border-left: 2px solid var(--goldd);
  border-radius: 0 4px 4px 0;
  padding: 0.7rem 0.8rem;
}

.lore-label {
  font-family: var(--fh);
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.3rem;
}

.lore-text {
  font-size: 0.88rem;
  color: var(--cream);
  line-height: 1.55;
}

/* ─── FOOTER ─── */
.sh-footer {
  text-align: center;
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-family: var(--fh);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--creamd);
  opacity: 0.6;
}

/* ─── PRINT ─── */
@media print {
  body { background: #fff !important; color: #111 !important; }
  .print-btn { display: none !important; }
  .sheet-page { padding: 1cm 1.5cm; }
  :root {
    --bg: #fff;
    --cream: #1a1208;
    --creamd: #555;
    --gold: #8a6010;
    --goldl: #6a4a08;
    --goldd: #9a7020;
    --border: rgba(138,96,16,0.3);
  }
  .panel { border-color: rgba(138,96,16,0.3); }
  .stat-cell, .hp-cell { border-color: rgba(138,96,16,0.2); background: #faf5e8; }
  .lore-item { border-color: rgba(138,96,16,0.2); background: #faf5e8; border-left-color: var(--goldd); }
  ul.item-ul li { border-bottom-color: rgba(138,96,16,0.1); }
  table.skills-table td { border-bottom-color: rgba(138,96,16,0.1); }
  .bonus-row td { background: rgba(138,96,16,0.06); }
  .sh-title-main, .sh-charname { text-shadow: none; }
  body::before { display: none; }
}
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">📥 Télécharger en PDF (Ctrl+P)</button>

<div class="sheet-page">

  <!-- ── HEADER ── -->
  <div class="sh-header">
    <div class="sh-title-main">Glorée</div>
    <div class="sh-rule"><span></span><em>◆</em><span></span></div>
    <div class="sh-charname">${esc(d.charName)}</div>
    <div class="sh-meta">
      ${[d.race, d.nation, d.class1, d.alignment].filter(Boolean).map(esc).join(' · ')}
      ${d.playerName ? ` &ensp;—&ensp; Joueur : ${esc(d.playerName)}` : ''}
    </div>
  </div>

  <!-- ── BODY GRID ── -->
  <div class="sh-body">

    <!-- ══ LEFT COLUMN ══ -->
    <div class="col-left">

      <!-- Portrait -->
      ${photoBlock}

      <!-- Identity -->
      <div class="panel">
        <div class="panel-title">👤 Identité</div>
        ${[
          { k:'Race',           v: orDash(d.race) },
          { k:'Nation',         v: [d.nation, d.originDetail].filter(Boolean).join(', ') || '—' },
          { k:'Religion',       v: orDash(d.religion) },
          { k:'Main Dominante', v: orDash(d.hand) },
          { k:'Classe Sociale', v: orDash(d.socialClass) },
          { k:'Métier',         v: orDash(d.job) },
          { k:'Sexe',           v: orDash(d.sex) },
          { k:'Âge',            v: d.age ? `${d.age} ans` : '—' },
          { k:'Taille',         v: orDash(d.height) },
        ].map(r => `
          <div class="id-row">
            <div class="id-key">${esc(r.k)}</div>
            <div class="id-val">${esc(r.v)}</div>
          </div>
        `).join('')}
      </div>

      <!-- Physique -->
      ${d.physique ? `
      <div class="panel">
        <div class="panel-title">🪞 Apparence</div>
        <div style="font-size:0.85rem; line-height:1.5">${nl2br(d.physique)}</div>
      </div>` : ''}

      <!-- Traits -->
      ${d.personality ? `
      <div class="panel">
        <div class="panel-title">🎭 Personnalité</div>
        <div style="font-size:0.85rem; line-height:1.5">${nl2br(d.personality)}</div>
      </div>` : ''}

    </div>

    <!-- ══ MIDDLE COLUMN ══ -->
    <div>

      <!-- Stats -->
      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-title">🎲 Statistiques · Dés du MJ</div>
        <div class="stats-wrap">${statsHTML}</div>
        <div style="margin-top:0.8rem">
          <div class="panel-title" style="margin-top:0.8rem">❤️ Santé</div>
          <div class="hp-block">
            <div class="hp-cell">
              <div class="hp-cell-label">Santé Physique</div>
              <div class="hp-cell-val">${d.hp} / ${d.hp}</div>
            </div>
            <div class="hp-cell">
              <div class="hp-cell-label">Santé Mentale</div>
              <div class="hp-cell-val">100 / 100%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alignment & Classes -->
      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-title">⚔️ Classes & Alignement</div>
        <div class="id-row"><div class="id-key">Classe Principale</div><div class="id-val">${esc(orDash(d.class1))}</div></div>
        ${d.class2 ? `<div class="id-row"><div class="id-key">Classe Secondaire</div><div class="id-val">${esc(d.class2)}</div></div>` : ''}
        <div class="id-row"><div class="id-key">Alignement</div><div class="id-val">${esc(orDash(d.alignment))}</div></div>
      </div>

      <!-- Skills -->
      <div class="panel">
        <div class="panel-title">⚡ Compétences <span style="opacity:0.6;font-size:0.55rem">(★ = bonus +2)</span></div>
        <table class="skills-table">
          <thead>
            <tr><th>Compétence</th><th>Base</th><th style="text-align:right">Score</th></tr>
          </thead>
          <tbody>${skillRows}</tbody>
        </table>
      </div>

    </div>

    <!-- ══ RIGHT COLUMN ══ -->
    <div>

      <!-- Equipment -->
      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-title">⚔️ Équipement Lourd <span style="opacity:0.6">(${d.equipSlots} emplacements)</span></div>
        <ul class="item-ul">${heavyItems}</ul>
      </div>

      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-title">👘 Équipement Descriptif</div>
        <ul class="item-ul">${descItems}</ul>
      </div>

      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-title">🎒 Inventaire</div>
        <ul class="item-ul">${invItems}</ul>
      </div>

      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-title">💰 Monnaie</div>
        <div class="money-display">${moneyStr}</div>
      </div>

      <!-- Lore -->
      ${loreBlock ? `
      <div class="panel">
        <div class="panel-title">📜 Histoire & Lore</div>
        <div class="lore-col">${loreBlock}</div>
      </div>` : ''}

    </div>

  </div><!-- end sh-body -->

  <!-- ── FOOTER ── -->
  <div class="sh-footer">
    Univers de Glorée — Création originale protégée &ensp;·&ensp; © 2020–2025 &ensp;◆&ensp;
    Fiche générée le ${new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}
  </div>

</div><!-- end sheet-page -->

</body>
</html>`;
}
