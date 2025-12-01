<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useLogStore } from "../stores/logStore";
import { useSettingsStore } from "../stores/settingsStore";
import { usePlayerStore } from "../stores/playerStore";

const logStore = useLogStore();
const settingsStore = useSettingsStore();
const playerStore = usePlayerStore();

function handleKeyPress(event: KeyboardEvent) {
  const key = event.key;

  // Prevent default behavior for navigation keys
  event.preventDefault();

  switch (key) {
    case "ColorF0Green":
    case "s":
      settingsStore.toggle();
      return;
    case "ColorF0Red":
    case "d":
      logStore.toggle();
      return;
  }
  if (logStore.visible) {
    handleLoggerKeys(key);
  } else if (settingsStore.visible) {
    handleSettingsKeys(key);
  } else {
    handlePlayerKeys(key);
  }
}

function handleLoggerKeys(key: string) {
  switch (key) {
    case "ArrowUp":
      logStore.scrollUp();
      break;
    case "ArrowDown":
      logStore.scrollDown();
      break;
    case "Escape":
    case "Backspace":
    case "ColorF0Red":
      logStore.hide();
      break;
    case "c":
    case "C":
      logStore.clear();
      break;
  }
}

function handleSettingsKeys(key: string) {
  switch (key) {
    case "ArrowUp":
      settingsStore.navigateUp();
      break;
    case "ArrowDown":
      settingsStore.navigateDown();
      break;
    case "ArrowLeft":
      settingsStore.navigateLeft();
      break;
    case "ArrowRight":
      settingsStore.navigateRight();
      break;
    case "Enter":
      settingsStore.selectCurrentItem();
      break;
    case "Escape":
    case "Backspace":
    case "ColorF0Green":
      settingsStore.hide();
      break;
  }
}

function handlePlayerKeys(key: string) {
  switch (key) {
    case "ArrowLeft":
      playerStore.seekBackward();
      break;
    case "ArrowRight":
      playerStore.seekForward();
      break;
    case "Enter":
    case "MediaPlayPause":
      playerStore.togglePlayPause();
      break;
    case "MediaTrackPrevious":
    case "MediaRewind":
      playerStore.seekBackward();
      break;
    case "MediaTrackNext":
    case "MediaFastForward":
      playerStore.seekForward();
      break;
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyPress);
});
</script>

<template>
  <!-- This component has no visual output, it only handles keyboard events -->
</template>
