// Static mirror data for the landing page hero + interactive demo.
// Faithful miniature of the REAL Essor dashboard (sample data, not from
// any API): filières/niveaux follow `scholnexa-data.ts` referentials, the
// dashboard figures match `dashboard.index` (chips, KPI cards, taux de
// réussite, notifications), money is in MAD, school year 2025/2026.

export type DashboardMiniaturePageId =
  | "dashboard"
  | "calendar"
  | "etudiants"
  | "examens"
  | "bulletins"
  | "formateurs"
  | "stages"
  | "paiements"
  | "settings";

export const MIRROR_PAGE_SIZE = 5;

/* ------------------------------------------------------------------ */
/*  Tableau de bord — exactement `dashboard.index` (vue Direction)     */
/* ------------------------------------------------------------------ */

/** Chips du DashHero : Étudiants · Séances ajd · Réussite. */
export const mirrorHeroChips = [
  { label: "Étudiants", value: "563" },
  { label: "Séances ajd", value: "0" },
  { label: "Réussite", value: "94 %" },
];

/** Les 4 cartes KPI (mêmes libellés/icônes que `KpiCard`). */
export const mirrorKpis = [
  { label: "Étudiants actifs", value: "541", tone: "teal" as const },
  { label: "Formateurs actifs", value: "7", tone: "teal" as const },
  { label: "Examens à venir", value: "15", tone: "amber" as const },
  { label: "Bulletins à publier", value: "7", tone: "amber" as const },
];

/** Barres du graphe « Taux de réussite » (une par filière, %). */
export const mirrorReussite = {
  value: 94,
  bars: [
    { name: "IP", value: 96 },
    { name: "IADE", value: 92 },
    { name: "SF", value: 95 },
    { name: "KINÉ", value: 93 },
    { name: "RADIO", value: 94 },
    { name: "LABO", value: 91 },
    { name: "PROTH", value: 97 },
  ],
};

/** Bascule « Recouvrement » : répartition du restant à recouvrer. */
export const mirrorRecouvrement = {
  total: 313700,
  parts: [
    { name: "À jour", value: 1240500 },
    { name: "En retard", value: 216400 },
    { name: "Impayé", value: 96800 },
  ],
};

/** Fil d'activités « Notifications » — mêmes types que `ActiviteFeed`. */
export const mirrorNotifications = [
  { type: "inscription", texte: "Nouvelle inscription Fatima Zahra Lahlou (Prothèse dentaire, S1)", date: "21 juil. 2026" },
  { type: "paiement", texte: "Paiement reçu Salma El Amrani, 11 000 MAD (Tranche 3)", date: "20 juil. 2026" },
  { type: "note", texte: "Notes saisies Anatomie dentaire (S1, Prothèse dentaire)", date: "19 juil. 2026" },
  { type: "note", texte: "Notes saisies Rééducation fonctionnelle (S3, Kinésithérapie)", date: "18 juil. 2026" },
  { type: "paiement", texte: "Relance envoyée Omar Bennani, solde 16 500 MAD", date: "17 juil. 2026" },
  { type: "inscription", texte: "Réinscription confirmée Zakaria Moutaouakil (Kinésithérapie, S4)", date: "16 juil. 2026" },
] as const;

/* ------------------------------------------------------------------ */
/*  Planning — vue semaine (créneaux réels de `scholnexa-data`)        */
/* ------------------------------------------------------------------ */

export const mirrorPlanning = {
  creneaux: [
    "08:30 – 10:00",
    "10:15 – 11:45",
    "12:00 – 13:30",
    "14:00 – 15:30",
    "15:45 – 17:15",
  ],
  days: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
  // Une séance par créneau×jour ; `null` = case vide.
  // tones : teal | amber | blue | violet
  seances: [
    [{ m: "Anatomie", g: "S1-A", s: "Amphi A", tone: "teal" }, null, { m: "Biophysique", g: "S1-B", s: "Amphi B", tone: "blue" }, null, { m: "Anatomie", g: "S1-A", s: "Amphi A", tone: "teal" }],
    [{ m: "Rééducation", g: "S3-G1", s: "Salle rééd.", tone: "amber" }, { m: "Anatomie", g: "S1-B", s: "Amphi A", tone: "teal" }, null, { m: "Kiné cardio", g: "S3-G2", s: "Labo sim. 1", tone: "amber" }, null],
    [null, { m: "Radioprotection", g: "S4-G1", s: "Amphi B", tone: "violet" }, { m: "Prothèse", g: "S1-A", s: "Atelier", tone: "teal" }, null, { m: "Scanner/IRM", g: "S5-G1", s: "Labo sim. 2", tone: "blue" }],
    [{ m: "Biologie méd.", g: "S2-A", s: "Labo bio", tone: "blue" }, null, { m: "Obstétrique", g: "S4-G2", s: "Amphi A", tone: "violet" }, { m: "Soins intensifs", g: "S5-G2", s: "Labo sim. 1", tone: "amber" }, null],
    [null, { m: "Anesthésie", g: "S5-G1", s: "Labo sim. 2", tone: "amber" }, null, { m: "Législation", g: "S6-G1", s: "Amphi B", tone: "teal" }, { m: "Rééducation", g: "S3-G1", s: "Salle rééd.", tone: "amber" }],
  ] as ({ m: string; g: string; s: string; tone: "teal" | "amber" | "blue" | "violet" } | null)[][],
};

