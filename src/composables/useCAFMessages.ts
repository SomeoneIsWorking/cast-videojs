import { usePlayerStore } from "../stores/playerStore";
import { useLogStore } from "../stores/logStore";
import { CastReceiverContext } from "@/utils/CastReceiverContext";

export function useCAFMessages() {
  const playerStore = usePlayerStore();
  const logStore = useLogStore();

  function setupMessageInterceptors() {
    CastReceiverContext.playerManager.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD,
      handleLoadRequest
    );
  }

  function handleLoadRequest(
    loadRequestData: cast.framework.messages.LoadRequestData
  ) {
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

  return {
    setupMessageInterceptors,
  };
}
