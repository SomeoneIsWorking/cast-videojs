import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { usePlayerStore } from "./playerStore";

type MenuType = "main" | "audio" | "subtitles" | "subtitle-settings";

interface MenuItem {
  id: string;
  label: string;
  active?: boolean;
  value?: string;
}

export const useSettingsStore = defineStore("settings", () => {
  const playerStore = usePlayerStore();

  // State
  const visible = ref(false);
  const currentMenu = ref<MenuType>("main");
  const selectedIndex = ref(0);

  // Subtitle settings
  const subtitleSize = ref<number>(100); // percentage
  const subtitleColor = ref<string>('#FFFFFF');
  const subtitleBackground = ref<string>('rgba(0, 0, 0, 0.75)');

  // Main menu items
  const mainMenuItems = computed(() => [
    { id: "audio", label: "Audio Track" },
    { id: "subtitles", label: "Subtitles" },
    { id: "subtitle-settings", label: "Subtitle Settings" },
  ]);

  // Audio track menu items
  const audioTrackItems = computed((): MenuItem[] => {
    if (!playerStore.videoElement) return [];
    
    const audioTracks = (playerStore.videoElement as any).audioTracks;
    if (!audioTracks) return [];
    
    const tracks = Array.from(audioTracks) as any[];
    return tracks.map((track, index) => ({
      id: `audio-${index}`,
      label: track.label || `Audio Track ${index + 1}`,
      active: track.enabled,
    }));
  });

  // Subtitle track menu items
  const subtitleTrackItems = computed((): MenuItem[] => {
    if (!playerStore.videoElement) return [];
    
    const tracks = Array.from(playerStore.videoElement.textTracks || []);
    const items: MenuItem[] = tracks
      .filter(track => track.kind === 'subtitles' || track.kind === 'captions')
      .map((track, index) => ({
        id: `subtitle-${index}`,
        label: track.label || `Subtitle ${index + 1}`,
        active: track.mode === 'showing',
      }));
    
    // Add "Off" option
    items.unshift({
      id: 'subtitle-off',
      label: 'Off',
      active: items.every(item => !item.active),
    });
    
    return items;
  });

  // Subtitle settings menu items
  const subtitleSettingsItems = computed((): MenuItem[] => [
    { 
      id: 'size', 
      label: 'Size',
      value: `${subtitleSize.value}%`
    },
    { 
      id: 'color', 
      label: 'Text Color',
      value: subtitleColor.value === '#FFFFFF' ? 'White' : 
             subtitleColor.value === '#FFFF00' ? 'Yellow' :
             subtitleColor.value === '#00FF00' ? 'Green' : 'Custom'
    },
    { 
      id: 'background', 
      label: 'Background',
      value: subtitleBackground.value === 'rgba(0, 0, 0, 0.75)' ? 'Dark' :
             subtitleBackground.value === 'rgba(0, 0, 0, 0.5)' ? 'Medium' :
             subtitleBackground.value === 'rgba(0, 0, 0, 0)' ? 'None' : 'Custom'
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

    if (item.id === 'size') {
      subtitleSize.value = Math.max(50, Math.min(200, subtitleSize.value + (direction * 10)));
      applySubtitleStyles();
    } else if (item.id === 'color') {
      const colors = ['#FFFFFF', '#FFFF00', '#00FF00'];
      const currentIndex = colors.indexOf(subtitleColor.value);
      const newIndex = (currentIndex + direction + colors.length) % colors.length;
      subtitleColor.value = colors[newIndex];
      applySubtitleStyles();
    } else if (item.id === 'background') {
      const backgrounds = ['rgba(0, 0, 0, 0.75)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0)'];
      const currentIndex = backgrounds.indexOf(subtitleBackground.value);
      const newIndex = (currentIndex + direction + backgrounds.length) % backgrounds.length;
      subtitleBackground.value = backgrounds[newIndex];
      applySubtitleStyles();
    }
  }

  function applySubtitleStyles() {
    if (!playerStore.videoElement) return;

    // Apply styles to ::cue pseudo-element via style tag
    let styleEl = document.getElementById('subtitle-styles') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'subtitle-styles';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      video::cue {
        font-size: ${subtitleSize.value}%;
        color: ${subtitleColor.value};
        background-color: ${subtitleBackground.value};
      }
    `;
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
          const trackIndex = parseInt(item.id.replace('audio-', ''));
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
      if (item && playerStore.videoElement) {
        const tracks = playerStore.videoElement.textTracks;
        if (tracks) {
          // Hide all tracks
          for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = 'hidden';
          }
          // Show selected track
          if (item.id !== 'subtitle-off') {
            const trackIndex = parseInt(item.id.replace('subtitle-', ''));
            if (tracks[trackIndex]) {
              tracks[trackIndex].mode = 'showing';
            }
          }
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
    adjustSubtitleSetting,
  };
});
