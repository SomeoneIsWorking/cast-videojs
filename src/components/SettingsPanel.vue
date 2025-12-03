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
