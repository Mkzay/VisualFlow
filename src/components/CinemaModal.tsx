import React, { useRef, useEffect } from "react";
import {
  FaTimes,
  FaVolumeUp,
  FaMusic,
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
} from "react-icons/fa";
import type { VideoResult, Scene, AudioResult } from "../types";

interface CinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScene: Scene | null;
  currentVideo: VideoResult | undefined;
  currentAudio: AudioResult | undefined;
  progress: number;
  currentIndex: number;
  totalCount: number;
  useTTS: boolean;
  onToggleTTS: () => void;
  isSpeaking: boolean;
  // NEW: Playback controls
  isPaused: boolean;
  onTogglePause: () => void;
  onNext: () => void;
  onPrevious: () => void;
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
  isPaused,
  onTogglePause,
  onNext,
  onPrevious,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync video source and pause state
  useEffect(() => {
    if (isOpen && currentVideo && videoRef.current) {
      videoRef.current.src = currentVideo.videoSrc;
      if (!isPaused) {
        videoRef.current
          .play()
          .catch((e) => console.log("Video auto-play blocked", e));
      }
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  }, [currentVideo, isOpen, isPaused]);

  // Pause/resume video when isPaused changes
  useEffect(() => {
    if (videoRef.current && isOpen) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    if (audioRef.current && isOpen) {
      if (isPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, isOpen]);

  // Sync audio source
  useEffect(() => {
    if (isOpen && currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio.previewUrl;
      if (!isPaused) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio auto-play blocked", e));
      }
    } else if ((!isOpen || !currentAudio) && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [currentAudio, isOpen, isPaused]);

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
              loop
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

          {/* Paused Indicator */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
              <FaPause className="text-6xl text-white/70" />
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-vf-lime text-xs font-mono animate-pulse border border-vf-lime/30 flex items-center gap-2">
              <FaVolumeUp /> SPEAKING...
            </div>
          )}
        </div>

        {/* Playback Controls + Info Combined */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {/* Prev */}
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 text-white hover:text-vf-lime disabled:text-neutral-700 transition-colors px-2 py-1.5 text-[10px] font-mono uppercase"
            title="Previous Clip"
          >
            <FaStepBackward className="text-sm" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 bg-vf-lime text-black hover:bg-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] text-xs font-mono font-bold uppercase"
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? (
              <>
                <FaPlay className="text-sm" />
                <span>Play</span>
              </>
            ) : (
              <>
                <FaPause className="text-sm" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            className="flex items-center gap-1 text-white hover:text-vf-lime disabled:text-neutral-700 transition-colors px-2 py-1.5 text-[10px] font-mono uppercase"
            title="Next Clip"
          >
            <span className="hidden sm:inline">Next</span>
            <FaStepForward className="text-sm" />
          </button>

          <span className="text-neutral-700 mx-1">|</span>

          {/* Clip Counter */}
          <span className="text-neutral-400 font-mono text-[10px]">
            Clip {currentIndex + 1}/{totalCount}
          </span>

          <span className="text-neutral-700 mx-1 hidden sm:inline">|</span>

          {/* TTS Toggle */}
          <label
            htmlFor="tts-toggle-modal"
            className="flex items-center gap-1.5 cursor-pointer text-neutral-500 hover:text-white transition-colors text-[10px] font-mono"
            title="Enable AI Voice Narrator to read scene text aloud"
          >
            <input
              type="checkbox"
              id="tts-toggle-modal"
              checked={useTTS}
              onChange={onToggleTTS}
              className="accent-vf-lime cursor-pointer w-3 h-3"
            />
            <span>Voice Narration</span>
          </label>

          <span className="text-neutral-700 mx-1 hidden sm:inline">|</span>

          {/* Source */}
          <span className="text-vf-lime text-[10px] font-mono">
            {isAudioScene ? "FREESOUND" : currentVideo?.source || "..."}
          </span>
        </div>
      </div>
    </div>
  );
};
