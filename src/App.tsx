import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { SettingsModal } from "./components/SettingsModal";
import { ScriptInput } from "./components/ScriptInput";
import { ControlBar } from "./components/ControlBar";
import { ResultsGrid } from "./components/ResultsGrid";
import { CinemaModal } from "./components/CinemaModal";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import {
  extractKeywords,
  fetchGeminiQuery,
  searchVideos,
  searchFreesound,
} from "./services/api";
import { parseScript } from "./utils/scriptParser";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type {
  VideoResult,
  Orientation,
  Vibe,
  Scene,
  ColorGrade,
  ApiKeys,
  EnabledSources,
} from "./types";

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [script, setScript] = useLocalStorage<string>("vf_script", "");
  const [parsedScenes, setParsedScenes] = useState<Scene[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>("vf_api_keys", {
    pexels: import.meta.env.VITE_PEXELS_API_KEY || "",
    pixabay: import.meta.env.VITE_PIXABAY_API_KEY || "",
    gemini: import.meta.env.VITE_GEMINI_API_KEY || "",
    coverr: import.meta.env.VITE_COVERR_API_KEY || "",
    freesound: import.meta.env.VITE_FREESOUND_API_KEY || "",
  });

  const [enabledSources, setEnabledSources] = useLocalStorage<EnabledSources>(
    "vf_enabled_sources",
    {
      pexels: true,
      pixabay: true,
      coverr: false, // Disabled by default - limited free library
      freesound: true,
    }
  );

  const [globalOrientation, setGlobalOrientation] =
    useLocalStorage<Orientation>("vf_orientation", "landscape");
  const [globalVibe, setGlobalVibe] = useLocalStorage<Vibe>("vf_vibe", "none");
  const [globalColorGrade, setGlobalColorGrade] = useLocalStorage<ColorGrade>(
    "vf_color",
    "none"
  );

  // Playback State
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [playbackQueue, setPlaybackQueue] = useState<Scene[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useTTS, setUseTTS] = useState(false);

  // Pagination / Loading States
  const [loadingSceneIds, setLoadingSceneIds] = useState<
    Record<number, boolean>
  >({});

  // AI Toggle
  const [useAI, setUseAI] = useLocalStorage<boolean>("vf_use_ai", false);
  const [isExporting, setIsExporting] = useState(false);

  // --- Logic & Handlers (Matches previous App.tsx logic) ---

  const handleProcessScript = async () => {
    if (!script.trim()) return;

    // Basic validation
    if (!apiKeys.pexels && !apiKeys.pixabay) {
      addToast("Missing API Keys! Configure them in Settings.", "error");
      setIsSettingsOpen(true);
      return;
    }

    setIsProcessing(true);
    setParsedScenes([]); // Clear previous results

    try {
      const initialScenes = parseScript(script);

      // Helper: Process a single scene
      const processScene = async (scene: Scene): Promise<Scene> => {
        let query = extractKeywords(scene.originalLine);

        // AI Enhancement with timeout fallback
        if (useAI && apiKeys.gemini) {
          const aiQuery = await fetchGeminiQuery(
            scene.originalLine,
            apiKeys.gemini,
            "metaphorical"
          );
          if (aiQuery) {
            query = aiQuery;
            scene.isAiGenerated = true;
          }
        }

        scene.query = query;

        if (scene.type === "AUDIO") {
          if (apiKeys.freesound && enabledSources.freesound) {
            const audioOptions = await searchFreesound(
              query,
              apiKeys.freesound,
              1
            );
            return { ...scene, audioOptions, selectedAudio: audioOptions[0] };
          }
          return scene;
        }

        // Fetch Videos
        const options = await searchVideos(
          query,
          globalVibe,
          globalOrientation,
          {
            pexels: enabledSources.pexels ? apiKeys.pexels : "",
            pixabay: enabledSources.pixabay ? apiKeys.pixabay : "",
            coverr: enabledSources.coverr ? apiKeys.coverr : "",
          },
          1,
          globalColorGrade
        );

        return { ...scene, options, selectedVideo: options[0] };
      };

      // Process in batches of 3 for parallelism without overwhelming APIs
      const BATCH_SIZE = 3;
      const allResults: Scene[] = [];

      for (let i = 0; i < initialScenes.length; i += BATCH_SIZE) {
        const batch = initialScenes.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(processScene));
        allResults.push(...batchResults);

        // Progressive update: Show results as they come in
        setParsedScenes([...allResults]);
      }

      addToast(
        `Generated ${allResults.length} scenes successfully!`,
        "success"
      );
    } catch (error) {
      console.error(error);
      addToast("Failed to process script. Check console.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectVideo = useCallback(
    (sceneId: number, video: VideoResult) => {
      setParsedScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, selectedVideo: video } : s))
      );
    },
    []
  );

  const handleLoadMore = useCallback(
    async (sceneId: number, query: string, currentPage: number) => {
      setLoadingSceneIds((prev) => ({ ...prev, [sceneId]: true }));

      const nextPage = currentPage + 1;
      const newVideos = await searchVideos(
        query,
        globalVibe,
        globalOrientation,
        {
          pexels: enabledSources.pexels ? apiKeys.pexels : "",
          pixabay: enabledSources.pixabay ? apiKeys.pixabay : "",
          coverr: enabledSources.coverr ? apiKeys.coverr : "",
        },
        nextPage,
        globalColorGrade
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
    },
    [globalVibe, globalOrientation, apiKeys, globalColorGrade, enabledSources]
  );

  const handleDurationChange = useCallback(
    (sceneId: number, duration: number) => {
      setParsedScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? { ...s, cutDuration: duration } : s
        )
      );
    },
    []
  );

  const handleClear = useCallback(() => {
    setScript("");
    setParsedScenes([]);
    addToast("Workspace Cleared", "info");
  }, [setScript, addToast]);

  // --- Playback Logic ---
  const startPlayback = () => {
    const validScenes = parsedScenes.filter(
      (s) => s.type === "VISUAL" || s.type === "DIALOGUE" || s.type === "AUDIO"
    );
    if (validScenes.length === 0) {
      addToast("No scenes selected!", "error");
      return;
    }

    setPlaybackQueue(validScenes);
    setPlaybackIndex(0);
    setIsCinemaOpen(true);
  };

  // Simple interval playback controller (Centralized)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCinemaOpen && playbackQueue.length > 0) {
      // Current scene
      const currentScene = playbackQueue[playbackIndex];
      if (!currentScene) return;

      const durationMs = currentScene.cutDuration * 1000;
      const tickRate = 100; // Update progress every 100ms
      let elapsed = 0;

      // Reset progress on index change
      setPlaybackProgress(0);

      // TTS Trigger
      if (useTTS && !isSpeaking && elapsed === 0) {
        // Simple mock TTS trigger
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(currentScene.originalLine);
          u.onstart = () => setIsSpeaking(true);
          u.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(u);
        }
      }

      interval = setInterval(() => {
        elapsed += tickRate;
        setPlaybackProgress((elapsed / durationMs) * 100);

        if (elapsed >= durationMs) {
          // Next scene
          if (playbackIndex < playbackQueue.length - 1) {
            setPlaybackIndex((prev) => prev + 1);
            elapsed = 0;
          } else {
            // End
            setIsCinemaOpen(false);
            clearInterval(interval);
          }
        }
      }, tickRate);
    }
    return () => {
      if (interval) clearInterval(interval);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [isCinemaOpen, playbackIndex, playbackQueue, useTTS, isSpeaking]);

  const handleExport = useCallback(async () => {
    if (parsedScenes.length === 0) return;
    setIsExporting(true);
    addToast("Bundling Project Files...", "info");
    try {
      const { createExportPackage } = await import("./services/nleExport");
      const blob = await createExportPackage(parsedScenes);

      // Trigger Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "VisualFlow_Project.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast("Export Downloaded Successfully!", "success");
    } catch (error) {
      console.error("Export Failed", error);
      addToast("Export Failed. See console.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [parsedScenes, addToast]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-vf-lime selection:text-black">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExport={handleExport}
        onPlay={startPlayback}
        hasSelections={parsedScenes.some((s) => s.selectedVideo)}
        isExporting={isExporting}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSave={setApiKeys}
        enabledSources={enabledSources}
        onToggleSource={(source: keyof EnabledSources, enabled: boolean) =>
          setEnabledSources((prev) => ({ ...prev, [source]: enabled }))
        }
      />

      <CinemaModal
        isOpen={isCinemaOpen}
        onClose={() => setIsCinemaOpen(false)}
        currentScene={playbackQueue[playbackIndex] || null}
        currentVideo={playbackQueue[playbackIndex]?.selectedVideo}
        currentAudio={playbackQueue[playbackIndex]?.selectedAudio} // NEW
        progress={playbackProgress}
        currentIndex={playbackIndex}
        totalCount={playbackQueue.length}
        useTTS={useTTS}
        onToggleTTS={() => setUseTTS(!useTTS)}
        isSpeaking={isSpeaking}
      />

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
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
            colorGrade={globalColorGrade}
            onColorGradeChange={setGlobalColorGrade}
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

      {/* Footer Signature */}
      <footer className="fixed bottom-4 right-4 text-[10px] font-mono text-neutral-700 hover:text-neutral-500 transition-colors">
        crafted by{" "}
        <a
          href="https://github.com/Mkzay"
          target="_blank"
          rel="noopener noreferrer"
          className="text-vf-lime/50 hover:text-vf-lime transition-colors"
        >
          Mkzay
        </a>
      </footer>

      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
