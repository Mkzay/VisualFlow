import { extractKeywords } from "../services/api";
import type { Scene } from "../types";

export const parseScript = (scriptText: string): Scene[] => {
  const lines = scriptText.split("\n");
  const scenes: Scene[] = [];
  let idCounter = 0;

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // Check for [Sound: ...] tags
    const soundMatch = cleanLine.match(/^\[Sound:\s*(.*?)\]$/i);
    if (soundMatch) {
      scenes.push({
        id: idCounter++,
        originalLine: cleanLine,
        type: "AUDIO",
        query: extractKeywords(soundMatch[1]), // Use extracted keywords as query
        isAiGenerated: false,
        cutDuration: 4,
        options: [],
        page: 1,
      });
      continue;
    }

    // Skip short lines if not specific tags
    if (cleanLine.length < 3) continue;

    // Check for [Visuals: ...] tags
    const visualMatch = cleanLine.match(/\[Visuals:\s*(.*?)\]/i);

    let content = "";
    let type: "VISUAL" | "DIALOGUE" = "DIALOGUE";

    if (visualMatch) {
      content = visualMatch[1];
      type = "VISUAL";
    } else {
      // Remove timestamp like (0:00)
      content = cleanLine.replace(/^\(\d+:\d+\)\s*/, "");
    }

    if (content) {
      scenes.push({
        id: idCounter++,
        originalLine: content,
        type: type,
        query: extractKeywords(content), // Ensure query is populated
        isAiGenerated: false,
        options: [],
        cutDuration: 4,
        page: 1,
      });
    }
  }

  return scenes;
};
