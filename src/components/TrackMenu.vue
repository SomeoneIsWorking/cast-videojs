<script setup lang="ts">
import { computed } from "vue";
import { usePlayerStore } from "../stores/playerStore";

const playerStore = usePlayerStore();

const menuTitle = computed(() => {
  switch (playerStore.currentMenu) {
    case "audio":
      return "Audio Tracks";
    case "subtitles":
      return "Subtitles";
    default:
      return "";
  }
});

const menuItems = computed(() => {
  switch (playerStore.currentMenu) {
    case "audio":
      return playerStore.audioTracks;
    case "subtitles":
      return playerStore.subtitleTracks;
    default:
      return [];
  }
});
</script>

<template>
  <div v-if="playerStore.menuVisible" class="remote-menu">
    <div class="remote-menu-content">
      <h3 class="remote-menu-title">{{ menuTitle }}</h3>
      <ul class="remote-menu-list">
        <li
          v-for="(item, index) in menuItems"
          :key="index"
          :class="[
            'remote-menu-item',
            { selected: index === playerStore.selectedIndex },
            { active: item.active },
          ]"
        >
          {{ item.label }}
        </li>
      </ul>
      <div class="remote-menu-hint">
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  </div>
</template>

<style scoped>
.remote-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.remote-menu-content {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  padding: 2rem;
  min-width: 400px;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.remote-menu-title {
  color: #fff;
  font-size: 1.8rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.remote-menu-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  max-height: 400px;
  overflow-y: auto;
}

.remote-menu-item {
  padding: 1rem 1.5rem;
  color: #ccc;
  font-size: 1.2rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.remote-menu-item.selected {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.02);
}

.remote-menu-item.active {
  color: #4caf50;
  font-weight: 600;
}

.remote-menu-item.active::after {
  content: " ✓";
  margin-left: 0.5rem;
}

.remote-menu-hint {
  color: #888;
  font-size: 0.9rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
