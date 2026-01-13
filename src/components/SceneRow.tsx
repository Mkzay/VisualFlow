import React from "react";
import { FaMagic, FaClock, FaPlusCircle, FaSpinner } from "react-icons/fa";
import type { Scene, Orientation, VideoResult } from "../types";
import { VideoCard } from "./VideoCard";

interface SceneRowProps {
  scene: Scene;
  index: number;
  orientation: Orientation;
  onSelectVideo: (sceneId: number, video: VideoResult) => void;
  onLoadMore: (sceneId: number) => void;
  onDurationChange: (sceneId: number, duration: number) => void;
  isLoadingMore: boolean;
}

export const SceneRow: React.FC<SceneRowProps> = ({
  scene,
  index,
  orientation,
  onSelectVideo,
  onLoadMore,
  onDurationChange,
  isLoadingMore,
}) => {
  const indexDisplay = index + 1 < 10 ? `0${index + 1}` : index + 1;
  const queryBoxClass = scene.isAiGenerated
    ? "border-vf-ai text-vf-ai animate-pulse-purple"
    : "border-neutral-800 text-neutral-600";
  const typeColor = scene.type === "VISUAL" ? "text-vf-lime" : "text-blue-400";
  const typeLabel =
    scene.type === "VISUAL" ? "VISUAL_INSTRUCTION" : "DIALOGUE_SCENE";

  // If it's an audio cue, render differently
  if (scene.type === "AUDIO") {
    return (
      <div className="border-l-4 border-l-vf-warn p-3 mx-0 sm:mx-4 rounded-r flex items-center gap-3 animate-fade-in opacity-80 bg-neutral-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
            AUDIO CUE
          </span>
          <span className="text-xs sm:text-sm text-neutral-300 italic">
            "{scene.originalLine}"
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative pl-0 sm:pl-4 border-l-0 sm:border-l border-vf-border">
      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-neutral-500 font-mono tracking-widest">
                SEQ_{indexDisplay}
              </span>
              <span
                className={`text-[9px] font-bold ${typeColor} font-mono border border-neutral-800 px-1`}
              >
                {typeLabel}
              </span>
            </div>
            <p className="text-white text-md font-medium tracking-wide leading-tight">
              "{scene.originalLine}"
            </p>
          </div>

          {/* Metadata & Controls */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div
              className={`text-[10px] font-mono whitespace-nowrap sm:ml-4 border px-3 py-1 transition-all flex items-center gap-2 ${queryBoxClass}`}
            >
              {scene.isAiGenerated && <FaMagic />}
              QUERY: {scene.query.toUpperCase()}
            </div>

            {/* Duration Slider */}
            <div
              className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded w-32"
              title="Set clip duration for preview"
            >
              <FaClock className="text-xs text-neutral-500" />
              <input
                type="range"
                min="1"
                max="10"
                value={scene.cutDuration}
                step="0.5"
                className="w-full accent-vf-lime h-1 bg-neutral-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-vf-lime [&::-webkit-slider-thumb]:rounded-full"
                onChange={(e) =>
                  onDurationChange(scene.id, parseFloat(e.target.value))
                }
              />
              <span className="text-[10px] font-mono w-6 text-right text-vf-lime">
                {scene.cutDuration}s
              </span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-1">
          {scene.options.length > 0 ? (
            scene.options.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isSelected={scene.selectedVideo?.id === video.id}
                onSelect={() => onSelectVideo(scene.id, video)}
                orientation={orientation}
              />
            ))
          ) : (
            // Loaders or Empty State
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-[#111] animate-pulse w-full border border-neutral-900 flex items-center justify-center"
                >
                  <span className="text-[10px] text-neutral-700 font-mono">
                    LOADING...
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() => onLoadMore(scene.id)}
            className="text-xs text-neutral-500 hover:text-white font-mono uppercase tracking-wider transition-colors flex items-center gap-2 py-2 px-4 rounded border border-transparent hover:border-neutral-800"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPlusCircle />
            )}
            {isLoadingMore ? "Loading..." : "Load More Results"}
          </button>
        </div>
      </div>
    </div>
  );
};
