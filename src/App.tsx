import { useState, useCallback, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SettingsModal } from "./components/SettingsModal";
import { ScriptInput } from "./components/ScriptInput";
import { ControlBar } from "./components/ControlBar";
import { ResultsGrid } from "./components/ResultsGrid";
import { CinemaModal } from "./components/CinemaModal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { parseScript } from "./utils/scriptParser";
import {
  searchVideos,
  fetchGeminiQuery,
  extractKeywords,
} from "./services/api";
import type { Scene, GlobalState, VideoResult } from "./types";

function App() {
  // Global State
  const [apiKeys, setApiKeys] = useLocalStorage("vf_api_keys", {
    pexels: import.meta.env.VITE_PEXELS_API_KEY || "",
    pixabay: import.meta.env.VITE_PIXABAY_API_KEY || "",
    gemini: import.meta.env.VITE_GEMINI_API_KEY || "",
  });
  const [globalOrientation, setGlobalOrientation] =
    useState<GlobalState["orientation"]>("landscape");
  const [globalVibe, setGlobalVibe] = useState<GlobalState["vibe"]>("none");

  // App Logic State
  const [script, setScript] = useLocalStorage("vf_script", "");
  const [parsedScenes, setParsedScenes] = useState<Scene[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingSceneIds, setLoadingSceneIds] = useState<{
    [key: number]: boolean;
  }>({});
  const [useAI, setUseAI] = useState(false);

  // Playback State
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackQueue, setPlaybackQueue] = useState<Scene[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useTTS, setUseTTS] = useState(true);

  // Load saved state (simulated)
  // Real app might want to persist selected videos in localStorage too

  const handleProcessScript = async () => {
    if (!script.trim()) return;
    setIsProcessing(true);
    setParsedScenes([]);

    const rawScenes = parseScript(script);

    // Process each scene
    const updatedScenes = await Promise.all(
      rawScenes.map(async (scene) => {
        // Skip audio cues for searching (but keep in list)
        if (scene.type === "AUDIO") return scene;

        let query = "";
        let isAiGenerated = false;

        if (useAI && apiKeys.gemini) {
          const aiQuery = await fetchGeminiQuery(
            scene.originalLine,
            apiKeys.gemini
          );
          if (aiQuery) {
            query = aiQuery;
            isAiGenerated = true; // Flag for UI glow
          } else {
            query = extractKeywords(scene.originalLine);
          }
        } else {
          query = extractKeywords(scene.originalLine);
        }

        const videos = await searchVideos(
          query,
          globalVibe,
          globalOrientation,
          apiKeys
        );

        return {
          ...scene,
          query,
          isAiGenerated,
          options: videos,
          selectedVideo: videos.length > 0 ? videos[0] : undefined,
        };
      })
    );

    setParsedScenes(updatedScenes);
    setIsProcessing(false);
  };

  const handleSelectVideo = (sceneId: number, video: VideoResult) => {
    setParsedScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, selectedVideo: video } : s))
    );
  };

  const handleLoadMore = async (sceneId: number) => {
    setLoadingSceneIds((prev) => ({ ...prev, [sceneId]: true }));
    const scene = parsedScenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const nextPage = scene.page + 1;
    const newVideos = await searchVideos(
      scene.query,
      globalVibe,
      globalOrientation,
      apiKeys,
      nextPage
    );

    setParsedScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              options: [...s.options, ...newVideos],
              page: nextPage,
            }
          : s
      )
    );
    setLoadingSceneIds((prev) => ({ ...prev, [sceneId]: false }));
  };

  const handleDurationChange = (sceneId: number, duration: number) => {
    setParsedScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, cutDuration: duration } : s))
    );
  };

  const handleClear = () => {
    setScript("");
    setParsedScenes([]);
  };

  // --- PLAYBACK LOGIC ---

  const startPlayback = () => {
    // Filter only scenes with visuals and a selected video
    const queue = parsedScenes.filter(
      (s) => s.type === "VISUAL" && s.selectedVideo
    );
    if (queue.length === 0) {
      alert("No visual scenes selected!");
      return;
    }
    setPlaybackQueue(queue);
    setPlaybackIndex(0);
    setIsCinemaOpen(true);
    playSequence(0, queue);
  };

  const playSequence = useCallback(
    (index: number, queue: Scene[]) => {
      if (index >= queue.length) {
        // Loop
        playSequence(0, queue);
        return;
      }

      setPlaybackIndex(index);
      setPlaybackProgress(0);
      const scene = queue[index];
      const duration = scene.cutDuration || 4;

      // TTS
      window.speechSynthesis.cancel();
      if (useTTS) {
        const utterance = new SpeechSynthesisUtterance(scene.originalLine);
        utterance.rate = 1.1;
        utterance.pitch = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }

      // Progress Bar Animation (approximate)
      const interval = 50; // ms
      const steps = (duration * 1000) / interval;
      let currentStep = 0;

      const timerId = setInterval(() => {
        currentStep++;
        const matchPercent = (currentStep / steps) * 100;
        setPlaybackProgress(Math.min(matchPercent, 100));

        if (currentStep >= steps) {
          clearInterval(timerId);
          playSequence(index + 1, queue);
        }
      }, interval);

      // Store timer ID to clear if modal closes?
      // Simplified for this demo: we rely on effect cleanup or modal state to ignore logic,
      // but strictly speaking we should clear interval on unmount/close.
      // For React, we'd typically use a useEffect for the ACTIVE clip.
      // Refactoring to useEffect based approach below would be cleaner but this function-chaining works for simple MVP.
      // See "cleanup" via a ref if needed.

      (window as any)._vf_timer = timerId; // Hacky ref for cleanup
    },
    [useTTS]
  );

  useEffect(() => {
    if (!isCinemaOpen) {
      window.speechSynthesis.cancel();
      if ((window as any)._vf_timer) clearInterval((window as any)._vf_timer);
    }
  }, [isCinemaOpen]);

  const handleExport = () => {
    const queue = parsedScenes.filter((s) => s.selectedVideo);
    let content = "VISUAL FLOW // VIDEO MANIFEST\n";
    content += "Generated on: " + new Date().toLocaleString() + "\n";
    content += "Aesthetic: " + globalVibe.toUpperCase() + "\n";
    content += "Format: " + globalOrientation.toUpperCase() + "\n";
    content += "========================================\n\n";

    queue.forEach((scene, idx) => {
      content += `SCENE ${idx + 1}: ${scene.originalLine}\n`;
      content += `DURATION: ${scene.cutDuration}s\n`;
      content += `QUERY: ${scene.query}\n`;
      content += `SOURCE: ${scene.selectedVideo?.source} // LINK: ${scene.selectedVideo?.url}\n`;
      content += "----------------------------------------\n";
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifest_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExport={handleExport}
        onPlay={startPlayback}
        hasSelections={parsedScenes.some((s) => s.selectedVideo)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSave={setApiKeys}
      />

      <CinemaModal
        isOpen={isCinemaOpen}
        onClose={() => setIsCinemaOpen(false)}
        currentScene={playbackQueue[playbackIndex] || null}
        currentVideo={playbackQueue[playbackIndex]?.selectedVideo}
        progress={playbackProgress}
        currentIndex={playbackIndex}
        totalCount={playbackQueue.length}
        useTTS={useTTS}
        onToggleTTS={() => setUseTTS(!useTTS)}
        isSpeaking={isSpeaking}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
        {/* Top Section */}
        <section className="w-full flex flex-col gap-6 order-1">
          <ScriptInput
            script={script}
            onScriptChange={setScript}
            onProcess={handleProcessScript}
            isProcessing={isProcessing}
            useAI={useAI}
            onToggleAI={() => setUseAI(!useAI)}
          />
        </section>

        {/* Bottom Section */}
        <section className="w-full order-2">
          <ControlBar
            orientation={globalOrientation}
            onOrientationChange={setGlobalOrientation}
            vibe={globalVibe}
            onVibeChange={setGlobalVibe}
            onClear={handleClear}
          />

          <ResultsGrid
            scenes={parsedScenes}
            orientation={globalOrientation}
            onSelectVideo={handleSelectVideo}
            onLoadMore={handleLoadMore}
            onDurationChange={handleDurationChange}
            loadingState={loadingSceneIds}
          />
        </section>
      </main>

      {/* Toast (Simplified for MVP as just console/alert for now, could add designated component) */}
    </div>
  );
}

export default App;
