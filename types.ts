
// Project Dashboard Models
export type StepStatus = string; 

export interface StepVersion {
  id: string;
  content: string;
  status: StepStatus;
  timestamp: number;
  failureReason?: string;
}

export interface CategoryConfig {
  key: string;
  label: string;
  color: string; // Tailwind color name e.g. 'cyan', 'rose'
}

export interface StatusConfig {
  key: string;
  label: string;
  color: string; // Tailwind color name
  icon: string; // Icon Key from ICON_MAP
}

export interface Step {
  id: string;
  title: string;
  category: string; 
  status: StepStatus;
  content: string;
  history?: StepVersion[];
  subSteps?: Step[]; // Nested tasks / sub-cards
  archivedAt?: number; // Timestamp if soft-deleted/archived
  notes?: string; // Quick scratchpad notes
  isTab?: boolean; // If true, shows as a main navigation tab
  createdAt?: number; // Creation timestamp
}

export interface Project {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon?: string; // Icon identifier key (e.g. 'Gamepad2', 'Terminal')
  categories?: CategoryConfig[]; // Custom categories added by user
  statuses?: StatusConfig[]; // Custom statuses added by user
  steps: Step[];
  deletedAt?: number; // Timestamp if soft-deleted/archived
}

// User Profile (Maintained for preferences)
// Updated to include pilotName for the arcade game and additional themes
export interface UserProfile {
  uid: string;
  name: string;
  pilotName?: string;
  themePreference: 'light' | 'dark' | 'retro' | 'modern';
  createdAt: number;
}

// --- GAME TYPES ---

export interface HighScore {
  id?: string;
  userId: string;
  pilotName: string;
  score: number;
  timestamp: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  speed: number;
  cooldown: number;
}

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  isEnemy: boolean;
  active: boolean;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  type: 'bee' | 'butterfly' | 'boss';
  scoreValue: number;
  originalX: number;
  originalY: number;
  phase: number;
}

export interface Particle {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  dx: number;
  dy: number;
  life: number;
  color: string;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isGameOver: boolean;
  highScore: number;
}

// --- PLUGIN SYSTEM TYPES ---

export interface PluginManifest {
  id: string;          // e.g. "com.galagav.schema-builder"
  name: string;        // e.g. "Schema Builder"
  version: string;     // e.g. "1.0.0"
  description: string;
  main: string;        // e.g. "index.js" - The entry point
  style?: string;      // e.g. "style.css" - Optional css
  globalVar: string;   // e.g. "GalagaPlugin_Schema" - The UMD global variable
  type?: 'tool' | 'theme'; // 'tool' adds a tab, 'theme' is background only. Default: 'tool'
}

export interface PluginConfig {
  id: string;
  manifest: PluginManifest;
  files: Record<string, string>; // Virtual File System: "filename" -> "DataURI/Content"
  enabled: boolean;
}

export interface GlobalConfig {
  projectIcons: string[]; // List of active icon keys for projects
  statusIcons: string[];  // List of active icon keys for statuses
  plugins: PluginConfig[]; // Installed plugins
  theme: 'light' | 'dark'; // UI Theme preference
}
