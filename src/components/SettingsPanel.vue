<script setup lang="ts">
import { useSettingsStore } from "../stores/settingsStore";

const settingsStore = useSettingsStore();
</script>

<template>
  <div v-if="settingsStore.visible" class="settings-panel">
    <div class="settings-content">
      <h3 class="settings-title">{{ settingsStore.menuTitle }}</h3>

      <div
        v-if="settingsStore.currentMenu !== 'main'"
        class="settings-breadcrumb"
      >
        ← Back (press Left or Backspace)
      </div>

      <ul class="settings-list">
        <li
          v-for="(item, index) in settingsStore.currentMenuItems"
          :key="index"
          :class="[
            'settings-item',
            { selected: index === settingsStore.selectedIndex },
            { active: 'active' in item && item.active },
          ]"
        >
          <span class="settings-label">{{ item.label }}</span>
          <span
            v-if="settingsStore.currentMenu === 'main'"
            class="settings-arrow"
            >→</span
          >
          <span
            v-if="'active' in item && item.active"
            class="settings-checkmark"
            >✓</span
          >
        </li>
      </ul>

      <div class="settings-hint">
        <template v-if="settingsStore.currentMenu === 'main'">
          Use ↑↓ to navigate, Enter or → to select, Esc to close
        </template>
        <template v-else>
          Use ↑↓ to navigate, Enter to select, ← to go back
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.settings-content {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  padding: 2rem;
  min-width: 500px;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.settings-title {
  color: #fff;
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.settings-breadcrumb {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  max-height: 400px;
  overflow-y: auto;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  color: #ccc;
  font-size: 1.2rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.settings-item.selected {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.02);
}

.settings-item.active {
  color: #4caf50;
}

.settings-label {
  font-weight: 500;
}

.settings-arrow {
  color: #888;
  font-size: 1.5rem;
}

.settings-checkmark {
  color: #4caf50;
  font-size: 1.5rem;
  font-weight: 600;
}

.settings-hint {
  color: #888;
  font-size: 0.9rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
