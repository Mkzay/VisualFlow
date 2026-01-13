import React, { useRef, useEffect } from "react";
import { FaTimes, FaVolumeUp } from "react-icons/fa";
import type { VideoResult, Scene } from "../types";

interface CinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScene: Scene | null;
  currentVideo: VideoResult | undefined;
  progress: number; // 0 to 100
  currentIndex: number;
  totalCount: number;
  useTTS: boolean;
  onToggleTTS: () => void;
  isSpeaking: boolean;
}

export const CinemaModal: React.FC<CinemaModalProps> = ({
  isOpen,
  onClose,
  currentScene,
  currentVideo,
  progress,
  currentIndex,
  totalCount,
  useTTS,
  onToggleTTS,
  isSpeaking,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video source when currentVideo changes
  useEffect(() => {
    if (isOpen && currentVideo && videoRef.current) {
      videoRef.current.src = currentVideo.videoSrc;
      videoRef.current
        .play()
        .catch((e) => console.log("Auto-play blocked or interrupted", e));
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  }, [currentVideo, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onClose}
          className="text-white hover:text-vf-lime text-2xl transition-colors"
          title="Exit Preview"
        >
          <FaTimes />
        </button>
      </div>

      <div className="w-full max-w-5xl px-4 relative flex flex-col items-center">
        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black border border-neutral-800 shadow-2xl overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            // We control playback via props/effects mostly, but controls are hidden
          />

          {/* Subtitles */}
          <div className="absolute bottom-8 left-0 right-0 text-center px-4 pointer-events-none">
            <span className="text-white text-sm sm:text-xl font-bold font-mono px-4 py-2 rounded-lg inline-block bg-black/60 backdrop-blur-sm shadow-sm">
              {currentScene ? currentScene.originalLine : "Loading Sequence..."}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
            <div
              className="h-full bg-vf-lime transition-all ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-vf-lime text-xs font-mono animate-pulse border border-vf-lime/30 flex items-center gap-2">
              <FaVolumeUp /> SPEAKING...
            </div>
          )}
        </div>

        {/* Controls / Info */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-neutral-400 font-mono text-xs w-full max-w-2xl">
          <span>
            CLIP {currentIndex + 1} / {totalCount}
          </span>
          <span className="text-neutral-600">|</span>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tts-toggle-modal"
              checked={useTTS}
              onChange={onToggleTTS}
              className="accent-vf-lime cursor-pointer"
            />
            <label
              htmlFor="tts-toggle-modal"
              className="cursor-pointer hover:text-white transition-colors"
              title="Enable AI Voice Narrator"
            >
              Voiceover On
            </label>
          </div>
          <span className="text-neutral-600">|</span>
          <span className="text-vf-lime">
            SOURCE: {currentVideo?.source || "..."}
          </span>
        </div>
      </div>
    </div>
  );
};
