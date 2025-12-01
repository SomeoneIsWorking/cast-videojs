import { ref } from "vue";
import { usePlayerStore } from "../stores/playerStore";
import { useLogStore } from "../stores/logStore";
import { useSettingsStore } from "../stores/settingsStore";

export function useCastReceiver() {
  const playerStore = usePlayerStore();
  const logStore = useLogStore();
  const settingsStore = useSettingsStore();

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
      options.disableIdleTimeout = false;
      options.maxInactivity = settingsStore.maxInactivity;

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
    loadRequestData.media.hlsSegmentFormat =
      cast.framework.messages.HlsSegmentFormat.TS;
    console.log("Load request received:", loadRequestData);

    const media = loadRequestData.media;

    if (!media || !media.contentId) {
      console.error("Invalid media in load request");
      logStore.show();
      return loadRequestData;
    }

    // Update metadata in store
    if (media.metadata) {
      playerStore.updateMetadata(media.metadata);
    }

    // Load media
    playerStore.loadMedia(media);

    // Handle autoplay
    if (loadRequestData.autoplay && settingsStore.autoplay) {
      console.log("Autoplay requested");
      setTimeout(() => {
        playerStore.player?.play();
      }, 100);
    }

    return loadRequestData;
  }

  function handlePlayRequest(data: any) {
    console.log("Cast PLAY command");
    if (playerStore.player) {
      playerStore.player.play();
    }
    return data;
  }

  function handlePauseRequest(data: any) {
    console.log("Cast PAUSE command");
    if (playerStore.player) {
      playerStore.player.pause();
    }
    return data;
  }

  function handleSeekRequest(data: any) {
    console.log("Cast SEEK command:", data);
    if (playerStore.player && data.currentTime !== undefined) {
      playerStore.player.currentTime(data.currentTime);
    }
    return data;
  }

  function handleEditTracksInfo(data: any) {
    console.log("Edit tracks info:", data);

    if (!data || !data.activeTrackIds || !playerStore.player) {
      return data;
    }

    const activeTrackIds = data.activeTrackIds;

    // Handle text tracks
    const textTracks = playerStore.player.textTracks();
    for (let i = 0; i < textTracks.length; i++) {
      textTracks[i].mode = "disabled";
    }

    activeTrackIds.forEach((trackId: any) => {
      for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i].id == trackId || textTracks[i].src == trackId) {
          textTracks[i].mode = "showing";
        }
      }
    });

    // Handle audio tracks
    const audioTracks = playerStore.player.audioTracks();
    if (audioTracks) {
      activeTrackIds.forEach((trackId: any) => {
        for (let i = 0; i < audioTracks.length; i++) {
          if (String(i) == String(trackId)) {
            audioTracks[i].enabled = true;
          } else {
            audioTracks[i].enabled = false;
          }
        }
      });
    }

    return data;
  }

  return {
    castContext,
    playerManager,
    initCastReceiver,
  };
}
