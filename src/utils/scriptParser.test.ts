import { parseScript } from "./scriptParser";
import { describe, it, expect } from "vitest";

describe("scriptParser", () => {
  it("parses dialogue lines correctly", () => {
    const input = "What if I told you...";
    const result = parseScript(input);
    expect(result).toHaveLength(1);
    expect(result[0].originalLine).toBe("What if I told you...");
    expect(result[0].type).toBe("DIALOGUE");
  });

  it("parses visual instructions correctly", () => {
    const input = "[Visuals: Glitch effect over city]";
    const result = parseScript(input);
    expect(result).toHaveLength(1);
    expect(result[0].originalLine).toBe("Glitch effect over city");
    expect(result[0].type).toBe("VISUAL");
  });

  it("parses audio cues correctly", () => {
    const input = "[Sound: Sirens in distance]";
    const result = parseScript(input);
    expect(result).toHaveLength(1);
    expect(result[0].originalLine).toBe("Sirens in distance");
    expect(result[0].type).toBe("AUDIO");
  });

  it("ignores timestamps", () => {
    const input = "(0:00) The beginning";
    const result = parseScript(input);
    expect(result[0].originalLine).toBe("The beginning");
  });

  it("ignores Narrator prefixes", () => {
    const input = "Narrator: Hello world";
    // based on logic, this entire line is skipped because it starts with Narrator:
    const result = parseScript(input);
    expect(result).toHaveLength(0);
  });

  it("parses complex mixed script", () => {
    const input = `(0:00) THE HOOK [Visuals: Fast montage]
Narrator: What if I told you...
[Visuals: Glitch effect over city]
[Sound: Boom effect]`;
    const result = parseScript(input);

    // Line 1: "(0:00) THE HOOK [Visuals: Fast montage]" -> Visual match "[Visuals: Fast montage]" -> "Fast montage" (VISUAL)
    // Line 2: "Narrator: ..." -> Skipped
    // Line 3: "[Visuals: Glitch effect over city]" -> "Glitch effect over city" (VISUAL)
    // Line 4: "[Sound: Boom effect]" -> "Boom effect" (AUDIO)

    expect(result).toHaveLength(3);
    expect(result[0].type).toBe("VISUAL");
    expect(result[0].originalLine).toBe("Fast montage");

    expect(result[1].type).toBe("VISUAL");
    expect(result[1].originalLine).toBe("Glitch effect over city");

    expect(result[2].type).toBe("AUDIO");
    expect(result[2].originalLine).toBe("Boom effect");
  });
});
