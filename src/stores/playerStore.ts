import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("player", () => {
  // State
  const videoElement = ref<HTMLVideoElement | null>(null);
  const menuVisible = ref(false);
  const currentMenu = ref<string | null>(null);
  const selectedIndex = ref(0);

  // Metadata
  const mediaTitle = ref("");
  const mediaDescription = ref("");
  const thumbUrl = ref("");

  // Actions
  function setVideoElement(element: HTMLVideoElement) {
    videoElement.value = element;
  }

  function showMenu(menu: "audio" | "subtitles") {
    currentMenu.value = menu;
    menuVisible.value = true;
  }

  function closeMenu() {
    menuVisible.value = false;
    currentMenu.value = null;
  }

  function toggleMenu(menu: "audio" | "subtitles") {
    if (currentMenu.value === menu) {
      closeMenu();
    } else {
      showMenu(menu);
    }
  }

  function seekBackward() {
    if (!videoElement.value) return;
    videoElement.value.currentTime = Math.max(0, videoElement.value.currentTime - 10);
  }

  function seekForward() {
    if (!videoElement.value) return;
    const duration = videoElement.value.duration || 0;
    videoElement.value.currentTime = Math.min(duration, videoElement.value.currentTime + 10);
  }

  function togglePlayPause() {
    if (!videoElement.value) return;

    if (videoElement.value.paused) {
      videoElement.value.play();
    } else {
      videoElement.value.pause();
    }
  }

  function updateMetadata(metadata: any) {
    if (!metadata) return;
    if (metadata.title) mediaTitle.value = metadata.title;
    if (metadata.subtitle) mediaDescription.value = metadata.subtitle;
    if (metadata.images && metadata.images.length > 0) {
      thumbUrl.value = metadata.images[0].url;
    }
  }

  return {
    // State
    videoElement,
    selectedIndex,
    mediaTitle,
    mediaDescription,
    thumbUrl,

    // Actions
    setVideoElement,
    showMenu,
    closeMenu,
    toggleMenu,
    seekBackward,
    seekForward,
    togglePlayPause,
    updateMetadata,
  };
});
