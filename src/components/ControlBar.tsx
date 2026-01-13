import React from "react";
import type { Orientation, Vibe } from "../types";

interface ControlBarProps {
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;
  vibe: Vibe;
  onVibeChange: (v: Vibe) => void;
  onClear: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  orientation,
  onOrientationChange,
  vibe,
  onVibeChange,
  onClear,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 border-b border-vf-border pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
          <span className="text-vf-lime mr-2">///</span> Timeline
        </h2>
        <button
          onClick={onClear}
          className="text-[10px] font-mono text-neutral-500 hover:text-red-500 uppercase tracking-wider transition-colors"
          title="Wipe all results and reset"
        >
          [CLEAR_BUFFER]
        </button>
      </div>

      {/* Global Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Format Toggle */}
        <div className="flex rounded border border-vf-border bg-[#0a0a0a] overflow-hidden">
          <button
            onClick={() => onOrientationChange("landscape")}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase border-r border-neutral-700 transition-colors ${
              orientation === "landscape"
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-vf-lime"
            }`}
            title="Standard YouTube Format"
          >
            16:9 Landscape
          </button>
          <button
            onClick={() => onOrientationChange("portrait")}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase transition-colors ${
              orientation === "portrait"
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-vf-lime"
            }`}
            title="Shorts / Reels / TikTok Format"
          >
            9:16 Shorts
          </button>
        </div>

        <div className="h-6 w-px bg-neutral-800 mx-1"></div>

        {/* Vibe Selector */}
        <div className="flex flex-wrap gap-2">
          {(
            ["none", "dark", "cyberpunk", "cinematic", "corporate"] as Vibe[]
          ).map((v) => (
            <button
              key={v}
              onClick={() => onVibeChange(v)}
              className={`vibe-chip ${vibe === v ? "active" : ""}`}
              data-tooltip={`Set aesthetic to ${v.toUpperCase()}`}
            >
              {v === "none" ? "Raw" : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
