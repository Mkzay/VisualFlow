import React, { useState, useEffect } from "react";
import { FaTerminal, FaToggleOn, FaToggleOff } from "react-icons/fa";
import type { ApiKeys, EnabledSources } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  enabledSources: EnabledSources;
  onToggleSource: (source: keyof EnabledSources, enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSave,
  enabledSources,
  onToggleSource,
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

  const Toggle = ({
    source,
    label,
    required = false,
  }: {
    source: keyof EnabledSources;
    label: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="flex items-center justify-between mb-1">
      <label className="block text-[10px] font-bold text-neutral-500 font-mono uppercase">
        {label} {required && <span className="text-vf-lime">*</span>}
      </label>
      <button
        onClick={() => onToggleSource(source, !enabledSources[source])}
        className={`text-lg transition-colors ${
          enabledSources[source] ? "text-vf-lime" : "text-neutral-700"
        }`}
        title={enabledSources[source] ? "Disable Source" : "Enable Source"}
      >
        {enabledSources[source] ? <FaToggleOn /> : <FaToggleOff />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 animate-fade-in">
      <div className="tech-panel p-5 w-full max-w-md shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-vf-lime"></div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-white">
          <FaTerminal className="text-vf-lime text-xs" /> System Config
        </h2>

        <div className="space-y-3">
          {/* Pexels */}
          <div>
            <Toggle source="pexels" label="Pexels API Key" required />
            <input
              type="password"
              name="pexels"
              value={keys.pexels}
              onChange={handleChange}
              disabled={!enabledSources.pexels}
              className={`w-full tech-input text-xs py-2 ${
                !enabledSources.pexels && "opacity-50 cursor-not-allowed"
              }`}
              placeholder="ENTER_PEXELS_KEY"
            />
          </div>

          {/* Gemini (No toggle requested) */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 font-mono uppercase mb-1">
              Gemini API Key{" "}
              <span className="text-vf-ai">✨ (For AI Features)</span>
            </label>
            <input
              type="password"
              name="gemini"
              value={keys.gemini}
              onChange={handleChange}
              className="w-full tech-input text-xs py-2 text-vf-ai! border-vf-border! focus:border-vf-ai!"
              placeholder="ENTER_GEMINI_KEY"
            />
          </div>

          <div className="pt-2 border-t border-neutral-800">
            {/* Pixabay */}
            <Toggle
              source="pixabay"
              label={
                <>
                  Pixabay API Key{" "}
                  <span className="text-[9px] text-neutral-600">
                    (RECOMMENDED)
                  </span>
                </>
              }
            />
            <input
              type="password"
              name="pixabay"
              value={keys.pixabay}
              onChange={handleChange}
              disabled={!enabledSources.pixabay}
              className={`w-full tech-input text-xs py-2 text-vf-cyan! border-vf-border! focus:border-vf-cyan! ${
                !enabledSources.pixabay && "opacity-50 cursor-not-allowed"
              }`}
              placeholder="Enter Pixabay API Key"
            />
          </div>

          {/* Coverr */}
          <div>
            <Toggle source="coverr" label="COVERR API KEY (Optional)" />
            <input
              type="password"
              value={keys.coverr || ""}
              onChange={(e) => setKeys({ ...keys, coverr: e.target.value })}
              disabled={!enabledSources.coverr}
              className={`w-full bg-neutral-800 border-none rounded p-2 text-xs focus:ring-1 focus:ring-vf-purple text-vf-purple! ${
                !enabledSources.coverr && "opacity-50 cursor-not-allowed"
              }`}
              placeholder="Enter Coverr API Key"
            />
          </div>

          {/* Freesound */}
          <div>
            <Toggle source="freesound" label="FREESOUND API KEY" />
            <input
              type="password"
              value={keys.freesound || ""}
              onChange={(e) => setKeys({ ...keys, freesound: e.target.value })}
              disabled={!enabledSources.freesound}
              className={`w-full bg-neutral-800 border-none rounded p-2 text-xs focus:ring-1 focus:ring-vf-warn text-vf-warn! ${
                !enabledSources.freesound && "opacity-50 cursor-not-allowed"
              }`}
              placeholder="Enter Freesound API Key"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white text-[10px] font-mono uppercase transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="btn-primary text-xs py-2 px-4"
            >
              Save Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
