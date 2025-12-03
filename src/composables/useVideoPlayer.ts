import { ref, onUnmounted, shallowRef } from "vue";
import videojs from "video.js";
import { usePlayerStore } from "../stores/playerStore";
import { useLogStore } from "../stores/logStore";
import { useAppStore } from "../stores/appStore";
import { ContentState, AppState } from "../stores/appStore";
import Player from "video.js/dist/types/player";

export function useVideoPlayer(elementId: string) {
  const playerStore = usePlayerStore();
  const logStore = useLogStore();
  const appStore = useAppStore();

  const player = shallowRef<Player | null>(null);
  const isReady = ref(false);

  function initPlayer() {
    player.value = videojs(elementId, {
      controls: true,
      autoplay: true,
      preload: "metadata",
      fluid: false,
      fill: true,
      errorDisplay: false,
      html5: {
        vhs: {
          overrideNative: false, // Use native HLS for hardware decoding
          limitRenditionByPlayerDimensions: true,
          bandwidth: 4194304,
        },
        nativeAudioTracks: true,
        nativeVideoTracks: true,
      },
    });

    // Set player in store
    playerStore.setPlayer(player.value!);

    // Set up event listeners
    setupEventListeners();

    // Set log level to warn to reduce overhead
    videojs.log.level("warn");

    console.log("Video.js player initialized");
    isReady.value = true;

    return player.value;
  }

  function setupEventListeners() {
    if (!player.value) return;

    player.value.on("loadstart", onLoadStart);
    player.value.on("loadedmetadata", onLoadedMetadata);
    player.value.on("play", onPlay);
    player.value.on("playing", onPlaying);
    player.value.on("pause", onPause);
    player.value.on("waiting", onWaiting);
    player.value.on("timeupdate", onTimeUpdate);
    player.value.on("ended", onEnded);
    player.value.on("error", onError);
  }

  function onLoadStart() {
    console.log("Player: loadstart");
    appStore.setAppState(AppState.ACTIVE);
    appStore.setContentState(ContentState.LOADING);
  }

  function onLoadedMetadata() {
    console.log("Player: loadedmetadata");
    updateCastTracks();
  }

  function onPlay() {
    console.log("Player: play");
  }

  function onPlaying() {
    console.log("Player: playing");
    appStore.setAppState(AppState.ACTIVE);
    appStore.setContentState(ContentState.PLAYING);
  }

  function onPause() {
    console.log("Player: pause");
    appStore.setContentState(ContentState.PAUSED);
  }

  function onWaiting() {
    console.log("Player: waiting");
    appStore.setContentState(ContentState.BUFFERING);
  }

  function onTimeUpdate() {
    if (player.value) {
      appStore.setCurrentTime(player.value.currentTime()!);
      appStore.setDuration(player.value.duration()!);
    }
  }

  function onEnded() {
    console.log("Player: ended");
    appStore.setContentState(null);
    appStore.setAppState(AppState.IDLE);
  }

  function onError(e: any) {
    console.error("Player error:", e);
    const error = player.value?.error();

    const errorMessage = error
      ? `Error ${error.code}: ${error.message}`
      : "An error occurred during playback";

    appStore.setError(errorMessage);
    logStore.addLog("error", [errorMessage]);
    logStore.show();
  }

  function updateCastTracks() {
    if (!player.value) return;

    const tracks = [];
    let trackId = 1;

    // Add text tracks
    const textTracks = player.value.textTracks().tracks_;
    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      tracks.push({
        trackId: trackId++,
        type: "TEXT",
        subtype: track.kind.toUpperCase(),
        name: track.label || `Track ${i + 1}`,
        language: track.language,
        trackContentId: track.src,
      });
    }

    // Add audio tracks
    const audioTracks = player.value.audioTracks().tracks_;
    if (audioTracks) {
      for (let i = 0; i < audioTracks.length; i++) {
        const track = audioTracks[i];
        tracks.push({
          trackId: trackId++,
          type: "AUDIO",
          name: track.label || `Audio ${i + 1}`,
          language: track.language,
          trackContentId: String(i),
        });
      }
    }

    console.log("Available tracks:", tracks);
  }

  function dispose() {
    if (player.value) {
      player.value.dispose();
      player.value = null;
      isReady.value = false;
    }
  }

  onUnmounted(() => {
    dispose();
  });

  return {
    player,
    isReady,
    initPlayer,
    dispose,
  };
}
