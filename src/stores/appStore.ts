import { defineStore } from "pinia";
import { ref, computed } from "vue";

export enum AppState {
  LOADING = "loading",    // Initial receiver startup
  IDLE = "idle",          // Ready to cast, no media
  PLAYING = "playing",    // Media is playing
  PAUSED = "paused",      // Media is paused
  BUFFERING = "buffering", // Media is buffering
  ERROR = "error",        // Error state
}

export const useAppStore = defineStore("app", () => {
  // State
  const appState = ref<AppState>(AppState.LOADING);
  const currentTime = ref(0);
  const duration = ref(0);
  const errorMessage = ref("");

  // Computed
  const appStateClass = computed(() => `app-state-${appState.value}`);
  
  const progress = computed(() => {
    if (!duration.value || !currentTime.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const statusText = computed(() => {
    const messages = {
      [AppState.LOADING]: "Initializing receiver...",
      [AppState.IDLE]: "Ready to Cast",
      [AppState.PLAYING]: "",
      [AppState.PAUSED]: "",
      [AppState.BUFFERING]: "",
      [AppState.ERROR]: "Error occurred",
    };
    return messages[appState.value] || "";
  });

  const isPlaying = computed(() => appState.value === AppState.PLAYING);
  const hasMedia = computed(() => 
    [AppState.PLAYING, AppState.PAUSED, AppState.BUFFERING].includes(appState.value)
  );

  // Actions
  function setAppState(state: AppState) {
    appState.value = state;
  }

  function setCurrentTime(time: number) {
    currentTime.value = time;
  }

  function setDuration(time: number) {
    duration.value = time;
  }

  function setError(message: string) {
    errorMessage.value = message;
    appState.value = AppState.ERROR;
  }

  function clearError() {
    errorMessage.value = "";
  }

  function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) {
      return "0:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  return {
    // State
    appState,
    currentTime,
    duration,
    errorMessage,

    // Computed
    appStateClass,
    progress,
    statusText,
    isPlaying,
    hasMedia,

    // Actions
    setAppState,
    setCurrentTime,
    setDuration,
    setError,
    clearError,
    formatTime,
  };
});
