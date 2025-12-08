<template>
  <div v-if="subtitlesStore.currentCue" class="subtitle-overlay">
    <div
      class="subtitle-text"
      :style="subtitleStyle"
      v-html="subtitlesStore.currentCue"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useSubtitlesStore } from "../stores/subtitlesStore";
import { useSettingsStore } from "../stores/settingsStore";
import { computed } from "vue";

const subtitlesStore = useSubtitlesStore();
const settingsStore = useSettingsStore();

const subtitleStyle = computed(() => ({
  backgroundColor: settingsStore.subtitleBackground,
  color: settingsStore.subtitleColor,
  fontSize: `${settingsStore.subtitleSize}%`,
}));
</script>

<style scoped>
.subtitle-overlay {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 1000;
  font-size: 40px;
}

.subtitle-text {
  padding: 8px 16px;
  border-radius: 4px;
  font-family: Arial, sans-serif;
  text-align: center;
  -webkit-text-stroke: 1px black;
  max-width: 80%;
  line-height: 1.4;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.8);
  white-space: pre-line;
}
</style>
