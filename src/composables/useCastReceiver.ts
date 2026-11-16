import { useLogStore } from "../stores/logStore";
import { useCAFMessages } from "./useCAFMessages";
import { useCAFEvents } from "./useCAFEvents";
import { CastReceiverContext } from "@/utils/CastReceiverContext";

function createReceiverOptions(): cast.framework.CastReceiverOptions {
  const options = new cast.framework.CastReceiverOptions();
  options.useShakaForHls = true;

  // Place HLS segments by their own timestamps instead of appending them back
  // to back. wails-cast transcodes every segment on its own, and each AAC
  // encode adds ~21ms of encoder lead-in, so a segment's audio runs slightly
  // longer than its video. In Shaka's default sequence mode that surplus is
  // stacked onto every following segment and the audio drifts further behind
  // the picture over time (until a seek flushes the buffer). With timestamps
  // honoured, the surplus just overlaps the next segment and nothing builds up.
  const playbackConfig = new cast.framework.PlaybackConfig();
  playbackConfig.shakaConfig = {
    manifest: { hls: { sequenceMode: false } },
  };
  options.playbackConfig = playbackConfig;
  return options;
}

export function useCastReceiver(videoElement: HTMLVideoElement) {
  const logStore = useLogStore();

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
    const { setupEventListeners } = useCAFEvents();
    setupEventListeners();
  }

  return {
    initCastReceiver,
  };
}
