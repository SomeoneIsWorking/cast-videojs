import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { usePlayerStore } from "./playerStore";
import { useSubtitlesStore } from "./subtitlesStore";
import { CastReceiverContext } from "@/utils/CastReceiverContext";

type MenuType = "main" | "audio" | "subtitles" | "subtitle-settings";

interface MenuItem {
  id: string;
  label: string;
  active?: boolean;
  value?: string;
}

export const useSettingsStore = defineStore("settings", () => {
  const playerStore = usePlayerStore();
  const subtitlesStore = useSubtitlesStore();
  // State
  const visible = ref(false);
  const currentMenu = ref<MenuType>("main");
  const selectedIndex = ref(0);

  // Subtitle settings
  const subtitleSize = ref<number>(100); // percentage
  const subtitleColor = ref<string>("#FFFFFF");
  const subtitleBackground = ref<string>("rgba(0, 0, 0, 0.5)");

  // Main menu items
  const mainMenuItems = computed(() => [
    { id: "audio", label: "Audio Track" },
    { id: "subtitles", label: "Subtitles" },
    { id: "subtitle-settings", label: "Subtitle Settings" },
  ]);

  // Audio track menu items
  const audioTrackItems = computed((): MenuItem[] => {
    return CastReceiverContext.audioTracks.map((track, index) => ({
      id: `audio-${index}`,
      label: track.name || `Audio ${index + 1}`,
      active:
        CastReceiverContext.audioTracksManager.getActiveId() === track.trackId,
    }));
  });

  // Subtitle track menu items
  const subtitleTrackItems = computed((): MenuItem[] => {
    const textTracks = CastReceiverContext.textTracks;

    const items: MenuItem[] = textTracks.map((track, index) => ({
      id: `subtitle-${index}`,
      label: track.name || `Subtitle ${index + 1}`,
      active:
        CastReceiverContext.textTracksManager.getActiveIds().includes(track.trackId),
    }));

    // Add "Off" option
    items.unshift({
      id: "subtitle-off",
      label: "Off",
      active: items.every((item) => !item.active),
    });

    return items;
  });

  // Subtitle settings menu items
  const subtitleSettingsItems = computed((): MenuItem[] => [
    {
      id: "size",
      label: "Size",
      value: `${subtitleSize.value}%`,
    },
    {
      id: "color",
      label: "Text Color",
      value:
        subtitleColor.value === "#FFFFFF"
          ? "White"
          : subtitleColor.value === "#FFFF00"
          ? "Yellow"
          : subtitleColor.value === "#00FF00"
          ? "Green"
          : "Custom",
    },
    {
      id: "background",
      label: "Background",
      value:
        subtitleBackground.value === "rgba(0, 0, 0, 0.75)"
          ? "Dark"
          : subtitleBackground.value === "rgba(0, 0, 0, 0.5)"
          ? "Medium"
          : subtitleBackground.value === "rgba(0, 0, 0, 0)"
          ? "None"
          : "Custom",
    },
  ]);

  // Current menu items based on active menu
  const currentMenuItems = computed(() => {
    switch (currentMenu.value) {
      case "main":
        return mainMenuItems.value;
      case "audio":
        return audioTrackItems.value;
      case "subtitles":
        return subtitleTrackItems.value;
      case "subtitle-settings":
        return subtitleSettingsItems.value;
      default:
        return [];
    }
  });

  const menuTitle = computed(() => {
    switch (currentMenu.value) {
      case "main":
        return "Settings";
      case "audio":
        return "Audio Track";
      case "subtitles":
        return "Subtitles";
      case "subtitle-settings":
        return "Subtitle Settings";
      default:
        return "";
    }
  });

  // Actions
  function show() {
    visible.value = true;
    currentMenu.value = "main";
    selectedIndex.value = 0;
  }

  function hide() {
    visible.value = false;
    currentMenu.value = "main";
    selectedIndex.value = 0;
  }

  function toggle() {
    if (visible.value) {
      hide();
    } else {
      show();
    }
  }

  function navigateUp() {
    selectedIndex.value = Math.max(0, selectedIndex.value - 1);
  }

  function navigateDown() {
    const maxIndex = currentMenuItems.value.length - 1;
    selectedIndex.value = Math.min(maxIndex, selectedIndex.value + 1);
  }

  function navigateLeft() {
    // Go back to main menu if in submenu
    if (currentMenu.value !== "main") {
      currentMenu.value = "main";
      selectedIndex.value = 0;
    }
  }

  function navigateRight() {
    // Enter submenu if on main menu
    if (currentMenu.value === "main") {
      const selected = mainMenuItems.value[selectedIndex.value];
      if (selected) {
        currentMenu.value = selected.id as MenuType;
        selectedIndex.value = 0;
      }
    } else if (currentMenu.value === "subtitle-settings") {
      // Adjust subtitle settings with right arrow
      adjustSubtitleSetting(1);
    }
  }

  function adjustSubtitleSetting(direction: number) {
    const item = subtitleSettingsItems.value[selectedIndex.value];
    if (!item) return;

    if (item.id === "size") {
      subtitleSize.value = Math.max(
        50,
        Math.min(200, subtitleSize.value + direction * 10)
      );
    } else if (item.id === "color") {
      const colors = ["#FFFFFF", "#FFFF00", "#00FF00"];
      const currentIndex = colors.indexOf(subtitleColor.value);
      const newIndex =
        (currentIndex + direction + colors.length) % colors.length;
      subtitleColor.value = colors[newIndex];
    } else if (item.id === "background") {
      const backgrounds = [
        "rgba(0, 0, 0, 0.75)",
        "rgba(0, 0, 0, 0.5)",
        "rgba(0, 0, 0, 0)",
      ];
      const currentIndex = backgrounds.indexOf(subtitleBackground.value);
      const newIndex =
        (currentIndex + direction + backgrounds.length) % backgrounds.length;
      subtitleBackground.value = backgrounds[newIndex];
    }
  }

  function setSubtitleSize(size: number) {
    subtitleSize.value = Math.max(50, Math.min(200, Math.round(size)));
  }

  function selectCurrentItem() {
    if (currentMenu.value === "main") {
      // Enter submenu
      navigateRight();
    } else if (currentMenu.value === "audio") {
      // Select audio track
      const item = audioTrackItems.value[selectedIndex.value];
      if (item && playerStore.videoElement) {
        const audioTracks = (playerStore.videoElement as any).audioTracks;
        if (audioTracks) {
          // Disable all tracks
          for (let i = 0; i < audioTracks.length; i++) {
            audioTracks[i].enabled = false;
          }
          // Enable selected track
          const trackIndex = parseInt(item.id.replace("audio-", ""));
          if (audioTracks[trackIndex]) {
            audioTracks[trackIndex].enabled = true;
          }
        }
      }
      currentMenu.value = "main";
      selectedIndex.value = 0;
    } else if (currentMenu.value === "subtitles") {
      // Select subtitle track
      const item = subtitleTrackItems.value[selectedIndex.value];
      if (item.id === "subtitle-off") {
        // Clear manual subtitles
        subtitlesStore.clearSubtitles();
      } else {
        // Get the media info to find the track ID
        const textTracks = CastReceiverContext.textTracks;
        const trackIndex = parseInt(item.id.replace("subtitle-", ""));

        if (textTracks[trackIndex]) {
          // Load subtitle manually
          subtitlesStore.loadSubtitleTrack(textTracks[trackIndex].trackId);
          console.log("Text track changed to:", textTracks[trackIndex].name);
        }
      }
      currentMenu.value = "main";
      selectedIndex.value = 0;
    } else if (currentMenu.value === "subtitle-settings") {
      // Adjust setting with Enter (same as right arrow)
      adjustSubtitleSetting(1);
    }
  }

  return {
    // State
    visible,
    currentMenu,
    selectedIndex,
    subtitleSize,
    subtitleColor,
    subtitleBackground,

    // Computed
    currentMenuItems,
    menuTitle,

    // Actions
    show,
    hide,
    toggle,
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight,
    setSubtitleSize,
    selectCurrentItem,
    adjustSubtitleSetting,
  };
});
