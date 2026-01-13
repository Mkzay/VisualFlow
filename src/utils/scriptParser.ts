import type { Scene } from "../types";

export const parseScript = (scriptText: string): Scene[] => {
  const lines = scriptText.split("\n");
  const scenes: Scene[] = [];
  let idCounter = 0;

  lines.forEach((line) => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // Skip metadata/narrator tags that aren't content
    if (cleanLine.match(/^(Narrator:|Speaker:|\[Sound:|\(.*\)$)/i)) {
      // Check if it's strictly a Sound cue formatted as Narrator line?
      if (cleanLine.match(/^\[Sound:/i) || cleanLine.match(/^\(Sound:/i)) {
        const content = cleanLine
          .replace(/^\[Sound:\s*/i, "")
          .replace(/\]$/, "")
          .replace(/^\(Sound:\s*/i, "")
          .replace(/\)$/, "");
        scenes.push({
          id: idCounter++,
          originalLine: content,
          type: "AUDIO",
          query: "",
          isAiGenerated: false,
          options: [],
          cutDuration: 0,
          page: 1,
        });
      }
      return;
    }

    // Skip short lines
    if (cleanLine.length < 3) return;

    // Check for [Visuals: ...]
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
        query: "", // To be filled by API/Extraction later
        isAiGenerated: false,
        options: [],
        cutDuration: 4, // Default
        page: 1,
      });
    }
  });

  return scenes;
};
