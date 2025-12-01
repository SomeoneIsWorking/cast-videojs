import { onMounted } from 'vue'
import { useLogStore } from '../stores/logStore'

export function useConsoleInterceptor() {
  const logStore = useLogStore()

  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  }

  function interceptConsole() {
    const methods = ['log', 'warn', 'error', 'info'] as const

    methods.forEach(method => {
      console[method] = (...args: any[]) => {
        // Call original console method
        originalConsole[method].apply(console, args)
        
        // Add to log store
        logStore.addLog(method, args)
      }
    })
  }

  function restoreConsole() {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.info = originalConsole.info
  }

  onMounted(() => {
    interceptConsole()
  })

  return {
    interceptConsole,
    restoreConsole
  }
}
