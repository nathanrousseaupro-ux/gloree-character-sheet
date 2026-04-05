# 📜 Glorée — Créateur de Fiche de Personnage

Interface web élégante de création de fiche de personnage pour l'univers de fantasy original **Glorée**.

---

## 🌟 Fonctionnalités

- **Formulaire complet** basé sur la fiche officielle de Glorée
- **Calcul automatique** des Saves (modificateurs) à partir des statistiques
- **Calcul des Compétences** avec sélection de 3 bonus au choix
- **Upload de portrait** avec cadre ornemental fantastique
- **Génération de fiche** en une page, prête à imprimer ou exporter en PDF
- **Design gothique-fantastique** : typographie Cinzel, palette or et parchemin
- **Responsive** : utilisable sur mobile et desktop

---

## 📁 Structure du Projet

```
gloree-character-sheet/
├── index.html              ← Application principale (formulaire)
├── assets/
│   ├── css/
│   │   └── style.css       ← Styles gothiques-fantastiques
│   └── js/
│       ├── main.js         ← Logique formulaire, calculs, interactions
│       └── generator.js    ← Génération HTML de la fiche finale
└── README.md
```

---

## 🚀 Utilisation

### Option 1 — GitHub Pages (recommandé)
1. Fork ou clone le dépôt
2. Activer GitHub Pages sur la branche `main` (Settings → Pages)
3. Accéder à l'URL générée

### Option 2 — En local
```bash
git clone https://github.com/TON_PSEUDO/gloree-character-sheet.git
cd gloree-character-sheet
# Ouvrir index.html dans un navigateur moderne
```

> ⚠️ Certains navigateurs bloquent le chargement de fichiers locaux. En cas de problème, utiliser un serveur local simple :
> ```bash
> python3 -m http.server 8000
> # Puis ouvrir http://localhost:8000
> ```

---

## 📋 Sections de la Fiche

| Section | Contenu |
|---|---|
| **Identité** | Nom, race, nation, religion, main, classes, âge, apparence… |
| **Portrait** | Upload d'image avec cadre ornemental |
| **Statistiques** | FOR · DEX · CON · INT · SAG · CHA · Saves · PV |
| **Compétences** | 20 compétences auto-calculées + 3 bonus sélectionnables |
| **Équipement** | Équipement lourd (slots), descriptif, inventaire, monnaie |
| **Histoire & Lore** | Historique, pouvoirs, relations, objectifs, patrimoine |

---

## 🎲 Système de Règles (résumé)

### Conversion Stat → Save
```
Save = floor((Stat − 10) / 2)
```
| Stat | 1 | 2–3 | 4–5 | 6–7 | 8–9 | 10–11 | 12–13 | 14–15 | 16–17 | 18–19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Save | −5 | −4 | −3 | −2 | −1 | 0 | +1 | +2 | +3 | +4 | +5 |

### Points de Vie
```
PV = max(15 ; Dé1_MJ + Dé2_MJ + CON × 3)
```

### Emplacements Équipement
```
Slots = 3 + max(0, Save_CON)
```

### Races
- **Humain** — Race de base, présente dans toutes les nations
- **Orphérique** — Mutation génétique, lien aux énergies, longévité × 2
- **Géant** — Nés des énergies primordiales des Gardiens

### Nations
| Symbole | Nation |
|---|---|
| 🟣 | Amba'hara |
| 🔵 | Yladenna |
| 🟤 | Edoria |
| 🔴 | Adénasie |
| 🔵 | Dargui |
| 🟢 | Orphérie |
| 🟡 | Désert des Oubliés |

### Classes Disponibles
`Guerrier` · `Assassin` · `Ingénieur` · `Érudit` · `Prêtre` · `Tacticien` · `Maître des Bêtes` · `Alchimiste` · `Chasseur` · `Légende` *(MJ requis)*

---

## 💾 Export PDF

1. Remplir le formulaire
2. Cliquer sur **« Générer ma Fiche de Personnage »**
3. Dans la nouvelle fenêtre : `Ctrl + P` (Windows/Linux) ou `⌘ + P` (macOS)
4. Choisir **Enregistrer en PDF**
5. Recommandé : orientation **Portrait**, marges **Minimes**

---

## ⚖️ Droits

Cet outil est créé pour l'usage personnel dans le cadre du jeu de rôle **Glorée**.

> © 2020–2025 Glorée — L'univers de Glorée, ses créations originales sont protégés par les lois sur le droit d'auteur. Toute reproduction ou utilisation commerciale non autorisée est interdite.

Les images de personnage utilisées dans les fiches sont la responsabilité des joueurs. Elles sont destinées exclusivement au loisir personnel.

---

## 🛠️ Stack Technique

- HTML5 sémantique
- CSS3 pur (pas de framework)
- JavaScript Vanilla (ES6+)
- Google Fonts : [Cinzel](https://fonts.google.com/specimen/Cinzel) · [Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative) · [EB Garamond](https://fonts.google.com/specimen/EB+Garamond)
- Aucune dépendance externe · Aucun build requis
