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

<style scoped>
.debug-log-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  font-family: "Courier New", monospace;
}

.debug-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(30, 30, 30, 0.95);
  border-bottom: 2px solid #4caf50;
}

.debug-log-title {
  color: #4caf50;
  font-size: 1.4rem;
  font-weight: 600;
}

.debug-log-controls {
  display: flex;
  gap: 0.5rem;
}

.debug-log-btn {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.debug-log-btn:hover {
  background: rgba(76, 175, 80, 0.3);
}

.debug-log-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.debug-log-entry {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  font-size: 0.95rem;
}

.debug-log-entry:hover {
  background: rgba(255, 255, 255, 0.05);
}

.debug-log-time {
  color: #888;
  min-width: 80px;
  flex-shrink: 0;
}

.debug-log-icon {
  flex-shrink: 0;
}

.debug-log-message {
  color: #ccc;
  word-break: break-word;
  white-space: pre-wrap;
}

.debug-log-log .debug-log-message {
  color: #ccc;
}

.debug-log-info .debug-log-message {
  color: #2196f3;
}

.debug-log-warn .debug-log-message {
  color: #ff9800;
}

.debug-log-error .debug-log-message {
  color: #f44336;
}

.debug-log-footer {
  padding: 0.75rem 1.5rem;
  background: rgba(30, 30, 30, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 0.85rem;
  text-align: center;
}
</style>
