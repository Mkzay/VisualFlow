import React, { useState } from "react";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa";
import type { AudioResult } from "../types";

interface AudioCardProps {
  audio: AudioResult;
  isSelected: boolean;
  onSelect: () => void;
}

export const AudioCard: React.FC<AudioCardProps> = ({
  audio,
  isSelected,
  onSelect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioEl) {
      const newAudio = new Audio(audio.previewUrl);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setAudioEl(newAudio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioEl.pause();
        setIsPlaying(false);
      } else {
        audioEl.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`relative group bg-neutral-900 rounded-lg overflow-hidden border-2 cursor-pointer transition-all h-24 flex items-center px-4 gap-4 ${
        isSelected
          ? "border-vf-lime shadow-[0_0_15px_rgba(204,255,0,0.3)]"
          : "border-transparent hover:border-neutral-600"
      }`}
    >
      {/* Icon / Play Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-vf-lime hover:text-black transition-colors shrink-0"
      >
        {isPlaying ? (
          <FaPause className="text-xs" />
        ) : (
          <FaPlay className="text-xs ml-0.5" />
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 grow">
        <h4 className="text-sm font-bold text-white truncate group-hover:text-vf-cyan transition-colors">
          {audio.name}
        </h4>
        <p className="text-xs text-neutral-500 truncate font-mono">
          by {audio.artist} • {audio.duration.toFixed(1)}s
        </p>
      </div>

      {/* Type Badge */}
      <div className="absolute top-2 right-2 text-[8px] font-mono text-neutral-600 uppercase tracking-wider">
        SFX
      </div>

      {/* Download Link (optional) */}
      <a
        href={audio.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-neutral-600 hover:text-white transition-colors"
        title="View on Freesound"
      >
        <FaDownload className="text-xs" />
      </a>
    </div>
  );
};
