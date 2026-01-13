import type { VideoResult, Orientation, Vibe } from "../types";

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
  apiKey: string
): Promise<string | null> => {
  if (!apiKey) return null;

  const prompt = `You are an expert stock footage researcher. Your task is to convert a line from a video script into a single, highly visual search query.
    Input Line: "${scriptLine}"
    Rules: Output ONLY the search query. No quotes. Keep it 2-4 words max. Focus on visual nouns/adjectives.`;

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

    return data.videos.map((v: any, index: number) => ({
      id: `PEXELS-${v.id}-${index}`,
      source: "PEXELS",
      image: v.image,
      duration: v.duration,
      url: v.url,
      videoSrc: (
        v.video_files.find((f: any) => f.height >= 720) || v.video_files[0]
      ).link,
    }));
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

    return data.hits.map((v: any, index: number) => ({
      id: `PIXABAY-${v.id}-${index}`,
      source: "PIXABAY",
      image: `https://i.vimeocdn.com/video/${v.picture_id}_640x360.jpg`,
      duration: v.duration,
      url: v.pageURL,
      videoSrc: v.videos.large.url || v.videos.medium.url,
    }));
  } catch (error) {
    console.warn("Pixabay Error:", error);
    return [];
  }
};

export const searchVideos = async (
  baseQuery: string,
  vibe: Vibe,
  orientation: Orientation,
  apiKeys: { pexels: string; pixabay: string },
  page: number = 1
): Promise<VideoResult[]> => {
  const vibeSuffix = VIBE_KEYWORDS[vibe];
  const finalQuery = vibeSuffix ? `${baseQuery} ${vibeSuffix}` : baseQuery;

  const [pexelsResults, pixabayResults] = await Promise.all([
    searchPexels(finalQuery, apiKeys.pexels, orientation, page),
    searchPixabay(finalQuery, apiKeys.pixabay, orientation, page),
  ]);

  // Interleave results: Pexels, Pixabay, Pexels, Pixabay...
  const combined: VideoResult[] = [];
  const maxLength = Math.max(pexelsResults.length, pixabayResults.length);
  for (let i = 0; i < maxLength; i++) {
    if (pexelsResults[i]) combined.push(pexelsResults[i]);
    if (pixabayResults[i]) combined.push(pixabayResults[i]);
  }
  return combined;
};
