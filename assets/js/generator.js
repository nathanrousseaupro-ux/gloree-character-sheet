/* ═══════════════════════════════════════════════════════
   GLORÉE — generator.js  v3
   Layout vertical, optimisé impression / PDF
   ═══════════════════════════════════════════════════════ */

'use strict';

function generateSheet() {
  const d = getFormData();
  const html = buildSheetHTML(d);
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) { alert('Autorisez les popups pour générer la fiche.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/* ── helpers ─────────────────────────────────────────── */
const fmt    = v  => (v >= 0 ? `+${v}` : `${v}`);
const esc    = s  => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const nl2br  = s  => esc(s).replace(/\n/g,'<br>');
const orDash = v  => v || '—';
const scoreColor = v => v > 0 ? '#4a9e6a' : v < 0 ? '#aa4444' : '#8a7040';

/* ── main builder ────────────────────────────────────── */
function buildSheetHTML(d) {

  /* PORTRAIT */
  const portrait = d.photo
    ? `<img src="${d.photo}" alt="Portrait" class="portrait-img">`
    : `<div class="portrait-empty">Portrait<br>non fourni</div>`;

  /* IDENTITY ROWS */
  const idRows = [
    ['Race',           orDash(d.race)],
    ['Nation',         [d.nation, d.originDetail].filter(Boolean).join(', ') || '—'],
    ['Religion',       orDash(d.religion)],
    ['Main Dominante', orDash(d.hand)],
    ['Sexe',           orDash(d.sex)],
    ['Âge',            d.age ? `${d.age} ans${d.ageCategory ? ' · ' + d.ageCategory : ''}` : '—'],
    ['Taille',         orDash(d.height)],
    ['Classe Sociale', orDash(d.socialClass)],
    ['Métier',         orDash(d.job)],
    ['Alignement',     orDash(d.alignment)],
  ].map(([k,v]) => `
    <tr>
      <td class="id-key">${esc(k)}</td>
      <td class="id-val">${esc(v)}</td>
    </tr>`).join('');

  /* CLASSES */
  const classRows = [
    ['Classe Principale', orDash(d.class1)],
    d.class2 ? ['Classe Secondaire', d.class2] : null,
  ].filter(Boolean).map(([k,v]) => `
    <tr>
      <td class="id-key">${esc(k)}</td>
      <td class="id-val">${esc(v)}</td>
    </tr>`).join('');

  /* STATS */
  const statKeys   = ['FOR','DEX','CON','INT','SAG','CHA'];
  const statLabels = {FOR:'Force',DEX:'Dextérité',CON:'Constitution',INT:'Intelligence',SAG:'Sagesse',CHA:'Charisme'};

  const statCells = statKeys.map(k => `
    <td class="stat-cell">
      <div class="sc-key">${k}</div>
      <div class="sc-sub">${statLabels[k]}</div>
      <div class="sc-val">${d.stats[k]}</div>
      <div class="sc-save-lbl">Save</div>
      <div class="sc-save" style="color:${scoreColor(d.saves[k])}">${fmt(d.saves[k])}</div>
    </td>`).join('');

  /* EQUIP lists */
  const liList = (arr) => arr.length
    ? arr.map(i => `<li>${esc(i)}</li>`).join('')
    : '<li class="empty">—</li>';

  const moneyStr = [
    d.money.Cu && `${d.money.Cu} Sou(s) Cuivré`,
    d.money.Fe && `${d.money.Fe} Denier(s) de Fer`,
    d.money.Ag && `${d.money.Ag} Florin(s) d'Argent`,
    d.money.Au && `${d.money.Au} Couronne(s) Dorée`,
    d.money.R  && `${d.money.R} Sceau(x) Royal`,
  ].filter(Boolean).join(' · ') || '—';

  /* LORE */
  const loreItems = [
    { label:'Histoire & Motivations',           val: d.history    },
    { label:'Compétences / Pouvoirs / Reliques', val: d.powers    },
    { label:'Relations & Alliances',             val: d.relations  },
    { label:'Objectif Principal',                val: d.goalMain   },
    { label:'Objectif Secondaire',               val: d.goalSecond },
    { label:'Patrimoine & Propriété',            val: d.property   },
    { label:'Informations Annexes',              val: d.misc       },
  ].filter(x => x.val);

  const loreHTML = loreItems.map(x => `
    <div class="lore-block">
      <div class="lore-label">${esc(x.label)}</div>
      <div class="lore-text">${nl2br(x.val)}</div>
    </div>`).join('');

  const today = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

  /* ═══════════════════════════════════════════════════
     FULL HTML
     ═══════════════════════════════════════════════════ */
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fiche — ${esc(d.charName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>

:root {
  --bg:    #0d0906;
  --card:  #120d07;
  --gold:  #c9a84c;
  --goldl: #e8c97a;
  --goldd: #7a6028;
  --cream: #e0cfa8;
  --dim:   #9a8060;
  --bdr:   rgba(201,168,76,.28);
  --fh:    'Cinzel', serif;
  --fd:    'Cinzel Decorative', serif;
  --fb:    'EB Garamond', serif;
}

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
body { background:var(--bg); color:var(--cream); font-family:var(--fb); font-size:10.5pt; line-height:1.55; }

.page { max-width:750px; margin:0 auto; padding:1.6rem 1.8rem 2.2rem; }

/* Print button */
.print-btn {
  position:fixed; top:1.2rem; right:1.2rem;
  background:linear-gradient(135deg,#2a1c05,#150e00);
  border:1px solid var(--goldd); color:var(--goldl);
  padding:.5rem 1.2rem; font-family:var(--fh); font-size:.65rem;
  letter-spacing:.15em; text-transform:uppercase; border-radius:4px; cursor:pointer; z-index:100;
}
.print-btn:hover { border-color:var(--gold); }

/* Header */
.sh-header { text-align:center; border-bottom:1px solid var(--bdr); padding-bottom:1rem; margin-bottom:1.3rem; }
.sh-universe { font-family:var(--fd); font-size:1.5rem; color:var(--goldl); letter-spacing:.12em; }
.sh-rule { display:flex; align-items:center; gap:.5rem; margin:.35rem 0 .25rem; }
.sh-rule span { flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--gold),transparent); }
.sh-rule em { color:var(--gold); font-style:normal; font-size:.55rem; }
.sh-name { font-family:var(--fh); font-size:1.4rem; font-weight:700; color:var(--cream); letter-spacing:.06em; }
.sh-meta { font-family:var(--fh); font-size:.6rem; letter-spacing:.14em; color:var(--dim); text-transform:uppercase; margin-top:.15rem; }

/* Section block */
.sec {
  background:var(--card); border:1px solid var(--bdr); border-radius:6px;
  padding:1rem 1.1rem 1.15rem; margin-bottom:1rem; position:relative;
}
.sec::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background:linear-gradient(90deg,transparent,var(--goldd),var(--gold),var(--goldd),transparent);
}

/* Section title */
.sec-title {
  font-family:var(--fh); font-size:.6rem; letter-spacing:.22em; text-transform:uppercase;
  color:var(--gold); border-bottom:1px solid var(--bdr); padding-bottom:.3rem; margin-bottom:.8rem;
  display:flex; align-items:center; gap:.5rem;
}
.sec-title::before { content:''; flex:0 0 30px; height:1px; background:linear-gradient(270deg,var(--bdr),transparent); }
.sec-title::after  { content:''; flex:1; height:1px; background:linear-gradient(90deg,var(--bdr),transparent); }

/* Portrait + identity side by side */
.header-row { display:flex; gap:1.3rem; align-items:flex-start; }

.portrait-wrap { flex-shrink:0; position:relative; width:150px; height:188px; }
.portrait-frame-svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
.portrait-img {
  position:absolute; inset:9px; width:calc(100% - 18px); height:calc(100% - 18px);
  object-fit:cover; border-radius:2px;
}
.portrait-empty {
  position:absolute; inset:9px; display:flex; align-items:center; justify-content:center;
  text-align:center; font-family:var(--fh); font-size:.58rem; letter-spacing:.1em;
  text-transform:uppercase; color:var(--goldd); border:1px dashed var(--bdr); border-radius:2px;
}

/* Identity table */
.id-table { border-collapse:collapse; width:100%; }
.id-table td { padding:.17rem .25rem; border-bottom:1px solid rgba(201,168,76,.07); vertical-align:top; }
.id-table tr:last-child td { border-bottom:none; }
.id-key {
  font-family:var(--fh); font-size:.54rem; letter-spacing:.13em; text-transform:uppercase;
  color:var(--goldd); white-space:nowrap; padding-right:.5rem; width:105px;
}
.id-val { font-size:.88rem; color:var(--cream); }

/* Stats */
.stats-table { border-collapse:separate; border-spacing:.4rem 0; width:100%; table-layout:fixed; }
.stat-cell {
  text-align:center; border:1px solid var(--bdr); border-radius:5px; padding:.5rem .2rem;
  background:rgba(0,0,0,.25);
}
.sc-key { font-family:var(--fh); font-size:.68rem; font-weight:700; letter-spacing:.08em; color:var(--goldl); }
.sc-sub { font-size:.55rem; color:var(--dim); font-style:italic; margin-bottom:.08rem; }
.sc-val { font-family:var(--fh); font-size:1.3rem; font-weight:700; color:var(--cream); line-height:1.1; }
.sc-save-lbl { font-size:.5rem; text-transform:uppercase; letter-spacing:.1em; color:var(--goldd); margin-top:.05rem; }
.sc-save { font-family:var(--fh); font-size:.88rem; font-weight:700; }

/* HP */
.hp-row { display:flex; gap:.7rem; margin-top:.8rem; }
.hp-cell {
  flex:1; text-align:center; background:rgba(0,0,0,.25); border:1px solid var(--bdr);
  border-radius:5px; padding:.45rem;
}
.hp-lbl { font-family:var(--fh); font-size:.54rem; letter-spacing:.12em; text-transform:uppercase; color:var(--goldd); margin-bottom:.15rem; }
.hp-val { font-family:var(--fh); font-size:1.1rem; font-weight:700; color:var(--cream); }

/* Skills — 2 columns */
.skills-cols { display:grid; grid-template-columns:1fr 1fr; gap:0 1.4rem; }
.sk-table { border-collapse:collapse; width:100%; }
.sk-table th {
  font-family:var(--fh); font-size:.53rem; letter-spacing:.13em; text-transform:uppercase;
  color:var(--goldd); text-align:left; padding:.18rem .25rem; border-bottom:1px solid var(--bdr);
}
.sk-table td { padding:.2rem .25rem; border-bottom:1px solid rgba(201,168,76,.06); }
.sk-bonus td { background:rgba(201,168,76,.05); }
.sk-name { color:var(--cream); font-size:.85rem; }
.sk-formula { color:var(--dim); font-style:italic; font-size:.72rem; }
.sk-score { font-family:var(--fh); font-size:.82rem; font-weight:700; text-align:right; }
.star { color:var(--gold); font-size:.58rem; }

/* Equipment */
.equip-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:.9rem; }
.equip-block h4 {
  font-family:var(--fh); font-size:.56rem; letter-spacing:.14em; text-transform:uppercase;
  color:var(--gold); margin-bottom:.35rem; padding-bottom:.2rem; border-bottom:1px solid var(--bdr);
}
.equip-block ul { list-style:none; padding:0; margin:0; }
.equip-block li {
  font-size:.83rem; color:var(--cream); padding:.1rem 0;
  border-bottom:1px solid rgba(201,168,76,.06);
}
.equip-block li:last-child { border-bottom:none; }
.equip-block li::before { content:'◦ '; color:var(--goldd); }
.equip-block li.empty { color:var(--dim); font-style:italic; }

.money-line {
  margin-top:.7rem; padding:.45rem .7rem;
  background:rgba(0,0,0,.2); border:1px solid var(--bdr); border-radius:4px;
  font-family:var(--fh); font-size:.68rem; letter-spacing:.06em; color:var(--goldl);
}
.money-lbl { color:var(--goldd); margin-right:.4rem; font-size:.55rem; letter-spacing:.12em; text-transform:uppercase; }

/* Lore */
.lore-block {
  border-left:2px solid var(--goldd); padding:.45rem .75rem; margin-bottom:.6rem;
  background:rgba(255,255,255,.012); border-radius:0 4px 4px 0;
}
.lore-block:last-child { margin-bottom:0; }
.lore-label { font-family:var(--fh); font-size:.56rem; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:.18rem; }
.lore-text { font-size:.86rem; color:var(--cream); line-height:1.55; }

/* Footer */
.sh-footer {
  text-align:center; margin-top:1.5rem; padding-top:.8rem; border-top:1px solid var(--bdr);
  font-family:var(--fh); font-size:.52rem; letter-spacing:.18em; text-transform:uppercase; color:var(--dim);
}

/* ── PRINT ── */
@media print {
  body { background:#fff !important; color:#1a1208 !important; }
  .print-btn { display:none !important; }
  .page { padding:.7cm 1.1cm; }

  :root {
    --bg:#fff; --card:#faf5e8;
    --cream:#1a1208; --dim:#555;
    --gold:#8a6010; --goldl:#6a4808; --goldd:#9a7020;
    --bdr:rgba(138,96,16,.22);
  }

  .sec { border-color:rgba(138,96,16,.22); background:#faf5e8; }
  .stat-cell, .hp-cell { background:#f0ebe0; border-color:rgba(138,96,16,.18); }
  .lore-block { background:#f5f0e5; border-left-color:var(--goldd); }
  .money-line { background:#f0ebe0; border-color:rgba(138,96,16,.18); }

  .sec       { break-inside:avoid; }
  .lore-block{ break-inside:avoid; }
  .equip-block{ break-inside:avoid; }

  .sh-universe, .sh-name { text-shadow:none; }
}
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">📥 Enregistrer en PDF (Ctrl+P)</button>

<div class="page">

  <!-- HEADER -->
  <div class="sh-header">
    <div class="sh-universe">Glorée</div>
    <div class="sh-rule"><span></span><em>◆</em><span></span></div>
    <div class="sh-name">${esc(d.charName)}</div>
    <div class="sh-meta">
      ${[d.race, d.nation, d.class1, d.alignment].filter(Boolean).map(esc).join(' · ')}
      ${d.playerName ? `&ensp;—&ensp; Joueur : ${esc(d.playerName)}` : ''}
    </div>
  </div>

  <!-- PORTRAIT + IDENTITÉ -->
  <div class="sec">
    <div class="sec-title">👤 Identité</div>
    <div class="header-row">
      <div class="portrait-wrap">
        <svg class="portrait-frame-svg" viewBox="0 0 150 188" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="144" height="182" fill="none" stroke="#c9a84c" stroke-width="1.2" opacity=".6"/>
          <rect x="7" y="7" width="136" height="174" fill="none" stroke="#c9a84c" stroke-width=".4" opacity=".35"/>
          <path d="M3,22 L3,3 L22,3"   fill="none" stroke="#d4a853" stroke-width="2.2"/><circle cx="3"   cy="3"   r="2.2" fill="#d4a853"/>
          <path d="M128,3  L147,3  L147,22" fill="none" stroke="#d4a853" stroke-width="2.2"/><circle cx="147" cy="3"   r="2.2" fill="#d4a853"/>
          <path d="M3,166  L3,185  L22,185" fill="none" stroke="#d4a853" stroke-width="2.2"/><circle cx="3"   cy="185" r="2.2" fill="#d4a853"/>
          <path d="M128,185 L147,185 L147,166" fill="none" stroke="#d4a853" stroke-width="2.2"/><circle cx="147" cy="185" r="2.2" fill="#d4a853"/>
        </svg>
        ${portrait}
      </div>
      <table class="id-table">${idRows}</table>
    </div>
  </div>

  <!-- APPARENCE & PERSONNALITÉ -->
  ${(d.physique || d.personality) ? `
  <div class="sec">
    <div class="sec-title">🪞 Apparence &amp; Personnalité</div>
    ${d.physique    ? `<div class="lore-block"><div class="lore-label">Apparence physique</div><div class="lore-text">${nl2br(d.physique)}</div></div>` : ''}
    ${d.personality ? `<div class="lore-block"><div class="lore-label">Traits de personnalité</div><div class="lore-text">${nl2br(d.personality)}</div></div>` : ''}
  </div>` : ''}

  <!-- CLASSES -->
  <div class="sec">
    <div class="sec-title">⚔️ Classes &amp; Alignement</div>
    <table class="id-table">${classRows}</table>
  </div>

  <!-- STATISTIQUES -->
  <div class="sec">
    <div class="sec-title">🎲 Statistiques</div>
    <table class="stats-table"><tr>${statCells}</tr></table>
    <div class="hp-row">
      <div class="hp-cell">
        <div class="hp-lbl">❤️ Santé Physique</div>
        <div class="hp-val">${d.hp} / ${d.hp}</div>
      </div>
      <div class="hp-cell">
        <div class="hp-lbl">🧠 Santé Mentale</div>
        <div class="hp-val">100 / 100%</div>
      </div>
    </div>
  </div>

  <!-- COMPÉTENCES -->
  <div class="sec">
    <div class="sec-title">⚡ Compétences <span style="opacity:.5;font-size:.53rem;letter-spacing:.04em">(★ = bonus +2)</span></div>
    <div class="skills-cols">
      <table class="sk-table">
        <thead><tr><th>Compétence</th><th>Base</th><th style="text-align:right">Score</th></tr></thead>
        <tbody>${d.skillScores.slice(0, Math.ceil(d.skillScores.length / 2)).map(s => `
          <tr class="${s.hasBonus ? 'sk-bonus' : ''}">
            <td class="sk-name">${esc(s.name)}${s.hasBonus ? ' <span class="star">★</span>' : ''}</td>
            <td class="sk-formula">${esc(s.formula)}</td>
            <td class="sk-score" style="color:${scoreColor(s.score)}">${fmt(s.score)}</td>
          </tr>`).join('')}</tbody>
      </table>
      <table class="sk-table">
        <thead><tr><th>Compétence</th><th>Base</th><th style="text-align:right">Score</th></tr></thead>
        <tbody>${d.skillScores.slice(Math.ceil(d.skillScores.length / 2)).map(s => `
          <tr class="${s.hasBonus ? 'sk-bonus' : ''}">
            <td class="sk-name">${esc(s.name)}${s.hasBonus ? ' <span class="star">★</span>' : ''}</td>
            <td class="sk-formula">${esc(s.formula)}</td>
            <td class="sk-score" style="color:${scoreColor(s.score)}">${fmt(s.score)}</td>
          </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>

  <!-- ÉQUIPEMENT -->
  <div class="sec">
    <div class="sec-title">🗡️ Équipement &amp; Inventaire <span style="opacity:.5;font-size:.53rem">(${d.equipSlots} emplacements)</span></div>
    <div class="equip-grid">
      <div class="equip-block">
        <h4>⚔️ Équipement Lourd</h4>
        <ul>${liList(d.heavyEquip)}</ul>
      </div>
      <div class="equip-block">
        <h4>👘 Équipement Descriptif</h4>
        <ul>${liList(d.descEquip)}</ul>
      </div>
      <div class="equip-block">
        <h4>🎒 Inventaire</h4>
        <ul>${liList(d.inventory)}</ul>
      </div>
    </div>
    <div class="money-line">
      <span class="money-lbl">💰 Monnaie</span>${moneyStr}
    </div>
  </div>

  <!-- HISTOIRE & LORE -->
  ${loreHTML ? `
  <div class="sec">
    <div class="sec-title">📜 Histoire &amp; Lore</div>
    ${loreHTML}
  </div>` : ''}

  <!-- FOOTER -->
  <div class="sh-footer">
    Univers de Glorée — Création originale protégée &ensp;·&ensp; © 2020–2026
    &ensp;◆&ensp; Fiche générée le ${today}
  </div>

</div>
</body>
</html>`;
}
