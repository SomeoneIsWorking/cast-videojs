<script setup lang="ts">
import { onMounted } from "vue";
import { usePlayerStore } from "../stores/playerStore";
import { useAppStore } from "../stores/appStore";
import { useAppInitializer } from "@/composables/useAppInitializer";

const appStore = useAppStore();
const playerStore = usePlayerStore();
const { initialize } = useAppInitializer();

onMounted(() => {
  initialize();
});
</script>

<template>
  <div
    id="app"
    :class="[
      appStore.appStateClass,
      appStore.contentStateClass,
      { 'flag-user-inactive': appStore.userInactive, 'flag-seek': appStore.seekFlag },
    ]"
  >
    <div class="splash-screen">
      <div class="status-text">{{ appStore.statusText }}</div>
    </div>

    <div class="idle-screen">
      <div class="logo-cast"></div>
      <div class="status-text">{{ appStore.statusText }}</div>
    </div>

    <video id="player" class="video-js"></video>

    <div class="media-info">
      <img
        v-if="playerStore.thumbUrl"
        :src="playerStore.thumbUrl"
        alt="Thumbnail"
        class="thumb-container"
      />
      <div class="media-text">
        <div class="media-title">{{ playerStore.mediaTitle }}</div>
        <div class="media-description">{{ playerStore.mediaDescription }}</div>
      </div>
    </div>

    <div class="controls-overlay">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${appStore.progress}%` }"></div>
      </div>
      <div class="time-display">
        <span class="text-elapsed">{{ appStore.formatTime(appStore.currentTime) }}</span>
        <span class="text-duration">{{ appStore.formatTime(appStore.duration) }}</span>
      </div>
      <div id="icon-state" :class="{ playing: appStore.isPlaying }"></div>
    </div>

    <div class="error-screen">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ appStore.errorMessage }}</div>
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