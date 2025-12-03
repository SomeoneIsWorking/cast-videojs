import { defineStore } from "pinia";
import Player from "video.js/dist/types/player";
import { ref, shallowRef } from "vue";


export const usePlayerStore = defineStore("player", () => {
  // State
  const player = shallowRef<Player | null>(null);
  const playerManager = ref<any>(null);
  const menuVisible = ref(false);
  const currentMenu = ref<string | null>(null);
  const selectedIndex = ref(0);

  // Metadata
  const mediaTitle = ref("");
  const mediaDescription = ref("");
  const thumbUrl = ref("");

  // Actions
  function setPlayer(playerInstance: Player) {
    player.value = playerInstance;
  }

  function setPlayerManager(manager: any) {
    playerManager.value = manager;
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
    if (!player.value) return;
    const currentTime = player.value.currentTime()!;
    player.value.currentTime(Math.max(0, currentTime - 10));
  }

  function seekForward() {
    if (!player.value) return;
    const currentTime = player.value.currentTime()!;
    const duration = player.value.duration()!;
    player.value.currentTime(Math.min(duration, currentTime + 10));
  }

  function togglePlayPause() {
    if (!player.value) return;

    if (player.value.paused()) {
      player.value.play();
    } else {
      player.value.pause();
    }
  }

  function showControlsBriefly() {
    if (!player.value) return;

    // Force show controls
    const controlBar = player.value.getChild('controlBar');
    if (controlBar) {
      controlBar.show();
    }
    player.value.userActive(true);

    // Hide controls after 3 seconds
    setTimeout(() => {
      if (player.value) {
        player.value.userActive(false);
      }
    }, 3000);
  }

  function updateMetadata(metadata: any) {
    if (!metadata) return;
    if (metadata.title) mediaTitle.value = metadata.title;
    if (metadata.subtitle) mediaDescription.value = metadata.subtitle;
    if (metadata.images && metadata.images.length > 0) {
      thumbUrl.value = metadata.images[0].url;
    }
  }

  function loadMedia(media: any) {
    if (!player.value) return;

    const sources = [
      {
        src: media.contentId,
        type: media.contentType || "application/x-mpegURL",
      },
    ];

    player.value.src(sources);

    // Handle text tracks (subtitles)
    if (media.tracks) {
      media.tracks.forEach((track: any) => {
        if (track.type === "TEXT") {
          player.value!.addRemoteTextTrack(
            {
              kind: track.subtype || "subtitles",
              label: track.name,
              src: track.trackContentId,
              language: track.language,
            },
            false
          );
        }
      });
    }
  }

  return {
    // State
    player,
    playerManager,
    selectedIndex,
    mediaTitle,
    mediaDescription,
    thumbUrl,

    // Actions
    setPlayer,
    setPlayerManager,
    showMenu,
    closeMenu,
    toggleMenu,
    seekBackward,
    seekForward,
    togglePlayPause,
    showControlsBriefly,
    updateMetadata,
    loadMedia,
  };
});
