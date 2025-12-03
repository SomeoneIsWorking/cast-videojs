<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useLogStore } from "../stores/logStore";
import { eventBus } from "../utils/eventBus";

const logStore = useLogStore();
const logContainer = ref<HTMLElement | null>(null);
const autoScroll = ref(true);

// Scroll handlers
function handleScrollUp() {
  if (!logContainer.value) return;
  logContainer.value.scrollTop -= 50;
  autoScroll.value = false;
}

function handleScrollDown() {
  if (!logContainer.value) return;
  logContainer.value.scrollTop += 50;

  // Re-enable auto-scroll if we're near the bottom
  const { scrollTop, scrollHeight, clientHeight } = logContainer.value;
  if (scrollHeight - scrollTop - clientHeight < 50) {
    autoScroll.value = true;
  }
}

// Auto-scroll to bottom when new logs arrive
watch(
  () => logStore.logs.length,
  () => {
    if (autoScroll.value && logStore.visible) {
      nextTick(() => {
        if (logContainer.value) {
          logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
      });
    }
  }
);

// Scroll to bottom when becoming visible
watch(
  () => logStore.visible,
  (visible) => {
    if (visible && autoScroll.value) {
      nextTick(() => {
        if (logContainer.value) {
          logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
      });
    }
  }
);

onMounted(() => {
  eventBus.on("log:scroll-up", handleScrollUp);
  eventBus.on("log:scroll-down", handleScrollDown);
});

onUnmounted(() => {
  eventBus.off("log:scroll-up", handleScrollUp);
  eventBus.off("log:scroll-down", handleScrollDown);
});

function getLogIcon(type: string) {
  const icons = {
    log: "📝",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  };
  return icons[type as keyof typeof icons] || "📝";
}

function escapeHtml(text: string) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
</script>

<template>
  <div v-if="logStore.visible" class="debug-log-viewer">
    <div class="debug-log-header">
      <span class="debug-log-title">🐛 Debug Console</span>
      <div class="debug-log-controls">
        <button class="debug-log-btn" @click="logStore.clear()">
          Clear (C)
        </button>
        <button class="debug-log-btn" @click="logStore.toggle()">
          Close (D)
        </button>
      </div>
    </div>
    <div ref="logContainer" class="debug-log-content">
      <div
        v-for="(log, index) in logStore.logs"
        :key="index"
        :class="['debug-log-entry', `debug-log-${log.type}`]"
      >
        <span class="debug-log-time">{{ log.timestamp }}</span>
        <span class="debug-log-icon">{{ getLogIcon(log.type) }}</span>
        <span class="debug-log-message" v-html="escapeHtml(log.message)"></span>
      </div>
    </div>
    <div class="debug-log-footer">
      Press D or ` to toggle | C to clear | ↑↓ to scroll
    </div>
  </div>
</template>
