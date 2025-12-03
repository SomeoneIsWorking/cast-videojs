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

      // Set up CAF event listeners
      setupCAFEventListeners();

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

    // Load into Video.js player
    // This keeps Video.js and CAF in sync - both will have the same media loaded
    playerStore.loadMedia(media);
    playerStore.player?.play();
    // Return the loadRequestData so CAF can track the media state
    return loadRequestData;
  }

  function handlePlayRequest(data: any) {
    // CAF handles play through the bound media element
    // Just show controls briefly for visual feedback
    playerStore.showControlsBriefly();
    return data;
  }

  function handlePauseRequest(data: any) {
    // CAF handles pause through the bound media element
    playerStore.showControlsBriefly();
    return data;
  }

  function handleSeekRequest(data: any) {
    // CAF handles seeking through the bound media element
    // Show controls briefly for visual feedback
    if (data.currentTime !== undefined) {
      playerStore.showControlsBriefly();
    }
    return data;
  }

  function handleEditTracksInfo(data: any) {
    console.log("Edit tracks info:", data)

    return data;
  }

  function setupCAFEventListeners() {
    if (!playerManager.value) return;

    // Listen for CAF events
    playerManager.value.addEventListener(
      cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
      () => {
        console.log('CAF: Player load complete');
      }
    );

    playerManager.value.addEventListener(
      cast.framework.events.EventType.ERROR,
      (event: any) => {
        console.error('CAF Error:', event.detailedErrorCode, event.error);
        logStore.addLog('error', ['CAF Error:', event.detailedErrorCode]);
      }
    );
  }

  function syncVideoJsStateToCAF() {
    if (!playerManager.value || !playerStore.player) return;

    const player = playerStore.player;

    // Sync Video.js playback state to CAF's PlayerManager
    // This ensures the sender UI shows correct state
    player.on('play', () => {
      playerManager.value.broadcastStatus(true);
    });

    player.on('pause', () => {
      playerManager.value.broadcastStatus(true);
    });

    player.on('timeupdate', () => {
      playerManager.value.broadcastStatus(true);
    });

    player.on('ended', () => {
      playerManager.value.broadcastStatus(true);
    });

    player.on('loadedmetadata', () => {
      playerManager.value.broadcastStatus(true);
    });

    console.log('Video.js state sync to CAF enabled');
  }

  return {
    castContext,
    playerManager,
    initCastReceiver,
    syncVideoJsStateToCAF,
  };
}
