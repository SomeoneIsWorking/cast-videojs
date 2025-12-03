import { ref } from "vue";

export function useVideoPlayer(elementId: string) {
  const videoElement = ref<HTMLVideoElement | null>(null);
  const isReady = ref(false);

  function initPlayer() {
    const element = document.getElementById(elementId) as HTMLVideoElement;
    
    if (!element) {
      console.error(`Video element with id "${elementId}" not found`);
      return null;
    }

    videoElement.value = element;
    isReady.value = true;

    console.log("Native video element initialized");
    return element;
  }

  return {
    videoElement,
    isReady,
    initPlayer,
  };
}
