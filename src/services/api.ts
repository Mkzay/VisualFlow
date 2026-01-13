import type { VideoResult, Orientation, Vibe, ColorGrade } from "../types";

const PEXELS_API_URL = "https://api.pexels.com/videos/search";
const PIXABAY_API_URL = "https://pixabay.com/api/videos/";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "on",
  "at",
  "to",
  "from",
  "by",
  "in",
  "of",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "shall",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  "it",
  "its",
  "he",
  "she",
  "they",
  "we",
  "i",
  "you",
  "my",
  "your",
  "his",
  "her",
  "their",
  "our",
  "this",
  "that",
  "these",
  "those",
]);

const VIBE_KEYWORDS: Record<Vibe, string> = {
  none: "",
  dark: "dark moody atmospheric",
  cyberpunk: "cyberpunk neon glitch futuristic",
  cinematic: "cinematic 4k film look shallow depth of field",
  corporate: "clean bright business professional office",
};

const COLOR_KEYWORDS: Record<ColorGrade, string> = {
  none: "",
  warm: "golden hour orange yellow warm tones sunset",
  cool: "blue teal cyan cold winter",
  pastel: "pastel soft pink mint light colors",
  bw: "black and white monochrome noir",
  neon: "neon purple pink glow fluorescent",
};

export const extractKeywords = (sentence: string): string => {
  const words = sentence
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .split(/\s+/);
  const keywords = words.filter(
    (word) => !STOP_WORDS.has(word) && word.length > 2
  );
  return keywords.slice(0, 4).join(" ");
};

export const fetchGeminiQuery = async (
  scriptLine: string,
  apiKey: string,
  mode: "literal" | "metaphorical" = "literal"
): Promise<string | null> => {
  if (!apiKey) return null;

  const literalPrompt = `You are an expert stock footage researcher. Your task is to convert a line from a video script into a single, highly visual search query.
    Input Line: "${scriptLine}"
    Rules: Output ONLY the search query. No quotes. Keep it 2-4 words max. Focus on visual nouns/adjectives.`;

  const metaphoricalPrompt = `You are a visionary film director using AI to communicate deep subtext. 
    Analyze the emotional weight and subtext of this script line: "${scriptLine}"
    Instead of literal keywords, provide a search query for a METAPHORICAL or ABSTRACT stock video clip that represents this feeling.
    Examples:
    "I feel trapped" -> "Bird cage"
    "New beginning" -> "Sunrise horizon"
    "Chaos in my mind" -> "Static noise"
    
    Rules: Output ONLY the 2-4 word search query. No quotes. No explanation.`;

  const prompt = mode === "metaphorical" ? metaphoricalPrompt : literalPrompt;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) throw new Error("Gemini API Failed");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim().replace(/['"]/g, "");
  } catch (error) {
    console.warn("Gemini Error:", error);
    return null;
  }
};

export const searchPexels = async (
  query: string,
  apiKey: string,
  orientation: Orientation,
  page: number = 1
): Promise<VideoResult[]> => {
  if (!apiKey) return [];
  try {
    const response = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(
        query
      )}&per_page=3&page=${page}&orientation=${orientation}&size=medium`,
      {
        headers: { Authorization: apiKey },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    return data.videos.map(
      (
        v: {
          id: number;
          image: string;
          duration: number;
          url: string;
          video_files: Array<{ height: number; link: string }>;
        },
        index: number
      ) => ({
        id: `PEXELS-${v.id}-${index}`,
        source: "PEXELS",
        image: v.image,
        duration: v.duration,
        url: v.url,
        videoSrc: (
          v.video_files.find((f) => f.height >= 720) || v.video_files[0]
        ).link,
      })
    );
  } catch (error) {
    console.warn("Pexels Error:", error);
    return [];
  }
};

export const searchPixabay = async (
  query: string,
  apiKey: string,
  orientation: Orientation,
  page: number = 1
): Promise<VideoResult[]> => {
  if (!apiKey) return [];
  const pixabayOrientation =
    orientation === "portrait" ? "vertical" : "horizontal";
  try {
    const response = await fetch(
      `${PIXABAY_API_URL}?key=${apiKey}&q=${encodeURIComponent(
        query
      )}&per_page=3&page=${page}&video_type=film&orientation=${pixabayOrientation}`
    );

    if (!response.ok) return [];
    const data = await response.json();

    return data.hits.map(
      (
        v: {
          id: number;
          picture_id: string;
          duration: number;
          pageURL: string;
          videos: { large: { url: string }; medium: { url: string } };
        },
        index: number
      ) => ({
        id: `PIXABAY-${v.id}-${index}`,
        source: "PIXABAY",
        image: `https://i.vimeocdn.com/video/${v.picture_id}_640x360.jpg`,
        duration: v.duration,
        url: v.pageURL,
        videoSrc: v.videos.large.url || v.videos.medium.url,
      })
    );
  } catch (error) {
    console.warn("Pixabay Error:", error);
    return [];
  }
};

