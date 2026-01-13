export type Orientation = "landscape" | "portrait";
export type Vibe = "none" | "dark" | "cyberpunk" | "cinematic" | "corporate";

export interface ApiKeys {
  pexels: string;
  pixabay: string;
  gemini: string;
}

export interface VideoResult {
  id: string; // Unique ID composed of source + index
  source: "PEXELS" | "PIXABAY";
  image: string;
  videoSrc: string; // The specific video file URL (HD/4K)
  url: string; // The page URL
  duration: number;
}

export interface Scene {
  id: number;
  originalLine: string;
  type: "VISUAL" | "DIALOGUE" | "AUDIO";
  query: string;
  isAiGenerated: boolean;
  selectedVideo?: VideoResult;
  cutDuration: number; // Defaults to 4s
  options: VideoResult[];
  page: number; // For pagination
}

export interface GlobalState {
  orientation: Orientation;
  vibe: Vibe;
  apiKeys: ApiKeys;
}
