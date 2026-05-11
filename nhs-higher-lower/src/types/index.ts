
// different columns can be added later, but these are the most interesting ones for the game
export type MetricKey = 'fce_total' | 'fae_total' | 'fae_emergency' | 'fce_day_case';

export interface MetricConfig {
    key: MetricKey;
    label: string;
    description: string;
}

export const METRICS: MetricConfig[] = [
    { key: 'fce_total',     label: 'Total Admissions',    description: 'Total Finished Consultant Episodes (FCE)' },
    { key: 'fae_total',     label: 'Total Episodes',      description: 'Finished Admission Episodes (FAE)' },
    { key: 'fae_emergency', label: 'Emergency Admissions', description: 'Emergency Finished Admission Episodes' },
    { key: 'fce_day_case',  label: 'Day Cases',           description: 'Day Case FCE' },
];

// subcategory is not included as that's not really interesting
export interface Block {
    chapter: string;
    blockID: string;    
    category: string;
    fce_total: number;
    // optional extra metrics (only present if data is extended)
    fae_total?: number;
    fae_emergency?: number;
    fce_day_case?: number;
}

// used AI to turn the block codes into more human readable names and easier to play with
export const BLOCK_DISPLAY_NAMES: Record<string, string> = {
  'C00-C97': 'All Cancers (Malignant Neoplasms)',
  'C00-C14': 'Head & Neck Cancers',
  'C15-C26': 'Digestive Organ Cancers',
  'C30-C39': 'Respiratory & Thoracic Cancers',
  'C43-C44': 'Skin Cancers',
  'C50-C50': 'Breast Cancer',
  'C51-C58': 'Female Genital Cancers',
  'C60-C63': 'Male Genital Cancers',
  'C64-C68': 'Urinary Tract Cancers',
  'C69-C72': 'Brain & CNS Cancers',
  'C73-C75': 'Thyroid & Endocrine Cancers',
  'C76-C80': 'Unknown Primary Cancers',
  'C81-C96': 'Blood & Lymphoid Cancers',
  'D00-D09': 'Carcinoma In Situ (Pre-cancerous)',
  'D10-D36': 'Benign Tumours',
  'D37-D48': 'Tumours of Uncertain Behaviour',
  'D50-D53': 'Nutritional Anaemia',
  'D60-D64': 'Aplastic & Haemolytic Anaemia',
  'A50-A64': 'Sexually Transmitted Infections (STIs)',
  'B20-B24': 'HIV / AIDS',
  'B25-B34': 'Viral Infections (Other)',
  'A00-A09': 'Intestinal Infectious Diseases',
  'A30-A49': 'Bacterial Diseases',
  'J09-J18': 'Influenza & Pneumonia',
  'J40-J47': 'Chronic Respiratory Disease (COPD, Asthma)',
  'J20-J22': 'Acute Bronchitis & Respiratory Infections',
  'J30-J39': 'Diseases of Nose, Throat & Larynx',
  'J00-J06': 'Acute Upper Respiratory Infections',
  'I20-I25': 'Coronary Heart Disease & Heart Attacks',
  'I30-I52': 'Other Heart Diseases',
  'I60-I69': 'Strokes & Cerebrovascular Disease',
  'I80-I89': 'Vascular Disease (Veins, Arteries)',
  'K20-K31': 'Stomach & Oesophagus Disorders',
  'K40-K46': 'Hernia',
  'K50-K52': 'Crohn\'s Disease & Colitis',
  'K55-K64': 'Bowel Disease (incl. Appendix, Haemorrhoids)',
  'K80-K87': 'Gallstones & Liver Disease',
  'K90-K93': 'Intestinal Malabsorption & Disorders',
  'K00-K14': 'Mouth & Teeth Disorders',
  'M00-M25': 'Joint Diseases (Arthritis, Gout)',
  'M40-M54': 'Back & Spine Disorders',
  'M60-M79': 'Soft Tissue & Muscle Disorders',
  'N17-N19': 'Kidney Failure',
  'N30-N39': 'Urinary Tract Infections & Bladder',
  'N80-N98': 'Female Reproductive Disorders',
  'O00-O08': 'Complications of Pregnancy (Early)',
  'O20-O29': 'Maternal Care',
  'O30-O48': 'Complications of Pregnancy (Late)',
  'O60-O75': 'Complications of Labour & Delivery',
  'R00-R09': 'Chest & Breathing Symptoms',
  'R10-R19': 'Abdominal & Digestive Symptoms',
  'R25-R29': 'Neurological Symptoms',
  'R30-R39': 'Urinary Symptoms',
  'R50-R69': 'General Symptoms (Fever, Pain, Fatigue)',
  'S00-S09': 'Head Injuries',
  'S70-S79': 'Hip & Thigh Injuries',
  'T36-T50': 'Poisoning by Drugs & Medications',
  'T80-T88': 'Complications of Medical Procedures',
  'G40-G47': 'Epilepsy & Sleep Disorders',
  'H25-H28': 'Cataract & Lens Disorders',
  'L00-L08': 'Skin Infections',
  'E70-E90': 'Metabolic Disorders (Obesity, Diabetes)',
  'Z00-Z13': 'Health Examinations & Screenings',
  'Z30-Z39': 'Contraception & Reproductive Health',
  'Z40-Z54': 'Medical Aftercare & Follow-up',
};

// game types
export interface GameState {
  phase: 'name-entry' | 'playing' | 'result' | 'leaderboard';
  playerName: string;
  score: number;
  highScore: number;

  // left and right sections of the game to be compared with each other
  currentLeft: Block | null;
  currentRight: Block | null;

  // don't use the same block twice in a game
  usedBlockIds: Set<string>;
  currentMetric: MetricKey;
  isAnimating: boolean;
  lastAnswerCorrect: boolean | null;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: string;
}