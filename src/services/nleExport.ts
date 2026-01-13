import JSZip from "jszip";
import type { Scene } from "../types";

export const generateFcpXml = (
  scenes: Scene[],
  projectName = "VisualFlow Sequence"
): string => {
  const fps = 24;
  const timebase = 24;

  // Header
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
<sequence id="sequence-1">
    <name>${projectName}</name>
    <rate>
        <timebase>${timebase}</timebase>
        <ntsc>FALSE</ntsc>
    </rate>
    <media>
        <video>
            <format>
                <samplecharacteristics>
                    <rate>
                        <timebase>${timebase}</timebase>
                        <ntsc>FALSE</ntsc>
                    </rate>
                    <width>1920</width>
                    <height>1080</height>
                    <anamorphic>FALSE</anamorphic>
                    <pixelaspectratio>square</pixelaspectratio>
                    <fielddominance>none</fielddominance>
                </samplecharacteristics>
            </format>
            <track>
`;

  // Start time in frames (usually 0 or an hour)
  let currentStartFrame = 0;

  scenes.forEach((scene, index) => {
    if (!scene.selectedVideo) return;

    const durationFrames = scene.cutDuration * fps;
    const filename = `clip_${index + 1}_${scene.selectedVideo.id}.mp4`;
    // We assume a standard path structure relative to the XML
    const fileUrl = `file://localhost/./media/${filename}`;

    xml += `                <clipitem id="clipitem-${index}">
                    <name>${scene.originalLine.substring(0, 30)}</name>
                    <duration>${durationFrames}</duration>
                    <rate>
                        <timebase>${timebase}</timebase>
                        <ntsc>FALSE</ntsc>
                    </rate>
                    <start>${currentStartFrame}</start>
                    <end>${currentStartFrame + durationFrames}</end>
                    <in>0</in>
                    <out>${durationFrames}</out>
                    <file id="file-${index}">
                        <name>${filename}</name>
                        <pathurl>${fileUrl}</pathurl>
                        <rate>
                            <timebase>${timebase}</timebase>
                            <ntsc>FALSE</ntsc>
                        </rate>
                        <duration>${durationFrames}</duration>
                        <media>
                            <video>
                                <samplecharacteristics>
                                    <rate>
                                        <timebase>${timebase}</timebase>
                                        <ntsc>FALSE</ntsc>
                                    </rate>
                                    <width>1920</width>
                                    <height>1080</height>
                                </samplecharacteristics>
                            </video>
                        </media>
                    </file>
                </clipitem>
`;
    currentStartFrame += durationFrames;
  });

  // Footer
  xml += `            </track>
        </video>
        <audio>
            <track>
                <!-- Audio track placeholders could go here -->
            </track>
        </audio>
    </media>
</sequence>
</xmeml>`;

  return xml;
};

export const generateDownloadScript = (
  scenes: Scene[]
): { bat: string; sh: string } => {
  let bat = `@echo off
echo Starting VisualFlow Asset Download...
mkdir media
`;
  let sh = `#!/bin/bash
echo "Starting VisualFlow Asset Download..."
mkdir -p media
`;

  scenes.forEach((scene, index) => {
    if (!scene.selectedVideo) return;

    const filename = `clip_${index + 1}_${scene.selectedVideo.id}.mp4`;
    const url = scene.selectedVideo.videoSrc;

    bat += `echo Downloading ${filename}...\n`;
    bat += `curl -L -o "media\\${filename}" "${url}"\n`; // Use curl which is standard in Win10+ now

    sh += `echo "Downloading ${filename}..."\n`;
    sh += `curl -L -o "media/${filename}" "${url}"\n`;
  });

  bat += `echo Download Complete! You can now import project.xml into Premiere Pro.
pause`;

  sh += `echo "Download Complete! You can now import project.xml into Premiere Pro."`;

  return { bat, sh };
};

export const createExportPackage = async (scenes: Scene[]) => {
  const zip = new JSZip();

  // 1. Generate Content
  const xmlContent = generateFcpXml(scenes);
  const { bat, sh } = generateDownloadScript(scenes);

  // 2. Add to Zip
  zip.file("project.xml", xmlContent);
  zip.file("download_assets.bat", bat);
  zip.file("download_assets.sh", sh);

  // 3. Generate Blob
  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
};
