import React, { useRef, useEffect } from "react";
import { FaTimes, FaVolumeUp, FaMusic } from "react-icons/fa";
import type { VideoResult, Scene, AudioResult } from "../types";

interface CinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScene: Scene | null;
  currentVideo: VideoResult | undefined;
  currentAudio: AudioResult | undefined; // NEW
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
  currentAudio,
  progress,
  currentIndex,
  totalCount,
  useTTS,
  onToggleTTS,
  isSpeaking,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync video source
  useEffect(() => {
    if (isOpen && currentVideo && videoRef.current) {
      videoRef.current.src = currentVideo.videoSrc;
      videoRef.current
        .play()
        .catch((e) => console.log("Video auto-play blocked", e));
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  }, [currentVideo, isOpen]);

  // Sync audio source
  useEffect(() => {
    if (isOpen && currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio.previewUrl;
      audioRef.current
        .play()
        .catch((e) => console.log("Audio auto-play blocked", e));
    } else if ((!isOpen || !currentAudio) && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [currentAudio, isOpen]);

  if (!isOpen) return null;

  const isAudioScene = currentScene?.type === "AUDIO";

  return (
    <div className="fixed inset-0 bg-black/95 z-70 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
      {/* Hidden Audio Player */}
      <audio ref={audioRef} />

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
        {/* Preview Frame */}
        <div className="relative w-full aspect-video bg-black border border-neutral-800 shadow-2xl overflow-hidden rounded-lg flex items-center justify-center">
          {/* Visual Content */}
          {!isAudioScene && currentVideo ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted // Mute video loops if we have TTS or it's B-roll? Usually B-roll is silent or we want ambient. Let's keep existing logic (unmuted often if no prop)
              // Actually, previous implementation didn't specify muted.
            />
          ) : (
            // Audio Scene Placeholder
            <div className="flex flex-col items-center justify-center opacity-50 animate-pulse">
              <FaMusic className="text-6xl text-vf-cyan mb-4" />
              <span className="font-mono text-vf-cyan uppercase tracking-widest text-sm">
                Audio Cue
              </span>
            </div>
          )}

          {/* Subtitles (Scene Text) */}
          <div className="absolute bottom-8 left-0 right-0 text-center px-4 pointer-events-none">
            <span className="text-white text-sm sm:text-xl font-bold font-mono px-4 py-2 rounded-lg inline-block bg-black/60 backdrop-blur-sm shadow-sm">
              {currentScene ? currentScene.originalLine : "Loading Sequence..."}
            </span>
            {currentAudio && (
              <div className="mt-2 text-xs font-mono text-vf-lime bg-black/60 inline-block px-2 py-1 rounded">
                ♪ {currentAudio.name}
              </div>
            )}
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
            SOURCE: {isAudioScene ? "FREESOUND" : currentVideo?.source || "..."}
          </span>
        </div>
      </div>
    </div>
  );
};
