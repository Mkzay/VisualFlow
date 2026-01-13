import React, { useRef, useState, memo } from "react";
import { FaCheck, FaExternalLinkAlt } from "react-icons/fa";
import type { VideoResult, Orientation } from "../types";

interface VideoCardProps {
  video: VideoResult;
  isSelected: boolean;
  onSelect: () => void;
  orientation: Orientation;
}

export const VideoCard: React.FC<VideoCardProps> = memo(
  ({ video, isSelected, onSelect, orientation }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMouseEnter = () => {
      setIsPlaying(true);
      // Slight delay or immediate play? React state update will trigger render with <video> present.
      // The auto-play is handled by the video 'autoPlay' attribute once mounted/ref attached
      // OR we effect it.
      // Let's rely on autoPlay + conditional mount for simplicity and perf.
    };

    const handleMouseLeave = () => {
      setIsPlaying(false);
    };

    const handleExternalClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(video.url, "_blank");
    };

    const aspectClass =
      orientation === "portrait" ? "aspect-[9/16]" : "aspect-video";
    const badgeColor = video.source === "PEXELS" ? "bg-vf-lime" : "bg-vf-cyan";
    const badgeText = video.source === "PEXELS" ? "PXL" : "PXB";

    return (
      <div
        className={`group relative ${aspectClass} bg-black cursor-pointer overflow-hidden border transition-all duration-200 animate-fade-in ${
          isSelected
            ? "border-vf-lime! shadow-[0_0_20px_rgba(204,255,0,0.2)]"
            : "border-transparent hover:border-white"
        }`}
        onClick={onSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail Image */}
        <img
          src={video.image}
          alt="Thumbnail"
          className={`w-full h-full object-cover transition-all duration-300 ${
            // Keep opacity logic for smooth feel
            isPlaying
              ? "opacity-0"
              : "opacity-60 group-hover:opacity-100 group-hover:grayscale-0 grayscale"
          }`}
          loading="lazy"
        />

        {/* Preview Video - Mounted ONLY when playing to save memory/DOM weight */}
        {isPlaying && (
          <video
            ref={videoRef}
            src={video.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover absolute inset-0 z-10 block"
            onLoadedData={() => {
              // Optional: add class to fade in?
            }}
          />
        )}

        {/* Badge */}
        <div className="absolute top-1 left-1 z-20 flex gap-1">
          <span
            className={`${badgeColor} text-black text-[9px] font-mono px-1 font-bold`}
          >
            {badgeText}
          </span>
        </div>

        {/* Checkmark Overlay (Selected State) */}
        {isSelected && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 pointer-events-none fade-in">
            <FaCheck className="text-vf-lime text-4xl drop-shadow-lg" />
          </div>
        )}

        {/* Actions */}
        <div className="absolute bottom-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleExternalClick}
            className="bg-vf-lime text-black font-bold text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded shadow-[0_0_15px_rgba(204,255,0,0.6)] hover:bg-white hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 uppercase tracking-tighter"
            title="Download High Quality"
          >
            <FaExternalLinkAlt />{" "}
            <span className="hidden sm:inline">GET 4K</span>
            <span className="sm:hidden">4K</span>
          </button>
        </div>
      </div>
    );
  }
);
