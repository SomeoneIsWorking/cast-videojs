import { defineStore } from "pinia";
import { ref } from "vue";
import { usePlayerStore } from "./playerStore";

interface VTTCue {
  startTime: number;
  endTime: number;
  text: string;
}

export const useSubtitlesStore = defineStore("subtitles", () => {
  const playerStore = usePlayerStore();

  const currentCue = ref<string>("");
  const cues = ref<VTTCue[]>([]);
  const visible = ref(false);

  async function loadSubtitles(url: string) {
    try {
      console.log(`Loading subtitles from ${url}`);
      const response = await fetch(url);
      const vttText = await response.text();

      cues.value = parseVTT(vttText);
      visible.value = true;
      console.log(`Loaded ${cues.value.length} subtitle cues`);

      // Start watching current time
      setupTimeWatcher();
    } catch (error) {
      console.error(`Failed to load subtitles from URL ${url}: ${error}`);
    }
  }

  function parseVTT(vttText: string): VTTCue[] {
    const lines = vttText.split("\n");
    const parsedCues: VTTCue[] = [];
    let i = 0;

    // Skip WEBVTT header
    while (i < lines.length && !lines[i].includes("-->")) {
      i++;
    }

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.includes("-->")) {
        const [startStr, endStr] = line.split("-->").map((s) => s.trim());
        const startTime = parseTimestamp(startStr);
        const endTime = parseTimestamp(endStr);

        // Collect text lines until empty line
        i++;
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== "") {
          textLines.push(lines[i].trim());
          i++;
        }

        if (textLines.length > 0) {
          parsedCues.push({
            startTime,
            endTime,
            text: textLines.join("\n"),
          });
        }
      }
      i++;
    }

    return parsedCues;
  }

  function parseTimestamp(timestamp: string): number {
    // Format: 00:00:00.000 or 00:00.000
    const parts = timestamp.split(":");
    let hours = 0,
      minutes = 0,
      seconds = 0;

    if (parts.length === 3) {
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1]);
      seconds = parseFloat(parts[2]);
    } else if (parts.length === 2) {
      minutes = parseInt(parts[0]);
      seconds = parseFloat(parts[1]);
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  function setupTimeWatcher() {
    // Watch duration changes as proxy for time updates
    // We'll use the video element's timeupdate event instead
    const videoElement = playerStore.videoElement;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (!visible.value) {
        currentCue.value = "";
        return;
      }

      const currentTime = videoElement.currentTime;

      // Find active cue
      const activeCue = cues.value.find(
        (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
      );

      currentCue.value = activeCue ? activeCue.text : "";
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
  }

  function show(value: boolean) {
    visible.value = value;
  }

  return {
    currentCue,
    cues,
    visible,
    loadSubtitles,
    show,
  };
});
