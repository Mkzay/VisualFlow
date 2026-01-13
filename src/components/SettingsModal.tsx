import React, { useState, useEffect } from "react";
import { FaTerminal } from "react-icons/fa";
import type { ApiKeys } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSave,
}) => {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);

  // Sync local state when props change (e.g. initial load)
  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(keys);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="tech-panel p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-vf-lime"></div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wide text-white">
          <FaTerminal className="text-vf-lime text-sm" /> System Config
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-neutral-500 font-mono uppercase mb-2">
              Pexels API Key <span className="text-vf-lime">*</span>
            </label>
            <input
              type="password"
              name="pexels"
              value={keys.pexels}
              onChange={handleChange}
              className="w-full tech-input text-sm"
              placeholder="ENTER_PEXELS_KEY"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 font-mono uppercase mb-2">
              Gemini API Key{" "}
              <span className="text-vf-ai">✨ (For AI Features)</span>
            </label>
            <input
              type="password"
              name="gemini"
              value={keys.gemini}
              onChange={handleChange}
              className="w-full tech-input text-sm !text-vf-ai !border-vf-border focus:!border-vf-ai"
              placeholder="ENTER_GEMINI_KEY"
            />
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 font-mono uppercase mb-2 mt-4">
              Pixabay API Key{" "}
              <span className="text-[10px] text-neutral-600">
                (RECOMMENDED)
              </span>
            </label>
            <input
              type="password"
              name="pixabay"
              value={keys.pixabay}
              onChange={handleChange}
              className="w-full tech-input text-sm !text-vf-cyan !border-vf-border focus:!border-vf-cyan"
              placeholder="ENTER_PIXABAY_KEY"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              onClick={onClose}
              className="px-6 py-3 text-neutral-400 hover:text-white text-xs font-mono uppercase transition-colors"
            >
              Close
            </button>
            <button onClick={handleSave} className="btn-primary text-xs">
              Save Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