/* ------------------------------------------------------------------ */
/*  Étudiants — colonnes réelles : CNE · Nom · Filière · Niveau ·      */
/*  Statut · Paiement                                                  */
/* ------------------------------------------------------------------ */

export const mirrorEtudiants = [
  { id: "1", cne: "D162004321", nom: "Salma El Amrani", filiere: "Prothèse dentaire", niveau: "S1", statut: "Actif", paiement: "paye" },
  { id: "2", cne: "D162004322", nom: "Fatima Zahra Lahlou", filiere: "Prothèse dentaire", niveau: "S1", statut: "Actif", paiement: "paye" },
  { id: "3", cne: "D162004087", nom: "Zakaria Moutaouakil", filiere: "Kinésithérapie", niveau: "S4", statut: "Actif", paiement: "paye" },
  { id: "4", cne: "D162003955", nom: "Omar Bennani", filiere: "Kinésithérapie", niveau: "S3", statut: "Actif", paiement: "retard" },
  { id: "5", cne: "D162004189", nom: "Lina Ouazzani", filiere: "Infirmier polyvalent", niveau: "S2", statut: "Actif", paiement: "impaye" },
] as const;

/* ------------------------------------------------------------------ */
/*  Examens — Examen · Module · Groupe · Type · Date · Statut          */
/* ------------------------------------------------------------------ */

export const mirrorExamens = [
  { id: "1", titre: "Anatomie dentaire", module: "Anatomie dentaire", groupe: "S1-A", type: "Contrôle continu", date: "02 sept.", niveau: "S1", formateur: "N. Tazi", statut: "Planifié" },
  { id: "2", titre: "Réanimation et soins intensifs", module: "Soins intensifs", groupe: "S5-G2", type: "Évaluation pratique (TP)", date: "28 août", niveau: "S5", formateur: "R. Benjelloun", statut: "Planifié" },
  { id: "3", titre: "Scanner et IRM", module: "Imagerie médicale", groupe: "S5-G1", type: "Évaluation pratique (TP)", date: "26 août", niveau: "S5", formateur: "M. Amrani", statut: "Notes saisies" },
  { id: "4", titre: "Rééducation fonctionnelle", module: "Rééducation", groupe: "S3-G1", type: "Examen théorique", date: "25 août", niveau: "S3", formateur: "S. Bennis", statut: "Notes saisies" },
  { id: "5", titre: "Biologie médicale", module: "Biochimie", groupe: "S2-A", type: "Contrôle continu", date: "22 août", niveau: "S2", formateur: "Y. Idrissi", statut: "En cours" },
] as const;

/* ------------------------------------------------------------------ */
/*  Bulletins — Étudiant · Niveau · Moyenne · Mention · Décision ·     */
/*  Statut (+ chip « 7 à publier »)                                    */
/* ------------------------------------------------------------------ */

export const mirrorBulletins = {
  aPublier: 7,
  rows: [
    { id: "1", etudiant: "Salma El Amrani", niveau: "S1", moyenne: "15,4", mention: "Bien", decision: "Admise", statut: "Publié" },
    { id: "2", etudiant: "Zakaria Moutaouakil", niveau: "S4", moyenne: "13,8", mention: "Assez bien", decision: "Admis", statut: "Publié" },
    { id: "3", etudiant: "Omar Bennani", niveau: "S3", moyenne: "11,2", mention: "Passable", decision: "Admis", statut: "À publier" },
    { id: "4", etudiant: "Lina Ouazzani", niveau: "S2", moyenne: "14,6", mention: "Bien", decision: "Admise", statut: "À publier" },
    { id: "5", etudiant: "Aya Rachidi", niveau: "S6", moyenne: "16,1", mention: "Très bien", decision: "Admise", statut: "Publié" },
  ] as const,
};

/* ------------------------------------------------------------------ */
/*  Formateurs — Matricule · Nom · Département · Modules · Statut      */
/* ------------------------------------------------------------------ */

export const mirrorFormateurs = [
  { id: "1", matricule: "FO-001", nom: "Nadia Tazi", departement: "Infirmier polyvalent", modules: 3, statut: "Actif" },
  { id: "2", matricule: "FO-002", nom: "Mohamed Amrani", departement: "Radiologie / Imagerie médicale", modules: 2, statut: "Actif" },
  { id: "3", matricule: "FO-003", nom: "Sara Bennis", departement: "Kinésithérapie", modules: 4, statut: "Actif" },
  { id: "4", matricule: "FO-004", nom: "Youssef Idrissi", departement: "Laboratoire / Biologie médicale", modules: 2, statut: "Actif" },
  { id: "5", matricule: "FO-005", nom: "Rim Benjelloun", departement: "Infirmier anesthésie-réanimation", modules: 3, statut: "Actif" },
] as const;