const COVERR_API_URL = "https://api.coverr.co/videos";

export const searchCoverr = async (
  query: string,
  apiKey: string | undefined,
  page: number = 1
): Promise<VideoResult[]> => {
  // Coverr doesn't always require a key for public endpoints, but good to have if needed/auth changes.
  // Using a simplified fetch if no key, or just attempting.
  // Note: Coverr's public API structure might differ. Assuming standard listing for now or falling back.
  // If no official public API doc is free without auth, we might relying on their search endpoint if open,
  // but for this implementation we assume a standard GET with optional auth.

  // REALITY CHECK: Coverr's API usually requires an API key.
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `${COVERR_API_URL}?query=${encodeURIComponent(
        query
      )}&page=${page}&urls=true`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) return [];
    // Coverr Response Type
    const data = await response.json();
    return (data.hits || []).map(
      (
        v: {
          id: string;
          thumbnail: string;
          duration: number;
          url: string;
          urls: { mp4: string; mp4_download: string };
        },
        index: number
      ) => ({
        id: `COVERR-${v.id}-${index}`,
        source: "COVERR",
        image: v.thumbnail || "",
        duration: v.duration || 15,
        url: v.url,
        videoSrc: v.urls?.mp4 || v.urls?.mp4_download || "",
      })
    );
  } catch (error) {
    console.warn("Coverr Error:", error);
    return [];
  }
};

const FREESOUND_API_URL = "https://freesound.org/apiv2/search/text/";

// Returns detailed sound info
export const searchFreesound = async (
  query: string,
  apiKey: string,
  page: number = 1
): Promise<import("../types").AudioResult[]> => {
  if (!apiKey) return [];

  try {
    const fields = "id,name,previews,images,duration,username,download";
    const response = await fetch(
      `${FREESOUND_API_URL}?query=${encodeURIComponent(
        query
      )}&fields=${fields}&page=${page}&token=${apiKey}`
    );

    if (!response.ok) return [];
    const data = (await response.json()) as {
      results: {
        id: number;
        name: string;
        username: string;
        previews: { "preview-hq-mp3": string; "preview-lq-mp3": string };
        download: string;
        duration: number;
      }[];
    };

    // Freesound Response Type
    return (data.results || []).map((s) => ({
      id: `FREESOUND-${s.id}`,
      source: "FREESOUND",
      name: s.name,
      artist: s.username,
      previewUrl: s.previews["preview-hq-mp3"] || s.previews["preview-lq-mp3"],
      downloadUrl: s.download,
      duration: s.duration,
    }));
  } catch (error) {
    console.warn("Freesound Error:", error);
    return [];
  }
};

export const searchVideos = async (
  baseQuery: string,
  vibe: Vibe,
  orientation: Orientation,
  apiKeys: { pexels: string; pixabay: string; coverr?: string },
  page: number = 1,
  colorGrade: ColorGrade = "none"
): Promise<VideoResult[]> => {
  const vibeSuffix = VIBE_KEYWORDS[vibe];
  const colorSuffix = COLOR_KEYWORDS[colorGrade];

  // Combine query with vibe and color
  const finalQuery = [baseQuery, vibeSuffix, colorSuffix]
    .filter(Boolean)
    .join(" ");

  const [pexelsResults, pixabayResults, coverrResults] = await Promise.all([
    searchPexels(finalQuery, apiKeys.pexels, orientation, page),
    searchPixabay(finalQuery, apiKeys.pixabay, orientation, page),
    searchCoverr(finalQuery, apiKeys.coverr, page),
  ]);

  // Interleave results: Pexels, Pixabay, Coverr...
  const combined: VideoResult[] = [];
  const maxLength = Math.max(
    pexelsResults.length,
    pixabayResults.length,
    coverrResults.length
  );

  for (let i = 0; i < maxLength; i++) {
    if (pexelsResults[i]) combined.push(pexelsResults[i]);
    if (pixabayResults[i]) combined.push(pixabayResults[i]);
    if (coverrResults[i]) combined.push(coverrResults[i]);
  }
  return combined;
};
