import { ref } from "vue";
import { usePlayerStore } from "../stores/playerStore";
import { useLogStore } from "../stores/logStore";
import { useAppStore, AppState } from "../stores/appStore";

export function useCastReceiver(videoElement: HTMLVideoElement) {
  const playerStore = usePlayerStore();
  const logStore = useLogStore();
  const appStore = useAppStore();

  const castContext = ref<any>(null);
  const playerManager = ref<any>(null);

  function initCastReceiver() {
    try {
      if (typeof cast === "undefined") {
        console.error("Cast SDK not loaded");
        throw new Error("Cast SDK not loaded");
      }

      castContext.value = cast.framework.CastReceiverContext.getInstance();
      playerManager.value = castContext.value.getPlayerManager();

      // Bind CAF to the native video element
      playerManager.value.setMediaElement(videoElement);

      const options = new cast.framework.CastReceiverOptions();
      const playbackConfig = new cast.framework.PlaybackConfig();
      playbackConfig.shakaConfig = {
        streaming: {
          bufferingGoal: 15,
          rebufferingGoal: 2,
          bufferBehind: 5,
          retryParameters: {
            timeout: 20000,
            stallTimeout: 6000,
            connectionTimeout: 15000,
            maxAttempts: 120,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5,
          },
        },
        abr: {
          bandwidthDowngradeTarget: 0.95,
          bandwidthUpgradeTarget: 0.85,
          defaultBandwidthEstimate: 10000,
          enabled: true,
          switchInterval: 5,
        },
        manifest: {
          disableAudio: false,
          disableVideo: false,
        },
      }; // set the config values

      options.playbackConfig = playbackConfig;
      options.useShakaForHls = true;
      options.shakaVersion = "4.16.11";

      // Set up message interceptors
      setupMessageInterceptors();

      // Set up CAF event listeners
      setupCAFEventListeners();

      // Start the receiver
      castContext.value.start(options);
      console.log("Cast Receiver started with native video element");

      return true;
    } catch (e) {
      console.error("Error initializing Cast Receiver:", e);
      logStore.show();
      throw e;
    }
  }

  function setupMessageInterceptors() {
    if (!playerManager.value) return;

    // Intercept LOAD request to update metadata
    playerManager.value.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD,
      handleLoadRequest
    );
  }

  function handleLoadRequest(loadRequestData: any) {
    console.log("Load request received:", loadRequestData);

    const media = loadRequestData.media;

    if (!media || !media.contentId) {
      console.error("Invalid media in load request");
      logStore.show();
      return loadRequestData;
    }

    // Update metadata in store for UI display
    if (media.metadata) {
      playerStore.updateMetadata(media.metadata);
    }

    // CAF will handle loading the media into the video element
    return loadRequestData;
  }

  function setupCAFEventListeners() {
    if (!playerManager.value) return;

    // Listen for player state changes
    playerManager.value.addEventListener(
      cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
      () => {
        console.log("CAF: Player load complete");
        appStore.setAppState(AppState.BUFFERING);
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.PLAYING,
      () => {
        console.log("CAF: Playing");
        appStore.setAppState(AppState.PLAYING);
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.PAUSE,
      () => {
        console.log("CAF: Paused");
        appStore.setAppState(AppState.PAUSED);
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.BUFFERING,
      () => {
        console.log("CAF: Buffering");
        appStore.setAppState(AppState.BUFFERING);
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.ENDED,
      () => {
        console.log("CAF: Ended");
        appStore.setAppState(AppState.IDLE);
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.TIME_UPDATE,
      (event: any) => {
        const currentTime = event.currentMediaTime || 0;
        const duration = playerManager.value.getDurationSec() || 0;
        appStore.setCurrentTime(currentTime);
        appStore.setDuration(duration);
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.ERROR,
      (event: any) => {
        console.error("CAF Error:", event.detailedErrorCode, event.error);
        const errorMessage = `CAF Error: ${
          event.detailedErrorCode || "Unknown error"
        }`;
        appStore.setError(errorMessage);
        logStore.addLog("error", ["CAF Error:", event.detailedErrorCode]);
        logStore.show();
      }
    );
  }

  return {
    castContext,
    playerManager,
    initCastReceiver,
  };
}
