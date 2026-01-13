import React from "react";
import type { Scene, VideoResult, Orientation, AudioResult } from "../types";
import { VideoCard } from "./VideoCard";
import { AudioCard } from "./AudioCard";
import { FaCircleNotch } from "react-icons/fa";

interface ResultsGridProps {
  scenes: Scene[];
  orientation: Orientation;
  onSelectVideo: (sceneId: number, video: VideoResult) => void;
  onSelectAudio?: (sceneId: number, audio: AudioResult) => void;
  onLoadMore: (sceneId: number, query: string, currentPage: number) => void;
  onDurationChange: (sceneId: number, duration: number) => void;
  loadingState: Record<number, boolean>;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  scenes,
  orientation,
  onSelectVideo,
  onSelectAudio,
  onLoadMore,
  onDurationChange,
  loadingState,
}) => {
  if (scenes.length === 0) {
    return (
      <div className="text-center py-12 sm:py-24 border border-dashed border-vf-border bg-vf-panel">
        <FaCircleNotch className="text-neutral-800 text-5xl sm:text-6xl mb-6 mx-auto" />
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
          System Idle
        </p>
        <p className="text-neutral-600 text-[10px] mt-2 font-mono">
          Waiting for input stream...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      {scenes.map((scene) => (
        <div key={scene.id} className="flex flex-col gap-4 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-1 border-l-2 border-vf-lime pl-4">
            <h3 className="text-white text-lg font-medium leading-tight">
              {scene.originalLine}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-neutral-900 px-1.5 py-0.5 rounded">
                {scene.type}
              </span>
              <span className="text-xs font-mono text-vf-cyan">
                query: "{scene.query}"
              </span>
              {scene.isAiGenerated && (
                <span className="text-[10px] font-mono text-purple-400 border border-purple-500/30 px-1.5 rounded">
                  AI_DIRECTOR
                </span>
              )}
            </div>
          </div>

          {/* Audio Grid */}
          {scene.type === "AUDIO" && scene.audioOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scene.audioOptions.map((audio) => (
                <AudioCard
                  key={audio.id}
                  audio={audio}
                  isSelected={scene.selectedAudio?.id === audio.id}
                  onSelect={() =>
                    onSelectAudio && onSelectAudio(scene.id, audio)
                  }
                />
              ))}
            </div>
          )}

          {/* Video Grid */}
          {scene.type !== "AUDIO" && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-vf-lime scrollbar-track-neutral-900">
              {scene.options.length > 0 ? (
                <>
                  {scene.options.map((video) => (
                    <div key={video.id} className="shrink-0 w-[280px]">
                      <VideoCard
                        video={video}
                        isSelected={scene.selectedVideo?.id === video.id}
                        onSelect={() => onSelectVideo(scene.id, video)}
                        orientation={orientation}
                      />
                    </div>
                  ))}

                  {/* Load More Button */}
                  <div className="shrink-0 w-[100px] flex items-center justify-center">
                    <button
                      onClick={() =>
                        onLoadMore(scene.id, scene.query, scene.page)
                      }
                      disabled={loadingState[scene.id]}
                      className="text-xs font-mono text-neutral-500 hover:text-white border border-dashed border-neutral-700 hover:border-white rounded-lg w-full h-[158px] flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loadingState[scene.id] ? (
                        <span className="animate-spin text-lg">⟳</span>
                      ) : (
                        <>
                          <span className="text-xl">+</span>
                          LOAD MORE
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full py-8 text-center text-neutral-600 font-mono text-sm border-2 border-dashed border-neutral-800 rounded-xl">
                  NO_SIGNAL_FOUND
                </div>
              )}
            </div>
          )}

          {/* Duration Slider (Only for visual scenes for now, audio uses native duration) */}
          {scene.type !== "AUDIO" && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                <span>Duration</span>
                <span className="text-white">{scene.cutDuration}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={scene.cutDuration}
                onChange={(e) =>
                  onDurationChange(scene.id, parseFloat(e.target.value))
                }
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-vf-lime"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
