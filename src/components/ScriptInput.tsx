import React from "react";
import { FaFileCode, FaMagic } from "react-icons/fa";

interface ScriptInputProps {
  script: string;
  onScriptChange: (value: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
  useAI: boolean;
  onToggleAI: () => void;
}

export const ScriptInput: React.FC<ScriptInputProps> = ({
  script,
  onScriptChange,
  onProcess,
  isProcessing,
  useAI,
  onToggleAI,
}) => {
  const lineCount = script
    .split("\n")
    .filter((line) => line.trim() !== "").length;
  const formattedLines = lineCount < 10 ? `0${lineCount}` : lineCount;

  return (
    <div className="tech-panel p-1 rounded-none w-full relative group shadow-2xl">
      {/* Tech Corners */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-vf-lime"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-vf-lime"></div>

      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-vf-border bg-black flex justify-between items-center">
        <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
          <FaFileCode className="mr-2 text-neutral-600" /> Source Script
        </h2>
        <span className="text-[10px] text-vf-lime font-mono bg-neutral-900 px-2 py-1">
          {formattedLines} LINES
        </span>
      </div>

      {/* Text Area */}
      <textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        className="flex-grow w-full bg-[#0a0a0a] border-none p-4 sm:p-5 text-neutral-300 focus:outline-none resize-none font-mono text-xs leading-relaxed tracking-wide min-h-[120px] placeholder-neutral-700"
        placeholder={`// Paste script...\n(0:00) THE HOOK [Visuals: Fast montage]\nNarrator: What if I told you...\n[Visuals: Glitch effect over city]`}
      />

      {/* Footer / Controls */}
      <div className="p-4 sm:p-5 border-t border-vf-border bg-black flex flex-wrap gap-4 items-center justify-between">
        {/* AI Toggle */}
        <div
          className="flex items-center gap-3 bg-[#111] p-2 border border-vf-border rounded"
          title="Use AI to understand context (Requires Gemini Key)"
        >
          <div className="flex items-center gap-2">
            <FaMagic
              className={`${
                useAI ? "text-vf-ai" : "text-neutral-500"
              } transition-colors duration-300`}
            />
            <span className="text-xs font-bold text-neutral-300 uppercase font-mono">
              Smart Vision AI
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={onToggleAI}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vf-ai"></div>
          </label>
        </div>

        {/* Process Button */}
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="btn-primary px-8 py-3 flex items-center justify-center gap-3 active:scale-95 transition-transform flex-grow sm:flex-grow-0 disabled:opacity-50 disabled:pointer-events-none min-w-[180px]"
          title="Analyze script and find footage"
        >
          {isProcessing ? (
            <div className="w-3 h-3 bg-black animate-blink mx-auto"></div>
          ) : (
            <span>INITIALIZE SEARCH</span>
          )}
        </button>
      </div>
    </div>
  );
};
