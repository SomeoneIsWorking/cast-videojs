import { CastReceiverContext } from "@/utils/CastReceiverContext";
import { useAppStore, AppState } from "../stores/appStore";
import { useLogStore } from "../stores/logStore";

export function useCAFEvents() {
  const appStore = useAppStore();
  const logStore = useLogStore();

  function setupEventListeners() {
    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
      handlePlayerLoadComplete
    );

    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.PLAYING,
      handlePlaying
    );

    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.PAUSE,
      handlePause
    );

    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.BUFFERING,
      handleBuffering
    );

    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.ENDED,
      handleEnded
    );

    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.TIME_UPDATE,
      handleTimeUpdate
    );

    CastReceiverContext.playerManager.addEventListener(
      cast.framework.events.EventType.ERROR,
      handleError
    );
  }

  function handlePlayerLoadComplete() {
    try {
      console.log("CAF: Player load complete");
      appStore.setAppState(AppState.BUFFERING);
    } catch (error) {
      console.error("Error in PLAYER_LOAD_COMPLETE handler:", error);
    }
  }

  function handlePlaying() {
    console.log("CAF: Playing");
    // If logs were shown due to an error, hide them now that playback resumed
    if (logStore.isLastShowReasonError) {
      logStore.hide();
    }
    appStore.setAppState(AppState.PLAYING);
  }

  function handlePause() {
    console.log("CAF: Paused");
    appStore.setAppState(AppState.PAUSED);
  }

  function handleBuffering() {
    console.log("CAF: Buffering");
    appStore.setAppState(AppState.BUFFERING);
  }

  function handleEnded() {
    console.log("CAF: Ended");
    appStore.setAppState(AppState.IDLE);
  }

  function handleTimeUpdate(event: cast.framework.events.TimeUpdateEvent) {
    const currentTime = event.currentMediaTime || 0;
    const duration = CastReceiverContext.playerManager.getDurationSec() || 0;
    appStore.setCurrentTime(currentTime);
    appStore.setDuration(duration);
  }

  function handleError(event: cast.framework.events.ErrorEvent) {
    console.error("CAF Error:", event.detailedErrorCode, event.error);
    const errorMessage = `CAF Error: ${
      event.detailedErrorCode || "Unknown error"
    }`;
    appStore.setError(errorMessage);
    console.error("CAF Error details:", event);
    logStore.show(true);
  }

  return {
    setupEventListeners,
  };
}
