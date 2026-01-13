import React from "react";
import { FaFileExport, FaPalette } from "react-icons/fa";
import type { Orientation, Vibe, ColorGrade } from "../types";

interface ControlBarProps {
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;
  vibe: Vibe;
  onVibeChange: (v: Vibe) => void;
  colorGrade: ColorGrade;
  onColorGradeChange: (c: ColorGrade) => void;
  onClear: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  orientation,
  onOrientationChange,
  vibe,
  onVibeChange,
  colorGrade,
  onColorGradeChange,
  onClear,
  onExport,
  isExporting,
}) => {
  const colorOptions: { value: ColorGrade; label: string; color: string }[] = [
    { value: "none", label: "Nat", color: "#666" },
    { value: "warm", label: "Warm", color: "#f59e0b" },
    { value: "cool", label: "Cool", color: "#06b6d4" },
    { value: "pastel", label: "Pastel", color: "#f472b6" },
    { value: "neon", label: "Neon", color: "#d946ef" },
    { value: "bw", label: "B&W", color: "#000" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6 border-b border-vf-border pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
          <span className="text-vf-lime mr-2">///</span> Timeline
        </h2>

        <div className="flex items-center gap-4">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-vf-cyan px-3 py-1.5 rounded transition-all disabled:opacity-50"
            title="Download Project Files for Premiere Pro"
          >
            <FaFileExport /> {isExporting ? "BUNDLING..." : "EXPORT XML"}
          </button>

          <button
            onClick={onClear}
            className="text-[10px] font-mono text-neutral-500 hover:text-red-500 uppercase tracking-wider transition-colors"
            title="Wipe all results and reset"
          >
            [CLEAR_BUFFER]
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Format Toggle */}
        <div className="flex rounded border border-vf-border bg-vf-panel overflow-hidden h-8">
          <button
            onClick={() => onOrientationChange("landscape")}
            className={`px-3 flex items-center text-[10px] font-mono uppercase border-r border-neutral-700 transition-colors ${
              orientation === "landscape"
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-vf-lime"
            }`}
            title="Standard YouTube Format"
          >
            16:9
          </button>
          <button
            onClick={() => onOrientationChange("portrait")}
            className={`px-3 flex items-center text-[10px] font-mono uppercase transition-colors ${
              orientation === "portrait"
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-vf-lime"
            }`}
            title="Shorts / Reels / TikTok Format"
          >
            9:16
          </button>
        </div>

        <div className="h-6 w-px bg-neutral-800"></div>

        {/* Color Grade Selector */}
        <div className="flex items-center gap-2 bg-vf-panel border border-vf-border rounded px-2 h-8">
          <FaPalette className="text-neutral-500 text-xs" />
          {colorOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onColorGradeChange(opt.value)}
              className={`w-4 h-4 rounded-full border border-neutral-700 transition-transform hover:scale-110 ${
                colorGrade === opt.value
                  ? "ring-2 ring-white scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{ backgroundColor: opt.color }}
              title={`Color Grade: ${opt.label}`}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-neutral-800"></div>

        {/* Vibe Selector */}
        <div className="flex flex-wrap gap-2">
          {(
            ["none", "dark", "cyberpunk", "cinematic", "corporate"] as Vibe[]
          ).map((v) => (
            <button
              key={v}
              onClick={() => onVibeChange(v)}
              className={`vibe-chip ${v === vibe ? "active" : ""}`}
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
