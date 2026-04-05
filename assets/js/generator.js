/* ═══════════════════════════════════════════════════════
   GLORÉE — generator.js  v4
   3 pages forcées + sauvegarde JSON
   ═══════════════════════════════════════════════════════ */
'use strict';

function generateSheet() {
  const d = getFormData();
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) { alert('Autorisez les popups pour générer la fiche.'); return; }
  win.document.open();
  win.document.write(buildSheetHTML(d));
  win.document.close();
}

/* ── helpers ── */
const fmt      = v => v >= 0 ? `+${v}` : `${v}`;
const esc      = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const nl2br    = s => esc(s).replace(/\n/g,'<br>');
const orDash   = v => v || '—';
const scoreCol = v => v > 0 ? '#3a8a55' : v < 0 ? '#993333' : '#7a6030';

/* ══════════════════════════════════════════════════════ */
function buildSheetHTML(d) {
  const statKeys   = ['FOR','DEX','CON','INT','SAG','CHA'];
  const statLabels = {FOR:'Force',DEX:'Dextérité',CON:'Constitution',INT:'Intelligence',SAG:'Sagesse',CHA:'Charisme'};
  const today      = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

  /* PORTRAIT */
  const portrait = d.photo
    ? `<img src="${d.photo}" class="p-img" alt="Portrait">`
    : `<div class="p-empty">Portrait<br>non fourni</div>`;

  /* IDENTITY TABLE */
  const idRows = [
    ['Race',           orDash(d.race)],
    ['Nation',         [d.nation, d.originDetail].filter(Boolean).join(', ')||'—'],
    ['Religion',       orDash(d.religion)],
    ['Main Dominante', orDash(d.hand)],
    ['Sexe',           orDash(d.sex)],
    ['Âge',            d.age ? `${d.age} ans${d.ageCategory?' · '+d.ageCategory:''}` : '—'],
    ['Taille',         orDash(d.height)],
    ['Classe Sociale', orDash(d.socialClass)],
    ['Métier',         orDash(d.job)],
    ['Alignement',     orDash(d.alignment)],
  ].map(([k,v])=>`<tr><td class="ik">${esc(k)}</td><td class="iv">${esc(v)}</td></tr>`).join('');

  /* CLASSES */
  const classRows = [
    ['Classe Principale', orDash(d.class1)],
    ...(d.class2 ? [['Classe Secondaire', d.class2]] : []),
  ].map(([k,v])=>`<tr><td class="ik">${esc(k)}</td><td class="iv">${esc(v)}</td></tr>`).join('');

  /* STATS */
  const statCells = statKeys.map(k=>`
    <td class="sc">
      <div class="sc-k">${k}</div>
      <div class="sc-s">${statLabels[k]}</div>
      <div class="sc-v">${d.stats[k]}</div>
      <div class="sc-l">Save</div>
      <div class="sc-sv" style="color:${scoreCol(d.saves[k])}">${fmt(d.saves[k])}</div>
    </td>`).join('');

  /* SKILLS split in 2 columns */
  const half  = Math.ceil(d.skillScores.length / 2);
  const skRow = s => `
    <tr class="${s.hasBonus?'skb':''}">
      <td class="sn">${esc(s.name)}${s.hasBonus?' <span class="star">★</span>':''}</td>
      <td class="sf">${esc(s.formula)}</td>
      <td class="ss" style="color:${scoreCol(s.score)}">${fmt(s.score)}</td>
    </tr>`;
  const skHead = `<thead><tr><th>Compétence</th><th>Base</th><th class="tr">Score</th></tr></thead>`;
  const skL = `<table class="skt">${skHead}<tbody>${d.skillScores.slice(0,half).map(skRow).join('')}</tbody></table>`;
  const skR = `<table class="skt">${skHead}<tbody>${d.skillScores.slice(half).map(skRow).join('')}</tbody></table>`;

  /* EQUIP lists */
  const li = arr => arr.length ? arr.map(i=>`<li>${esc(i)}</li>`).join('') : '<li class="mt">—</li>';
  const moneyStr = [
    d.money.Cu && `${d.money.Cu} C`,
    d.money.Fe && `${d.money.Fe} F`,
    d.money.Ag && `${d.money.Ag} A`,
    d.money.Au && `${d.money.Au} O`,
    d.money.R  && `${d.money.R} R`,
  ].filter(Boolean).join(' · ') || '—';

  /* LORE */
  const loreBlocks = [
    ['Histoire & Motivations',          d.history],
    ['Compétences / Pouvoirs / Reliques', d.powers],
    ['Relations & Alliances',           d.relations],
    ['Objectif Principal',              d.goalMain],
    ['Objectif Secondaire',             d.goalSecond],
    ['Patrimoine & Propriété',          d.property],
    ['Informations Annexes',            d.misc],
  ].filter(([,v])=>v).map(([k,v])=>`
    <div class="lb">
      <div class="ll">${esc(k)}</div>
      <div class="lt">${nl2br(v)}</div>
    </div>`).join('');

  /* ─── COMMON CSS ─── */
  const css = `
<style>
:root{
  --bg:#0d0906; --card:#130e08; --gold:#c9a84c; --gl:#e8c97a;
  --gd:#7a6028; --cr:#e0cfa8; --dm:#9a8060; --bd:rgba(201,168,76,.26);
  --fh:'Cinzel',serif; --fd:'Cinzel Decorative',serif; --fb:'EB Garamond',serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--cr);font-family:var(--fb);font-size:9.5pt;line-height:1.5}

/* print button */
.pbtn{
  position:fixed;top:1rem;right:1rem;
  background:linear-gradient(135deg,#2a1c05,#150e00);
  border:1px solid var(--gd);color:var(--gl);padding:.45rem 1.1rem;
  font-family:var(--fh);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
  border-radius:4px;cursor:pointer;z-index:999;
}
.pbtn:hover{border-color:var(--gold);}

/* pages */
.sheet-page{
  width:21cm;margin:0 auto;padding:1.2cm 1.5cm;
  page-break-after:always;break-after:page;
}
.sheet-page:last-child{page-break-after:auto;break-after:auto}

/* header */
.hdr{text-align:center;border-bottom:1px solid var(--bd);padding-bottom:.8rem;margin-bottom:1.1rem}
.hdr-uni{font-family:var(--fd);font-size:1.35rem;color:var(--gl);letter-spacing:.1em}
.hdr-rule{display:flex;align-items:center;gap:.5rem;margin:.3rem 0 .2rem}
.hdr-rule span{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.hdr-rule em{color:var(--gold);font-style:normal;font-size:.5rem}
.hdr-name{font-family:var(--fh);font-size:1.25rem;font-weight:700;color:var(--cr);letter-spacing:.06em}
.hdr-meta{font-family:var(--fh);font-size:.56rem;letter-spacing:.14em;color:var(--dm);text-transform:uppercase;margin-top:.1rem}

/* page number */
.pgnum{font-family:var(--fh);font-size:.52rem;letter-spacing:.15em;color:var(--gd);text-align:center;margin-bottom:.6rem;text-transform:uppercase}

/* section block */
.sec{background:var(--card);border:1px solid var(--bd);border-radius:5px;padding:.75rem .9rem .85rem;margin-bottom:.75rem;position:relative}
.sec::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,transparent,var(--gd),var(--gold),var(--gd),transparent)}
.st{font-family:var(--fh);font-size:.57rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);border-bottom:1px solid var(--bd);padding-bottom:.25rem;margin-bottom:.65rem;display:flex;align-items:center;gap:.4rem}
.st::before{content:'';width:20px;height:1px;background:linear-gradient(270deg,var(--bd),transparent);flex-shrink:0}
.st::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--bd),transparent)}

/* two-col layout */
.row2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem}

/* portrait + identity */
.id-row{display:flex;gap:1rem;align-items:flex-start}
.pw{flex-shrink:0;position:relative;width:135px;height:170px}
.pfsv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.p-img{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);object-fit:cover;border-radius:2px}
.p-empty{position:absolute;inset:8px;display:flex;align-items:center;justify-content:center;text-align:center;font-family:var(--fh);font-size:.52rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gd);border:1px dashed var(--bd);border-radius:2px}
.idt{border-collapse:collapse;width:100%}
.idt td{padding:.14rem .2rem;border-bottom:1px solid rgba(201,168,76,.07);vertical-align:top}
.idt tr:last-child td{border-bottom:none}
.ik{font-family:var(--fh);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gd);white-space:nowrap;padding-right:.45rem;width:95px}
.iv{font-size:.85rem;color:var(--cr)}

/* stats */
.stt{border-collapse:separate;border-spacing:.3rem 0;width:100%;table-layout:fixed}
.sc{text-align:center;border:1px solid var(--bd);border-radius:4px;padding:.4rem .15rem;background:rgba(0,0,0,.25)}
.sc-k{font-family:var(--fh);font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--gl)}
.sc-s{font-size:.5rem;color:var(--dm);font-style:italic;margin-bottom:.05rem}
.sc-v{font-family:var(--fh);font-size:1.2rem;font-weight:700;color:var(--cr);line-height:1.1}
.sc-l{font-size:.47rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gd);margin-top:.03rem}
.sc-sv{font-family:var(--fh);font-size:.82rem;font-weight:700}

/* hp */
.hp-row{display:flex;gap:.6rem;margin-top:.65rem}
.hp-c{flex:1;text-align:center;background:rgba(0,0,0,.25);border:1px solid var(--bd);border-radius:4px;padding:.4rem}
.hp-l{font-family:var(--fh);font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gd);margin-bottom:.12rem}
.hp-v{font-family:var(--fh);font-size:1rem;font-weight:700;color:var(--cr)}

/* skills 2-col */
.sk2{display:grid;grid-template-columns:1fr 1fr;gap:0 1.2rem}
.skt{border-collapse:collapse;width:100%}
.skt th{font-family:var(--fh);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gd);text-align:left;padding:.16rem .2rem;border-bottom:1px solid var(--bd)}
.skt td{padding:.19rem .2rem;border-bottom:1px solid rgba(201,168,76,.06)}
.skb td{background:rgba(201,168,76,.04)}
.sn{color:var(--cr);font-size:.82rem}
.sf{color:var(--dm);font-style:italic;font-size:.68rem}
.ss{font-family:var(--fh);font-size:.78rem;font-weight:700}
.tr{text-align:right}
.star{color:var(--gold);font-size:.55rem}

/* equip */
.eh{font-family:var(--fh);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.3rem;padding-bottom:.18rem;border-bottom:1px solid var(--bd)}
.eu{list-style:none;padding:0;margin:0}
.eu li{font-size:.82rem;color:var(--cr);padding:.09rem 0;border-bottom:1px solid rgba(201,168,76,.06)}
.eu li:last-child{border-bottom:none}
.eu li::before{content:'◦ ';color:var(--gd)}
.eu li.mt{color:var(--dm);font-style:italic}

/* money */
.ml{margin-top:.6rem;padding:.4rem .65rem;background:rgba(0,0,0,.2);border:1px solid var(--bd);border-radius:4px;font-family:var(--fh);font-size:.65rem;letter-spacing:.05em;color:var(--gl)}
.mlk{color:var(--gd);margin-right:.35rem;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase}

/* lore */
.lb{border-left:2px solid var(--gd);padding:.4rem .65rem;margin-bottom:.55rem;background:rgba(255,255,255,.012);border-radius:0 3px 3px 0}
.lb:last-child{margin-bottom:0}
.ll{font-family:var(--fh);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.15rem}
.lt{font-size:.84rem;color:var(--cr);line-height:1.52}

/* footer */
.ft{text-align:center;margin-top:1rem;padding-top:.65rem;border-top:1px solid var(--bd);font-family:var(--fh);font-size:.48rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gd)}

/* ── PRINT ── */
@media print {
  body{background:#fff!important;color:#1a1208!important}
  .pbtn{display:none!important}
  .sheet-page{width:100%;padding:.6cm .9cm}

  :root{
    --bg:#fff;--card:#faf5e8;--cr:#1a1208;--dm:#555;
    --gold:#8a6010;--gl:#6a4808;--gd:#9a7020;--bd:rgba(138,96,16,.2);
  }
  .sec{border-color:rgba(138,96,16,.2);background:#faf5e8}
  .sc,.hp-c{background:#f0ebe0;border-color:rgba(138,96,16,.15)}
  .lb{background:#f5f0e5;border-left-color:var(--gd)}
  .ml{background:#f0ebe0;border-color:rgba(138,96,16,.15)}
  .sec{break-inside:avoid}
  .lb{break-inside:avoid}
  .hdr-name,.hdr-uni{text-shadow:none}
}
</style>`;

  /* ─── MINI HEADER (pages 2 & 3) ─── */
  const miniHdr = (pg, subtitle) => `
    <div class="pgnum">Page ${pg} · Fiche — ${esc(d.charName)}</div>
    <div class="hdr">
      <div class="hdr-uni">Glorée</div>
      <div class="hdr-rule"><span></span><em>◆</em><span></span></div>
      <div class="hdr-name">${esc(d.charName)}</div>
      <div class="hdr-meta">${esc(subtitle)}</div>
    </div>`;

  /* ═════════════════════════════════════════════════
     PAGE 1 — Identité · Statistiques · Compétences
     ═════════════════════════════════════════════════ */
  const page1 = `
  <div class="sheet-page">

    <!-- HEADER -->
    <div class="pgnum">Page 1 · Identité — Statistiques — Compétences</div>
    <div class="hdr">
      <div class="hdr-uni">Glorée</div>
      <div class="hdr-rule"><span></span><em>◆</em><span></span></div>
      <div class="hdr-name">${esc(d.charName)}</div>
      <div class="hdr-meta">
        ${[d.race,d.nation,d.class1,d.alignment].filter(Boolean).map(esc).join(' · ')}
        ${d.playerName?`&ensp;—&ensp; Joueur : ${esc(d.playerName)}`:''}
      </div>
    </div>

    <!-- IDENTITÉ -->
    <div class="sec">
      <div class="st">👤 Identité</div>
      <div class="id-row">
        <div class="pw">
          <svg class="pfsv" viewBox="0 0 135 170" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="129" height="164" fill="none" stroke="#c9a84c" stroke-width="1.1" opacity=".6"/>
            <rect x="6.5" y="6.5" width="122" height="157" fill="none" stroke="#c9a84c" stroke-width=".4" opacity=".3"/>
            <path d="M3,20 L3,3 L20,3"   fill="none" stroke="#d4a853" stroke-width="2"/><circle cx="3"   cy="3"   r="2" fill="#d4a853"/>
            <path d="M115,3  L132,3  L132,20" fill="none" stroke="#d4a853" stroke-width="2"/><circle cx="132" cy="3"   r="2" fill="#d4a853"/>
            <path d="M3,150  L3,167  L20,167" fill="none" stroke="#d4a853" stroke-width="2"/><circle cx="3"   cy="167" r="2" fill="#d4a853"/>
            <path d="M115,167 L132,167 L132,150" fill="none" stroke="#d4a853" stroke-width="2"/><circle cx="132" cy="167" r="2" fill="#d4a853"/>
          </svg>
          ${portrait}
        </div>
        <table class="idt">${idRows}</table>
      </div>
    </div>

    <!-- CLASSES & ALIGNEMENT -->
    <div class="sec">
      <div class="st">⚔️ Classes &amp; Alignement</div>
      <table class="idt">${classRows}</table>
    </div>

    <!-- STATISTIQUES -->
    <div class="sec">
      <div class="st">🎲 Statistiques · Dés du MJ</div>
      <table class="stt"><tr>${statCells}</tr></table>
      <div class="hp-row">
        <div class="hp-c"><div class="hp-l">❤️ Santé Physique</div><div class="hp-v">${d.hp} / ${d.hp}</div></div>
        <div class="hp-c"><div class="hp-l">🧠 Santé Mentale</div><div class="hp-v">100 / 100%</div></div>
      </div>
    </div>

    <!-- COMPÉTENCES -->
    <div class="sec">
      <div class="st">⚡ Compétences <span style="opacity:.5;font-size:.48rem;letter-spacing:.03em">(★ = bonus +2)</span></div>
      <div class="sk2">${skL}${skR}</div>
    </div>

    <div class="ft">Glorée © 2020–2026 · Page 1/3</div>
  </div>`;

  /* ═════════════════════════════════════════════════
     PAGE 2 — Équipement · Inventaire · Monnaie
     ═════════════════════════════════════════════════ */
  const page2 = `
  <div class="sheet-page">

    ${miniHdr(2, 'Équipement · Inventaire · Monnaie')}

    <!-- ÉQUIPEMENT LOURD -->
    <div class="sec">
      <div class="st">⚔️ Équipement Lourd <span style="opacity:.5;font-size:.48rem">(${d.equipSlots} emplacements)</span></div>
      <ul class="eu">${li(d.heavyEquip)}</ul>
    </div>

    <!-- ÉQUIPEMENT DESCRIPTIF -->
    <div class="sec">
      <div class="st">👘 Équipement Descriptif</div>
      <ul class="eu">${li(d.descEquip)}</ul>
    </div>

    <!-- INVENTAIRE -->
    <div class="sec">
      <div class="st">🎒 Inventaire</div>
      <ul class="eu">${li(d.inventory)}</ul>
    </div>

    <!-- MONNAIE -->
    <div class="sec">
      <div class="st">💰 Monnaie</div>
      <div style="font-family:var(--fh);font-size:.82rem;color:var(--gl);letter-spacing:.05em">${moneyStr}</div>
      <div style="margin-top:.5rem;font-size:.75rem;color:var(--dm)">
        C = Sou Cuivré &ensp;·&ensp; F = Denier de Fer &ensp;·&ensp; A = Florin d'Argent &ensp;·&ensp; O = Couronne Dorée &ensp;·&ensp; R = Sceau Royal
      </div>
    </div>

    <div class="ft">Glorée © 2020–2026 · Page 2/3</div>
  </div>`;

  /* ═════════════════════════════════════════════════
     PAGE 3 — Apparence · Personnalité · Lore
     ═════════════════════════════════════════════════ */
  const appBlock = (d.physique || d.personality) ? `
    <div class="sec">
      <div class="st">🪞 Apparence &amp; Personnalité</div>
      ${d.physique    ? `<div class="lb"><div class="ll">Apparence physique</div><div class="lt">${nl2br(d.physique)}</div></div>` : ''}
      ${d.personality ? `<div class="lb"><div class="ll">Traits de personnalité</div><div class="lt">${nl2br(d.personality)}</div></div>` : ''}
    </div>` : '';

  const loreBlock = loreBlocks ? `
    <div class="sec">
      <div class="st">📜 Histoire &amp; Lore</div>
      ${loreBlocks}
    </div>` : '';

  const page3 = `
  <div class="sheet-page">

    ${miniHdr(3, 'Apparence · Personnalité · Histoire & Lore')}

    ${appBlock}
    ${loreBlock}

    <div class="ft">Univers de Glorée — Création originale protégée &ensp;◆&ensp; © 2020–2026 &ensp;◆&ensp; Fiche générée le ${today} · Page 3/3</div>
  </div>`;

  /* ═════════════════════════════════════════════════
     FULL DOCUMENT
     ═════════════════════════════════════════════════ */
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fiche — ${esc(d.charName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
${css}
</head>
<body>
<button class="pbtn" onclick="window.print()">📥 Enregistrer en PDF (Ctrl+P)</button>
${page1}
${page2}
${page3}
</body>
</html>`;
}
