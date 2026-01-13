import React, { memo } from "react";
import type { Scene, Orientation, VideoResult } from "../types";
import { SceneRow } from "./SceneRow";
import { FaCircleNotch } from "react-icons/fa";

interface ResultsGridProps {
  scenes: Scene[];
  orientation: Orientation;
  onSelectVideo: (sceneId: number, video: VideoResult) => void;
  onLoadMore: (sceneId: number, query: string, page: number) => void;
  onDurationChange: (sceneId: number, duration: number) => void;
  loadingState: { [key: number]: boolean }; // Track loading per scene if needed
}

export const ResultsGrid: React.FC<ResultsGridProps> = memo(
  ({
    scenes,
    orientation,
    onSelectVideo,
    onLoadMore,
    onDurationChange,
    loadingState,
  }) => {
    if (scenes.length === 0) {
      return (
        <div className="text-center py-12 sm:py-24 border border-dashed border-vf-border bg-[#0a0a0a]">
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
      <div className="space-y-8 pb-20">
        {scenes.map((scene, index) => (
          <SceneRow
            key={scene.id}
            scene={scene}
            index={index}
            orientation={orientation}
            onSelectVideo={onSelectVideo}
            onLoadMore={onLoadMore}
            onDurationChange={onDurationChange}
            isLoadingMore={loadingState[scene.id] || false}
          />
        ))}
      </div>
    );
  },
  (prev, next) => {
    // Custom comparison if needed, but default shallow compare should be fine IF props are stable.
    // scenes array changes reference on update.
    // This memo is useful mainly if OTHER props change but scenes don't.
    return (
      prev.scenes === next.scenes &&
      prev.orientation === next.orientation &&
      prev.loadingState === next.loadingState
    );
  }
);