/* ------------------------------------------------------------------ */
/*  Stages — Étudiant · Structure d'accueil · Service · Période ·      */
/*  Statut (structures réelles de `STRUCTURES_ACCUEIL`)                */
/* ------------------------------------------------------------------ */

export const mirrorStages = [
  { id: "1", etudiant: "Zakaria Moutaouakil", structure: "CHR Hassan II — Agadir", service: "Rééducation fonctionnelle", periode: "juil. – sept. 2026", statut: "En cours" },
  { id: "2", etudiant: "Salma El Amrani", structure: "CHU Ibn Rochd — Agadir", service: "Laboratoire central", periode: "sept. – oct. 2026", statut: "Convention signée" },
  { id: "3", etudiant: "Omar Bennani", structure: "Clinique Al Massira — Agadir", service: "Kinésithérapie", periode: "mai – juil. 2026", statut: "Soutenance" },
  { id: "4", etudiant: "Lina Ouazzani", structure: "Hôpital Hassan II — Agadir", service: "Urgences", periode: "à définir", statut: "Recherche" },
  { id: "5", etudiant: "Aya Rachidi", structure: "Hôpital préfectoral Inezgane", service: "Radiologie", periode: "avr. – juin 2026", statut: "Validé" },
] as const;

/* ------------------------------------------------------------------ */
/*  Paiements — 5 KPI + table par étudiant (vue réelle)                */
/* ------------------------------------------------------------------ */

export const mirrorPaiementKpis = [
  { label: "Encaissé (mois)", value: "142 600", tone: "teal" as const },
  { label: "En attente", value: "18 200", tone: "amber" as const },
  { label: "En retard", value: "21 300", tone: "red" as const },
  { label: "Impayés", value: "9", tone: "red" as const },
  { label: "À recouvrer", value: "39 500", tone: "blue" as const },
];

export const mirrorPaiementsRows = [
  { id: "1", etudiant: "Salma El Amrani", filiere: "Prothèse dentaire", semestre: "S1", annee: "1ère année", regle: "11 000", reste: "0", statut: "paye" },
  { id: "2", etudiant: "Zakaria Moutaouakil", filiere: "Kinésithérapie", semestre: "S4", annee: "2ème année", regle: "24 000", reste: "0", statut: "paye" },
  { id: "3", etudiant: "Omar Bennani", filiere: "Kinésithérapie", semestre: "S3", annee: "2ème année", regle: "8 500", reste: "16 500", statut: "retard" },
  { id: "4", etudiant: "Lina Ouazzani", filiere: "Infirmier polyvalent", semestre: "S2", annee: "1ère année", regle: "6 000", reste: "12 000", statut: "impaye" },
  { id: "5", etudiant: "Aya Rachidi", filiere: "Radiologie / Imagerie médicale", semestre: "S6", annee: "3ème année", regle: "27 000", reste: "0", statut: "paye" },
] as const;

export const STATUT_PAIEMENT_COURT: Record<string, { label: string; cls: string }> = {
  paye: { label: "Payé", cls: "bg-[#2563EB]/30 text-[#1E40AF]" },
  en_attente: { label: "En attente", cls: "bg-[#FF6B4A]/20 text-[#C14A2E]" },
  retard: { label: "Retard", cls: "bg-[#EF4444]/20 text-[#DC2626]" },
  impaye: { label: "Impayé", cls: "bg-[#EF4444]/20 text-[#DC2626]" },
};

/* ------------------------------------------------------------------ */
/*  Paramètres — sections du vrai module Paramètres                    */
/* ------------------------------------------------------------------ */

export const mirrorSettingsSections = [
  {
    title: "Établissement",
    desc: "Nom de l'école, ville, contacts",
    rows: [
      { label: "Nom de l'école", value: "Institut Atlas Santé" },
      { label: "Ville", value: "Agadir" },
    ],
  },
  {
    title: "Filières & modules",
    desc: "7 filières · modules par semestre",
    rows: [
      { label: "Filières actives", value: "7" },
      { label: "Semestres", value: "S1 – S6" },
    ],
  },
  {
    title: "Groupes & salles",
    desc: "S1-A → S6-G2 · 12 salles",
    rows: [
      { label: "Groupes", value: "12" },
      { label: "Salles & labos", value: "12" },
    ],
  },
  {
    title: "Utilisateurs & rôles",
    desc: "Direction, enseignants, administration",
    rows: [
      { label: "Utilisateurs", value: "14" },
      { label: "Rôles actifs", value: "3" },
    ],
  },
];

