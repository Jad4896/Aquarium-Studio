export type TankType = "SALTWATER" | "FRESHWATER";

export interface Tank {
  id: string;
  name: string;
  tankType: TankType;
  volumeLiters: number;
  hasSump?: boolean;
  displayVolumeLiters?: number;
  sumpVolumeLiters?: number;
  sumpChambers?: number;
  sumpEquipment?: string;
  sumpMedia?: string;
  hasRefugium?: boolean;
  refugiumVolumeLiters?: number;
  refugiumType?: string;
  refugiumLighting?: string;
  formFactor?: string;
  purpose: string;
  cycle: string;
  setupDate: string;
  equipment: string;
  lighting: string;
  aquascapeStyle?: string;
  salinityTarget: string;
  tempTarget: string;
  phTarget: string;
  dkhTarget: string;
  caTarget: string;
  mgTarget: string;
  no3Target: string;
  po4Target: string;
  ammoniaTarget?: string;
  nitriteTarget?: string;
  ghTarget?: string;
  khTarget?: string;
  tdsTarget?: string;
  sitterTitle: string;
  sitterContact: string;
  sitterEmergency: string;
  sitterChecklist: string;
  sitterNotes: string;
  parameters: WaterParameter[];
  livestock: Livestock[];
  tasks: MaintenanceTask[];
  notes: StickyNote[];
  milestones: TankMilestone[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface WaterParameter {
  id: string;
  tankId: string;
  date: string;
  temp: number;
  ph: number;
  no3?: number;
  wcLiters?: number;
  mood?: string;
  notes?: string;
  // Saltwater specific
  salinity?: number;
  alk?: number;
  ca?: number;
  mg?: number;
  po4?: number;
  // Freshwater specific
  ammonia?: number;
  nitrite?: number;
  gh?: number;
  kh?: number;
  tds?: number;
  createdAt: string;
}

export interface LivestockMedia {
  id: string;
  livestockId: string;
  url: string;
  mediaType: "image" | "video";
  caption?: string;
  date: string;
  isBefore: boolean;
  isAfter: boolean;
  isMilestone?: boolean;
  createdAt: string;
}

export interface Livestock {
  id: string;
  tankId: string;
  type: "CORAL" | "FISH_INVERT" | "PLANT";
  name: string;
  species: string;
  category: string;
  growthType?: string;
  zone?: string;
  lighting?: string;
  aggressiveness?: string;
  temperament?: string;
  diet?: string;
  interestingFact?: string;
  notes?: string;
  primaryPhotoUrl?: string;
  primaryVideoUrl?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  media: LivestockMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTask {
  id: string;
  tankId: string;
  title: string;
  intervalDays: number;
  lastCompleted: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StickyNote {
  id: string;
  tankId: string;
  title: string;
  tag: string;
  tagColor: string;
  body: string;
  dateLabel: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaltFormula {
  id: string;
  name: string;
  gramsPerLiter: number;
  isDefault: boolean;
}

export type DosingElement =
  | "alk"
  | "ca"
  | "mg"
  | "no3"
  | "po4"
  | "k"
  | "fe"
  | "i"
  | "sr"
  | "all_in_one";

export interface CustomDosingFormula {
  id: string;
  name: string;
  brand?: string;
  element: DosingElement;
  unit: "mL" | "g" | "drops";
  doseMode: "rate" | "ppm_delta";
  doseRatePer100L: number;
  ppmPerMlPer100L?: number;
  frequency?: string;
  instructions?: string;
  targetParameters?: string;
  createdAt: string;
}

export interface TankMilestone {
  id: string;
  tankId: string;
  date: string;
  title: string;
  caption?: string;
  photoUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  tankId: string;
  date: string;
  title: string;
  category: string;
  description?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type UnitSystem = "metric" | "imperial";
export type SalinityUnit = "sg" | "ppt";

export interface ThemeColors {
  bgMain: string;
  bgCard: string;
  bgCardHover: string;
  bgInput: string;
  border: string;
  accent: string;
  teal: string;
  textMain: string;
  textMuted: string;
}
