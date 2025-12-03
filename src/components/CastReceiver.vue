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
    :class="appStore.appStateClass"
  >
    <div class="splash-screen">
      <div class="status-text">{{ appStore.statusText }}</div>
    </div>

    <div class="idle-screen">
      <div class="logo-cast"></div>
      <div class="status-text">{{ appStore.statusText }}</div>
    </div>

    <video id="player" controls :class="{ 'show-controls': playerStore.showControls }"></video>

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

    <div class="error-screen">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ appStore.errorMessage }}</div>
    </div>
  </div>
</template>
