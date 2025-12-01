import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface LogEntry {
  type: 'log' | 'warn' | 'error' | 'info'
  timestamp: string
  message: string
}

export const useLogStore = defineStore('log', () => {
  // State
  const logs = ref<LogEntry[]>([])
  const maxLogs = ref(100)
  const visible = ref(false)
  const scrollPosition = ref(0)

  // Computed
  const logCount = computed(() => logs.value.length)

  // Actions
  function addLog(type: LogEntry['type'], args: any[]) {
    const timestamp = new Date().toLocaleTimeString()
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch (e) {
          return String(arg)
        }
      }
      return String(arg)
    }).join(' ')

    const log: LogEntry = {
      type,
      timestamp,
      message
    }

    logs.value.push(log)
    
    // Keep only the last maxLogs entries
    if (logs.value.length > maxLogs.value) {
      logs.value.shift()
    }
  }

  function clear() {
    logs.value = []
    scrollPosition.value = 0
  }

  function toggle() {
    visible.value = !visible.value
  }

  function show() {
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  function scrollUp() {
    scrollPosition.value = Math.max(0, scrollPosition.value - 50)
  }

  function scrollDown() {
    scrollPosition.value += 50
  }

  return {
    // State
    logs,
    maxLogs,
    visible,
    scrollPosition,
    
    // Computed
    logCount,
    
    // Actions
    addLog,
    clear,
    toggle,
    show,
    hide,
    scrollUp,
    scrollDown
  }
})
