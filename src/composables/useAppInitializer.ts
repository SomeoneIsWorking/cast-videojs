import { useAppStore, AppState } from "../stores/appStore";
import { useLogStore } from "../stores/logStore";
import { useVideoPlayer } from "./useVideoPlayer";
import { useCastReceiver } from "./useCastReceiver";

export function useAppInitializer() {
  const appStore = useAppStore();
  const logStore = useLogStore();

  const { initPlayer } = useVideoPlayer("player");
  const { initCastReceiver, syncVideoJsStateToCAF } = useCastReceiver();

  async function initialize() {
    try {
      // Initialize player first
      initPlayer();

      // Initialize Cast Receiver
      initCastReceiver();

      // Sync Video.js playback state to CAF
      // This keeps the sender UI updated with actual playback state
      syncVideoJsStateToCAF();

      // Transition to IDLE state
      appStore.setAppState(AppState.IDLE);
      console.log("Receiver ready - waiting for cast");
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
