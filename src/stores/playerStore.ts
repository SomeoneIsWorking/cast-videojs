import { defineStore } from "pinia";
import Player from "video.js/dist/types/player";
import { ref, computed, shallowRef } from "vue";

interface TrackItem {
  index: number;
  label: string;
  active: boolean;
  language?: string;
}

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

  // Computed
  const audioTracks = computed<TrackItem[]>(() => {
    if (!player.value) return [];
    const tracks = player.value.audioTracks().tracks_;
    if (!tracks) return []; // Keep this check as player.value.audioTracks() might return null/undefined
    const list: TrackItem[] = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      list.push({
        index: i,
        label: track.label || `Audio ${i + 1}`,
        active: track.enabled,
        language: track.language || "",
      });
    }
    return list;
  });

  const subtitleTracks = computed<TrackItem[]>(() => {
    if (!player.value) return [];
    const tracks = player.value.textTracks().tracks_;
    if (!tracks) return []; // Keep this check as player.value.textTracks() might return null/undefined
    const list: TrackItem[] = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      // Only show subtitles/captions
      if (track.kind === "subtitles" || track.kind === "captions") {
        list.push({
          index: i,
          label: track.label || `Subtitle ${i + 1}`,
          active: track.mode === "showing",
          language: track.language || "",
        });
      }
    }
    return list;
  });

  const currentAudioTrackIndex = computed(() => {
    if (!player.value) return 0;
    const tracks = player.value.audioTracks().tracks_;
    if (!tracks) return 0;

    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].enabled) return i;
    }
    return 0;
  });

  const currentSubtitleTrackIndex = computed(() => {
    if (!player.value) return 0;
    const tracks = player.value.textTracks().tracks_;
    if (!tracks) return 0;

    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].mode === "showing") return i + 1;
    }
    return 0;
  });

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

    // Set initial selected index based on current track
    if (menu === "audio") {
      selectedIndex.value = currentAudioTrackIndex.value;
    } else if (menu === "subtitles") {
      selectedIndex.value = currentSubtitleTrackIndex.value;
    }
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

  function navigateUp() {
    if (!menuVisible.value) return;
    selectedIndex.value = Math.max(0, selectedIndex.value - 1);
  }

  function navigateDown() {
    if (!menuVisible.value) return;

    let maxIndex = 0;
    if (currentMenu.value === "audio") {
      maxIndex = audioTracks.value.length - 1;
    } else if (currentMenu.value === "subtitles") {
      maxIndex = subtitleTracks.value.length - 1;
    }

    selectedIndex.value = Math.min(maxIndex, selectedIndex.value + 1);
  }

  function selectAudioTrack(index: number) {
    if (!player.value) return;
    const tracks = player.value.audioTracks().tracks_;
    if (!tracks || index >= tracks.length) return;

    for (let i = 0; i < tracks.length; i++) {
      tracks[i].enabled = i === index;
    }

    console.log("Selected audio track:", index);
  }

  function selectSubtitleTrack(index: number) {
    if (!player.value) return;
    const tracks = player.value.textTracks().tracks_;
    if (!tracks) return;

    // Index 0 = Off
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = "disabled";
    }

    if (index > 0 && index <= tracks.length) {
      tracks[index - 1].mode = "showing";
    }

    console.log("Selected subtitle track:", index);
  }

  function selectCurrentMenuItem() {
    if (!menuVisible.value) return;

    if (currentMenu.value === "audio") {
      selectAudioTrack(selectedIndex.value);
    } else if (currentMenu.value === "subtitles") {
      selectSubtitleTrack(selectedIndex.value);
    }

    closeMenu();
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
    menuVisible,
    currentMenu,
    selectedIndex,
    mediaTitle,
    mediaDescription,
    thumbUrl,

    // Computed
    audioTracks,
    subtitleTracks,
    currentAudioTrackIndex,
    currentSubtitleTrackIndex,
    // Actions
    setPlayer,
    setPlayerManager,
    showMenu,
    closeMenu,
    toggleMenu,
    navigateUp,
    navigateDown,
    selectAudioTrack,
    selectSubtitleTrack,
    selectCurrentMenuItem,
    seekBackward,
    seekForward,
    togglePlayPause,
    updateMetadata,
    loadMedia,
  };
});
