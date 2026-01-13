import React from "react";
import { FaPlay, FaFileExport, FaCog } from "react-icons/fa";

interface NavbarProps {
  onOpenSettings: () => void;
  onExport: () => void;
  onPlay: () => void;
  hasSelections: boolean;
  isExporting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onExport,
  onPlay,
  hasSelections,
  isExporting = false,
}) => {
  return (
    <nav className="border-b border-vf-border bg-black/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 sm:gap-3"
            title="VisualFlow Engine v3.1"
          >
            <div className="w-8 h-8 bg-vf-lime flex items-center justify-center font-bold text-black text-xs font-mono shrink-0">
              VF
            </div>
            <span className="font-bold text-md sm:text-lg tracking-wider uppercase text-white truncate">
              Visual<span className="text-vf-lime">Flow</span>{" "}
              <span className="hidden sm:inline text-xs text-neutral-600 ml-2 font-mono">
                v3.1
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {hasSelections && (
              <>
                <button
                  onClick={onPlay}
                  className="bg-vf-lime hover:bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded text-[10px] sm:text-xs font-mono uppercase font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.4)] animate-fade-in"
                >
                  <FaPlay />{" "}
                  <span className="hidden sm:inline">Preview Sequence</span>
                </button>
                <button
                  onClick={onExport}
                  disabled={isExporting}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-[10px] sm:text-xs font-mono uppercase border border-neutral-700 transition-all flex items-center gap-2 animate-fade-in disabled:opacity-50"
                >
                  <FaFileExport />{" "}
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            )}
            <button
              onClick={onOpenSettings}
              className="text-neutral-500 hover:text-vf-lime transition-colors font-mono text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <FaCog /> <span className="hidden sm:inline">Config</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
