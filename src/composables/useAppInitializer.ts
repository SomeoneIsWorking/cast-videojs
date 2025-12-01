import { useAppStore, AppState } from "../stores/appStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useLogStore } from "../stores/logStore";
import { useVideoPlayer } from "./useVideoPlayer";
import { useCastReceiver } from "./useCastReceiver";

export function useAppInitializer() {
  const appStore = useAppStore();
  const settingsStore = useSettingsStore();
  const logStore = useLogStore();

  const { initPlayer } = useVideoPlayer("player");
  const { initCastReceiver } = useCastReceiver();

  async function initialize() {
    try {
      // Check for debug mode from URL
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get("debug") === "true";

      if (debugMode) {
        settingsStore.setDebugMode(true);
        if (typeof cast !== "undefined") {
          cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
        }
        console.log("Debug mode enabled");
        logStore.show();
      }

      // Initialize player
      initPlayer();

      // Initialize Cast Receiver
      await initCastReceiver();

      // Transition to IDLE state
      setTimeout(() => {
        appStore.setAppState(AppState.IDLE);
        console.log("Receiver ready - waiting for cast");
      }, 500);
    } catch (e) {
      console.error("Initialization error:", e);
      const message = e instanceof Error ? e.message : "Initialization failed";
      appStore.setError(message);
      logStore.show();
    }
  }

  return {
    initialize,
  };
}
