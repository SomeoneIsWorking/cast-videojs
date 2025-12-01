<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useVideoPlayer } from "../composables/useVideoPlayer";
import { useCastReceiver } from "../composables/useCastReceiver";
import { useConsoleInterceptor } from "../composables/useConsoleInterceptor";
import { useSettingsStore } from "../stores/settingsStore";
import { useLogStore } from "../stores/logStore";

// App states
enum AppState {
  LOADING = "loading",
  IDLE = "idle",
  ERROR = "error",
}

// Content states
enum ContentState {
  LOADING = "loading",
  BUFFERING = "buffering",
  PLAYING = "playback",
  PAUSED = "paused",
}

const settingsStore = useSettingsStore();
const logStore = useLogStore();

// State
const appState = ref<AppState>(AppState.LOADING);
const contentState = ref<ContentState | null>(null);
const mediaTitle = ref("");
const mediaDescription = ref("");
const thumbUrl = ref("");
const currentTime = ref(0);
const duration = ref(0);
const userInactive = ref(false);
const seekFlag = ref(false);
const errorMessage = ref("");

let userActivityTimeout: NodeJS.Timeout | null = null;

// Composables
const { player, isReady, initPlayer, loadMedia } = useVideoPlayer("player");
const { castContext, playerManager, initCastReceiver } = useCastReceiver();
useConsoleInterceptor();

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

// Methods
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

function resetUserActivityTimeout() {
  userInactive.value = false;

  if (userActivityTimeout) {
    clearTimeout(userActivityTimeout);
  }

  userActivityTimeout = setTimeout(() => {
    userInactive.value = true;
  }, 5000);
}

function handleLoadRequest(loadRequestData: any) {
  const media = loadRequestData.media;

  if (!media || !media.contentId) {
    console.error("Invalid media in load request");
    return;
  }

  // Update metadata
  if (media.metadata) {
    if (media.metadata.title) {
      mediaTitle.value = media.metadata.title;
    }
    if (media.metadata.subtitle) {
      mediaDescription.value = media.metadata.subtitle;
    }
    if (media.metadata.images && media.metadata.images.length > 0) {
      thumbUrl.value = media.metadata.images[0].url;
    }
  }

  // Load media
  contentState.value = ContentState.LOADING;
  loadMedia(media);

  // Handle autoplay
  if (loadRequestData.autoplay && settingsStore.autoplay) {
    console.log("Autoplay requested");
    setTimeout(() => {
      player.value?.play();
    }, 100);
  }
}

function setupPlayerListeners() {
  if (!player.value) return;

  player.value.on("loadstart", () => {
    contentState.value = ContentState.LOADING;
  });

  player.value.on("playing", () => {
    contentState.value = ContentState.PLAYING;
  });

  player.value.on("pause", () => {
    contentState.value = ContentState.PAUSED;
  });

  player.value.on("waiting", () => {
    contentState.value = ContentState.BUFFERING;
  });

  player.value.on("timeupdate", () => {
    if (player.value) {
      currentTime.value = player.value.currentTime();
      duration.value = player.value.duration();
      resetUserActivityTimeout();
    }
  });

  player.value.on("ended", () => {
    contentState.value = null;
    appState.value = AppState.IDLE;
  });

  player.value.on("error", (e: any) => {
    const error = player.value?.error();
    errorMessage.value = error
      ? `Error ${error.code}: ${error.message}`
      : "An error occurred during playback";
    appState.value = AppState.ERROR;
    logStore.show();
  });
}

async function initialize() {
  try {
    // Check for debug mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get("debug") === "true";

    if (debugMode) {
      settingsStore.setDebugMode(true);
      if (typeof cast !== "undefined") {
        cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
      }
      console.log("Debug mode enabled");
      logStore.show();
    }

    // Initialize player
    initPlayer();
    setupPlayerListeners();

    // Initialize Cast Receiver
    await initCastReceiver();

    // Set up custom load handler
    if (playerManager.value) {
      const originalInterceptor = playerManager.value.setMessageInterceptor(
        cast.framework.messages.MessageType.LOAD,
        (loadRequestData: any) => {
          loadRequestData.media.hlsSegmentFormat =
            cast.framework.messages.HlsSegmentFormat.TS;
          handleLoadRequest(loadRequestData);
          return loadRequestData;
        }
      );
    }

    // Transition to IDLE state
    setTimeout(() => {
      appState.value = AppState.IDLE;
      console.log("Receiver ready - waiting for cast");
    }, 500);
  } catch (e) {
    console.error("Initialization error:", e);
    errorMessage.value =
      e instanceof Error ? e.message : "Initialization failed";
    appState.value = AppState.ERROR;
    logStore.show();
  }
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div
    id="app"
    :class="[
      appStateClass,
      contentStateClass,
      { 'flag-user-inactive': userInactive, 'flag-seek': seekFlag },
    ]"
  >
    <!-- Loading State -->
    <div class="splash-screen">
      <div class="status-text">{{ statusText }}</div>
    </div>

    <!-- Idle State -->
    <div class="idle-screen">
      <div class="logo-cast"></div>
      <div class="status-text">{{ statusText }}</div>
    </div>

    <!-- Video Player -->
    <video id="player" class="video-js"></video>

    <!-- Media Info Overlay -->
    <div class="media-info">
      <img
        v-if="thumbUrl"
        :src="thumbUrl"
        alt="Thumbnail"
        class="thumb-container"
      />
      <div class="media-text">
        <div class="media-title">{{ mediaTitle }}</div>
        <div class="media-description">{{ mediaDescription }}</div>
      </div>
    </div>

    <!-- Playback Controls Overlay -->
    <div class="controls-overlay">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="time-display">
        <span class="text-elapsed">{{ formatTime(currentTime) }}</span>
        <span class="text-duration">{{ formatTime(duration) }}</span>
      </div>
      <div id="icon-state" :class="{ playing: isPlaying }"></div>
    </div>

    <!-- Error State -->
    <div class="error-screen">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
#app {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #000;
}

.video-js {
  width: 100%;
  height: 100%;
}

/* State visibility */
.splash-screen,
.idle-screen,
.error-screen {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #000;
  z-index: 100;
}

.app-state-loading .splash-screen {
  display: flex;
}

.app-state-idle .idle-screen {
  display: flex;
}

.app-state-error .error-screen {
  display: flex;
}

/* Media info overlay */
.media-info {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  gap: 1.5rem;
  opacity: 1;
  transition: opacity 0.3s;
  z-index: 50;
}

.flag-user-inactive .media-info {
  opacity: 0;
}

.thumb-container {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.media-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.media-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.media-description {
  font-size: 1.2rem;
  color: #ccc;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Controls overlay */
.controls-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  opacity: 1;
  transition: opacity 0.3s;
  z-index: 50;
}

.flag-user-inactive .controls-overlay {
  opacity: 0;
}

.progress-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}

.time-display {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

#icon-state {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  width: 80px;
  height: 80px;
  opacity: 0;
  transition: opacity 0.3s;
}

#icon-state.playing {
  opacity: 1;
}

/* Status text */
.status-text {
  font-size: 2rem;
  color: #fff;
  text-align: center;
}

/* Error screen */
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.5rem;
  color: #f44336;
  text-align: center;
  max-width: 80%;
}

/* Logo */
.logo-cast {
  width: 200px;
  height: 200px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>')
    center/contain no-repeat;
  margin-bottom: 2rem;
}
</style>
