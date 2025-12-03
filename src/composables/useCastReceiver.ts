import { ref } from "vue";
import { usePlayerStore } from "../stores/playerStore";
import { useLogStore } from "../stores/logStore";

export function useCastReceiver() {
  const playerStore = usePlayerStore();
  const logStore = useLogStore();

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

      // Set player manager in store
      playerStore.setPlayerManager(playerManager.value);

      const options = new cast.framework.CastReceiverOptions();
      options.useShakaForHls = true;
      options.disableIdleTimeout = true;

      // Reduce CAF logging to improve performance
      castContext.value.setLoggerLevel(cast.framework.LoggerLevel.WARNING);

      // Set up message interceptors
      setupMessageInterceptors();

      // Start the receiver
      castContext.value.start(options);
      console.log("Cast Receiver started");

      return true;
    } catch (e) {
      console.error("Error initializing Cast Receiver:", e);
      logStore.show();
      throw e;
    }
  }

  function setupMessageInterceptors() {
    if (!playerManager.value) return;

    // Intercept LOAD request
    playerManager.value.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD,
      handleLoadRequest
    );

    // Intercept PLAY request
    playerManager.value.setMessageInterceptor(
      cast.framework.messages.MessageType.PLAY,
      handlePlayRequest
    );

    // Intercept PAUSE request
    playerManager.value.setMessageInterceptor(
      cast.framework.messages.MessageType.PAUSE,
      handlePauseRequest
    );

    // Intercept SEEK request
    playerManager.value.setMessageInterceptor(
      cast.framework.messages.MessageType.SEEK,
      handleSeekRequest
    );

    // Intercept EDIT_TRACKS_INFO request
    playerManager.value.setMessageInterceptor(
      cast.framework.messages.MessageType.EDIT_TRACKS_INFO,
      handleEditTracksInfo
    );
  }

  function handleLoadRequest(loadRequestData: any) {
    console.log("Load request received:", loadRequestData);

    const media = loadRequestData.media;

    if (!media || !media.contentId) {
      console.error("Invalid media in load request");
      logStore.show();
      return null;
    }

    // Update metadata in store
    if (media.metadata) {
      playerStore.updateMetadata(media.metadata);
    }

    // Load media into Video.js only
    playerStore.loadMedia(media);

    return media;
  }

  function handlePlayRequest(data: any) {
    playerStore.player?.play();
    return data;
  }

  function handlePauseRequest(data: any) {
    playerStore.player?.pause();
    return data;
  }

  function handleSeekRequest(data: any) {
    if (data.currentTime !== undefined) {
      playerStore.player?.currentTime(data.currentTime);
      playerStore.showControlsBriefly();
    }
    return data;
  }

  function handleEditTracksInfo(data: any) {
    console.log("Edit tracks info:", data);

    if (!data || !data.activeTrackIds || !playerStore.player) {
      return data;
    }

    return data;
  }

  return {
    castContext,
    playerManager,
    initCastReceiver,
  };
}
