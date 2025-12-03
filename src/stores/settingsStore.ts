import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { usePlayerStore } from "./playerStore";

type MenuType = "main" | "audio" | "subtitles";

export const useSettingsStore = defineStore("settings", () => {
  const playerStore = usePlayerStore();

  // State
  const visible = ref(false);
  const currentMenu = ref<MenuType>("main");
  const selectedIndex = ref(0);

  // General Settings
  const autoplay = ref(true);

  // Main menu items
  const mainMenuItems = computed(() => [
    { id: "audio", label: "Audio Track" },
    { id: "subtitles", label: "Subtitles" },
  ]);

  // Current menu items based on active menu
  const currentMenuItems = computed(() => {
    switch (currentMenu.value) {
      case "main":
        return mainMenuItems.value;
      case "audio":
        return playerStore.audioTracks;
      case "subtitles":
        return playerStore.subtitleTracks;
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
        // Set selected index to current active item
        if (selected.id === "audio") {
          selectedIndex.value = playerStore.currentAudioTrackIndex;
        } else if (selected.id === "subtitles") {
          selectedIndex.value = playerStore.currentSubtitleTrackIndex;
        }
      }
    }
  }

  function selectCurrentItem() {
    if (currentMenu.value === "main") {
      // Enter submenu
      navigateRight();
    } else {
      // Select track
      if (currentMenu.value === "audio") {
        playerStore.selectAudioTrack(selectedIndex.value);
      } else if (currentMenu.value === "subtitles") {
        playerStore.selectSubtitleTrack(selectedIndex.value);
      }
      // Go back to main menu after selection
      currentMenu.value = "main";
      selectedIndex.value = 0;
    }
  }

  return {
    // State
    visible,
    currentMenu,
    selectedIndex,
    autoplay,

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
    selectCurrentItem,
  };
});
