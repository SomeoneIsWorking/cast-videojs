import { useAppStore, AppState } from "../stores/appStore";
import { useLogStore } from "../stores/logStore";
import { usePlayerStore } from "../stores/playerStore";
import { useVideoPlayer } from "./useVideoPlayer";
import { useCastReceiver } from "./useCastReceiver";

export function useAppInitializer() {
  const appStore = useAppStore();
  const logStore = useLogStore();
  const playerStore = usePlayerStore();

  const { initPlayer } = useVideoPlayer("player");

  async function initialize() {
    try {
      // Initialize native video element
      const videoElement = initPlayer();
      
      if (!videoElement) {
        throw new Error("Failed to initialize video element");
      }

      // Store video element reference
      playerStore.setVideoElement(videoElement);

      // Initialize Cast Receiver with the video element
      const { initCastReceiver } = useCastReceiver(videoElement);
      initCastReceiver();

      // Transition to IDLE state
      appStore.setAppState(AppState.IDLE);
      console.log("Receiver ready - waiting for cast");
    } catch (e) {
      console.error("Initialization error:", e);
      const message = e instanceof Error ? e.message : "Initialization failed";
      appStore.setError(message);
      logStore.show(true);
    }
  }

  return {
    initialize,
  };
}
