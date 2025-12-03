import { useAppStore, AppState } from "../stores/appStore";
import { useLogStore } from "../stores/logStore";
import { useVideoPlayer } from "./useVideoPlayer";
import { useCastReceiver } from "./useCastReceiver";

export function useAppInitializer() {
  const appStore = useAppStore();
  const logStore = useLogStore();

  const { initPlayer } = useVideoPlayer("player");
  const { initCastReceiver } = useCastReceiver();

  async function initialize() {
    try {
      // Initialize player
      initPlayer();

      // Initialize Cast Receiver
      initCastReceiver();

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
