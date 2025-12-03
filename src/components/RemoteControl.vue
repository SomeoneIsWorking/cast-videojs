<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useLogStore } from "../stores/logStore";
import { useSettingsStore } from "../stores/settingsStore";
import { usePlayerStore } from "../stores/playerStore";
import { eventBus } from "../utils/eventBus";

const logStore = useLogStore();
const settingsStore = useSettingsStore();
const playerStore = usePlayerStore();

function handleKeyPress(event: KeyboardEvent) {
  const key = event.key;

  console.log(`Key pressed: ${key}`);

  // Handle MediaStop to exit the app
  if (key === "MediaStop") {
    window.close();
    return;
  }

  // Don't prevent default for back button
  if (key !== "GoBack" && key !== "BrowserBack") {
    event.preventDefault();
  }

  // Global shortcuts - check these first
  switch (key) {
    case "ColorF1Green":
    case "s":
      settingsStore.toggle();
      return;
    case "ColorF0Red":
    case "d":
      logStore.toggle();
      return;
  }

  // Handle overlay visibility
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
      eventBus.emit("log:scroll-up");
      break;
    case "ArrowDown":
      eventBus.emit("log:scroll-down");
      break;
    case "Escape":
    case "Backspace":
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
