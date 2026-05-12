export type MetricKey = 'fce_total' | 'fae_total' | 'fae_emergency' | 'fce_day_case';
export type GranularityKey = 'block' | 'category';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  description: string;

  // long-form NHS definition
  tooltip: string;
}

export interface GranularityConfig {
  key: GranularityKey;
  label: string;
  description: string;
  file: string;
}

// optional tooltip explanation for future use
export const METRICS: MetricConfig[] = [
  {
    key: 'fce_total',
    label: 'Total FCE (Default)',
    description: 'Clinical care episodes provided to a patient under a hospital consultant',
    tooltip:
      'A finished consultant episode (FCE) is a continuous period of admitted patient care under one consultant within one healthcare provider. FCEs are counted against the year in which they end. Figures do not represent the number of different patients, as a person may have more than one episode of care within the same stay in hospital or in different stays in the same year.',
  },

  {
    key: 'fae_total',
    label: 'Total FAE',
    description: 'Hospital admissions',
    tooltip:
      'A finished admission episode (FAE) is the first period of admitted patient care under one consultant within one healthcare provider. FAEs are counted against the year in which the admission episode finishes. Admissions do not represent the number of patients, as a person may have more than one admission within the year.',
  },

  {
    key: 'fae_emergency',
    label: 'Emergency Admissions',
    description: 'Emergency hospital admission episodes',
    tooltip:
      'The count of admission episodes with an admission method code indicating the admission was an emergency admission.',
  },

  {
    key: 'fce_day_case',
    label: 'Day Case Episodes',
    description: 'Patients admitted and discharged the same day',
    tooltip:
      'Day cases are patients who have been admitted for treatment just for the day. There are therefore always single episode spells with a duration of zero days. The intention is for treatment to be concluded in one day. If, unexpectedly, the patient is kept overnight, it must be re-classed as an ordinary admission.',
  },
];

export const GRANULARITIES: GranularityConfig[] = [
  { key: 'block',    label: 'Blocks (Default)',     description: 'ICD-10 block ranges',           file: '/data/blocks.json' },
  { key: 'category', label: 'Categories', description: '3-character ICD-10 categories', file: '/data/categories.json' },
];

export interface Block {
  blockID:      string;
  chapter:      string;
  category:     string;
  fce_total:    number;
  fae_total?:   number;
  fae_emergency?: number;
  fce_day_case?:  number;
}

// ai-generated human-readable display names for ICD-10 blocks
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
  'J40-J47': 'Chronic Respiratory Disease (COPD & Asthma)',
  'J20-J22': 'Acute Bronchitis & Respiratory Infections',
  'J30-J39': 'Diseases of Nose, Throat & Larynx',
  'J00-J06': 'Acute Upper Respiratory Infections',
  'I20-I25': 'Coronary Heart Disease & Heart Attacks',
  'I30-I52': 'Other Heart Diseases',
  'I60-I69': 'Strokes & Cerebrovascular Disease',
  'I80-I89': 'Vascular Disease (Veins & Arteries)',
  'K20-K31': 'Stomach & Oesophagus Disorders',
  'K40-K46': 'Hernia',
  "K50-K52": "Crohn's Disease & Colitis",
  'K55-K64': 'Bowel Disease (incl. Appendix & Haemorrhoids)',
  'K80-K87': 'Gallstones & Liver Disease',
  'K90-K93': 'Intestinal Malabsorption & Disorders',
  'K00-K14': 'Mouth & Teeth Disorders',
  'M00-M25': 'Joint Diseases (Arthritis & Gout)',
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
  'S10-S19': 'Neck Injuries',
  'S20-S29': 'Chest Injuries',
  'S30-S39': 'Abdominal & Pelvic Injuries',
  'S40-S49': 'Shoulder & Upper Arm Injuries',
  'S50-S59': 'Forearm & Elbow Injuries',
  'S60-S69': 'Wrist & Hand Injuries',
  'S70-S79': 'Hip & Thigh Injuries',
  'S80-S89': 'Knee & Lower Leg Injuries',
  'S90-S99': 'Ankle & Foot Injuries',
  'T00-T07': 'Multiple Body Region Injuries',
  'T08-T14': 'Unspecified Body Part Injuries',
  'T15-T19': 'Foreign Body Effects',
  'T20-T32': 'Burns & Corrosions',
  'T33-T35': 'Frostbite',
  'T36-T50': 'Poisoning by Drugs & Medications',
  'T51-T65': 'Toxic Effects (Alcohol, Solvents, Pesticides)',
  'T66-T78': 'Environmental & Other Trauma (Allergies, Radiation)',
  'T79-T79': 'Complications of Trauma',
  'T80-T88': 'Complications of Medical Procedures',
  'T90-T98': 'Sequelae of Injuries & Poisoning',
  'G40-G47': 'Epilepsy & Sleep Disorders',
  'F00-F09': 'Organic Mental Disorders (incl. Dementia)',
  'H25-H28': 'Cataract & Lens Disorders',
  'L00-L08': 'Skin Infections',
  'E70-E90': 'Metabolic Disorders (Obesity & Diabetes)',
  'Z00-Z13': 'Health Examinations & Screenings',
  'Z20-Z29': 'Contact with Infectious Disease',
  'Z30-Z39': 'Contraception & Reproductive Health',
  'Z40-Z54': 'Medical Aftercare & Follow-up',
  'Z55-Z65': 'Social & Environmental Factors',
  'Z70-Z76': 'Health Advice & Counselling',
  'Z80-Z99': 'Family History & Risk Factors',
  'U00-U49': 'COVID-19 & Special Purpose Codes',
};

export interface GameState {
  phase: 'home' | 'name-entry' | 'playing' | 'result' | 'leaderboard';
  playerName: string;
  score: number;
  highScore: number;
  currentLeft:  Block | null;
  currentRight: Block | null;
  usedBlockIds: Set<string>;
  currentMetric: MetricKey;
  currentGranularity: GranularityKey;
  isAnimating: boolean;
  lastAnswerCorrect: boolean | null;
}

export interface LeaderboardEntry {
  name:      string;
  score:     number;
  timestamp: string;
}