import { useLogStore } from "../stores/logStore";
import { useCAFMessages } from "./useCAFMessages";
import { useCAFEvents } from "./useCAFEvents";
import { useSubtitlesStore } from "@/stores/subtitlesStore";
import { CastReceiverContext } from "@/utils/CastReceiverContext";

function createReceiverOptions(): cast.framework.CastReceiverOptions {
  const options = new cast.framework.CastReceiverOptions();
  options.useShakaForHls = true;
  return options;
}

export function useCastReceiver(videoElement: HTMLVideoElement) {
  const logStore = useLogStore();
  const subtitlesStore = useSubtitlesStore();

  function initCastReceiver() {
    try {
      validateCastSDK();
      bindVideoElement();
      setupPlayerManager();

      const options = createReceiverOptions();
      CastReceiverContext.start(options);

      console.log("Cast Receiver started with native video element");
      return true;
    } catch (e) {
      console.error("Error initializing Cast Receiver:", e);
      logStore.show();
      throw e;
    }
  }

  function validateCastSDK() {
    if (typeof cast === "undefined") {
      console.error("Cast SDK not loaded");
      throw new Error("Cast SDK not loaded");
    }
  }

  function bindVideoElement() {
    CastReceiverContext.playerManager.setMediaElement(videoElement);
  }

  function setupPlayerManager() {
    // Set up message interceptors
    const { setupMessageInterceptors } = useCAFMessages();
    setupMessageInterceptors();

    // Set up event listeners with callback for when tracks are loaded
    const { setupEventListeners } = useCAFEvents(handleTracksAvailable);
    setupEventListeners();
  }

  function handleTracksAvailable() {
    const textTracks = CastReceiverContext.textTracks;
    if (textTracks.length === 0) {
      console.log("No text tracks available");
      return;
    }

    console.log(`Text tracks available: ${textTracks.length}`);

    // Auto-load subtitles for the first text track as an example
    subtitlesStore.loadSubtitleTrack(textTracks[0].trackId);
  }

  return {
    initCastReceiver,
    handleTracksAvailable,
  };
}
