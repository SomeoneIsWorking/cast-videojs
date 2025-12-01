import { defineStore } from "pinia";
import { ref, computed } from "vue";

export enum AppState {
  LOADING = "loading",
  IDLE = "idle",
  ERROR = "error",
}

export enum ContentState {
  LOADING = "loading",
  BUFFERING = "buffering",
  PLAYING = "playback",
  PAUSED = "paused",
}

export const useAppStore = defineStore("app", () => {
  // State
  const appState = ref<AppState>(AppState.LOADING);
  const contentState = ref<ContentState | null>(null);
  const currentTime = ref(0);
  const duration = ref(0);
  const userInactive = ref(false);
  const seekFlag = ref(false);
  const errorMessage = ref("");

  let userActivityTimeout: number | null = null;

  // Computed
  const appStateClass = computed(() => `app-state-${appState.value}`);
  
  const contentStateClass = computed(() =>
    contentState.value ? `content-state-${contentState.value}` : ""
  );
  
  const progress = computed(() => {
    if (!duration.value || !currentTime.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const statusText = computed(() => {
    const messages = {
      [AppState.LOADING]: "Initializing receiver...",
      [AppState.IDLE]: "Ready to Cast",
      [AppState.ERROR]: "Error occurred",
    };
    return messages[appState.value] || "";
  });

  const isPlaying = computed(() => contentState.value === ContentState.PLAYING);

  // Actions
  function setAppState(state: AppState) {
    appState.value = state;
  }

  function setContentState(state: ContentState | null) {
    contentState.value = state;
  }

  function setCurrentTime(time: number) {
    currentTime.value = time;
  }

  function setDuration(time: number) {
    duration.value = time;
  }

  function setSeekFlag(flag: boolean) {
    seekFlag.value = flag;
  }

  function setError(message: string) {
    errorMessage.value = message;
    appState.value = AppState.ERROR;
  }

  function clearError() {
    errorMessage.value = "";
  }

  function resetUserActivityTimeout() {
    userInactive.value = false;

    if (userActivityTimeout) {
      clearTimeout(userActivityTimeout);
    }

    userActivityTimeout = setTimeout(() => {
      userInactive.value = true;
    }, 5000);
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
    contentState,
    currentTime,
    duration,
    userInactive,
    seekFlag,
    errorMessage,

    // Computed
    appStateClass,
    contentStateClass,
    progress,
    statusText,
    isPlaying,

    // Actions
    setAppState,
    setContentState,
    setCurrentTime,
    setDuration,
    setSeekFlag,
    setError,
    clearError,
    resetUserActivityTimeout,
    formatTime,
  };
});
