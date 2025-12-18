import { usePlayerStore } from "../stores/playerStore";
import { useLogStore } from "../stores/logStore";
import { useSubtitlesStore } from "../stores/subtitlesStore";
import { useSettingsStore } from "../stores/settingsStore";
import { CastReceiverContext } from "@/utils/CastReceiverContext";

const namespace = "urn:x-cast:com.barishamil.receiver";

export function useCAFMessages() {
  const playerStore = usePlayerStore();
  const logStore = useLogStore();

  function setupMessageInterceptors() {
    CastReceiverContext.playerManager.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD,
      handleLoadRequest
    );
    CastReceiverContext.instance.addCustomMessageListener<{
      type: string;
      data: any;
    }>(namespace, (event) => {
      switch (event.data.type) {
        case "subtitles":
          {
            const subtitlesStore = useSubtitlesStore();
            const url = event.data.data;
            console.log("Received subtitles command:", url);
            subtitlesStore.loadSubtitles(url);
          }
          break;
        case "subtitleSize":
          {
            const settingsStore = useSettingsStore();
            const size = Number(event.data.data);
            console.log("Received subtitleSize command:", size);
            settingsStore.setSubtitleSize(size);
          }
          break;
        default:
          console.warn(
            "Unknown custom message type received:",
            event.data.type
          );
      }
    });
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
