export type Orientation = "landscape" | "portrait";
export type Vibe = "none" | "dark" | "cyberpunk" | "cinematic" | "corporate";
export type ColorGrade = "none" | "warm" | "cool" | "pastel" | "bw" | "neon";

export interface ApiKeys {
  pexels: string;
  pixabay: string;
  gemini: string;
  coverr?: string;
  freesound?: string;
}

export interface EnabledSources {
  pexels: boolean;
  pixabay: boolean;
  coverr: boolean;
  freesound: boolean;
}

export interface VideoResult {
  id: string; // Unique ID composed of source + index
  source: "PEXELS" | "PIXABAY" | "COVERR";
  image: string;
  videoSrc: string; // The specific video file URL (HD/4K)
  url: string; // The page URL
  duration: number;
}

export interface AudioResult {
  id: string;
  source: "FREESOUND";
  name: string;
  artist: string;
  previewUrl: string; // MP3 preview
  downloadUrl: string;
  duration: number;
  waveformData?: number[]; // Optional visualization
}

export interface Scene {
  id: number;
  originalLine: string;
  type: "VISUAL" | "DIALOGUE" | "AUDIO";
  query: string;
  isAiGenerated: boolean;
  selectedVideo?: VideoResult;
  selectedAudio?: AudioResult; // NEW
  cutDuration: number; // Defaults to 4s
  options: VideoResult[];
  audioOptions?: AudioResult[]; // NEW
  page: number; // For pagination
}

export interface GlobalState {
  orientation: Orientation;
  vibe: Vibe;
  colorGrade: ColorGrade;
  apiKeys: ApiKeys;
}
