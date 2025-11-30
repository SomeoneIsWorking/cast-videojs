/**
 * TV Remote Control Handler
 * Handles remote control input for changing video/audio/subtitle tracks
 */

export class RemoteControlHandler {
  constructor(player, playerManager, debugViewer) {
    this.player = player;
    this.playerManager = playerManager;
    this.menuVisible = false;
    this.currentMenu = null; // 'audio', 'subtitles', 'quality'
    this.selectedIndex = 0;
    this.debugViewer = debugViewer;
    this.init();
  }

  init() {
    // Listen for key events
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    console.log("Remote control handler initialized");
  }

  handleKeyPress(event) {
    const key = event.key;

    // Prevent default behavior for navigation keys
    event.preventDefault();

    switch (key) {
      case "ColorF0Red": // toggle debug
        this.debugViewer.toggle();
        break;
      case "ArrowUp":
        if (this.debugViewer.visible) {
          this.debugViewer.scrollUp();
          break;
        }
        this.navigateUp();
        break;
      case "ArrowDown":
        if (this.debugViewer.visible) {
          this.debugViewer.scrollDown();
          break;
        }
        this.navigateDown();
        break;
      case "ArrowLeft":
        this.navigateLeft();
        break;
      case "ArrowRight":
        this.navigateRight();
        break;
      case "Enter":
        this.select();
        break;
      case "Escape":
      case "Backspace":
        this.closeMenu();
        break;
      case "MediaTrackPrevious":
      case "MediaRewind":
        this.seekBackward();
        break;
      case "MediaTrackNext":
      case "MediaFastForward":
        this.seekForward();
        break;
      case "MediaPlayPause":
        this.togglePlayPause();
        break;
      // Custom keys for track selection
      case "a":
      case "A":
        this.toggleAudioTrackMenu();
        break;
      case "s":
      case "S":
        this.toggleSubtitleMenu();
        break;
      case "q":
      case "Q":
        this.toggleQualityMenu();
        break;
      default:
        console.log("Key pressed:", key, "Code:", event.keyCode);
    }
  }

  navigateUp() {
    if (!this.menuVisible) return;

    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    this.updateMenuUI();
  }

  navigateDown() {
    if (!this.menuVisible) return;

    const maxIndex = this.getMenuItemCount() - 1;
    this.selectedIndex = Math.min(maxIndex, this.selectedIndex + 1);
    this.updateMenuUI();
  }

  navigateLeft() {
    if (this.menuVisible) {
      this.closeMenu();
    } else {
      this.seekBackward();
    }
  }

  navigateRight() {
    if (!this.menuVisible) {
      this.seekForward();
    }
  }

  select() {
    if (!this.menuVisible) {
      this.togglePlayPause();
      return;
    }

    // Apply the selected track
    switch (this.currentMenu) {
      case "audio":
        this.selectAudioTrack(this.selectedIndex);
        break;
      case "subtitles":
        this.selectSubtitleTrack(this.selectedIndex);
        break;
      case "quality":
        this.selectQuality(this.selectedIndex);
        break;
    }

    this.closeMenu();
  }

  toggleAudioTrackMenu() {
    if (this.currentMenu === "audio") {
      this.closeMenu();
    } else {
      this.showAudioTrackMenu();
    }
  }

  toggleSubtitleMenu() {
    if (this.currentMenu === "subtitles") {
      this.closeMenu();
    } else {
      this.showSubtitleMenu();
    }
  }

  toggleQualityMenu() {
    if (this.currentMenu === "quality") {
      this.closeMenu();
    } else {
      this.showQualityMenu();
    }
  }

  showAudioTrackMenu() {
    const audioTracks = this.player.audioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      console.log("No audio tracks available");
      return;
    }

    this.currentMenu = "audio";
    this.selectedIndex = this.getCurrentAudioTrackIndex();
    this.menuVisible = true;
    this.renderMenu("Audio Tracks", this.getAudioTrackList());
  }

  showSubtitleMenu() {
    const textTracks = this.player.textTracks();
    if (!textTracks || textTracks.length === 0) {
      console.log("No subtitle tracks available");
      return;
    }

    this.currentMenu = "subtitles";
    this.selectedIndex = this.getCurrentSubtitleTrackIndex();
    this.menuVisible = true;
    this.renderMenu("Subtitles", this.getSubtitleTrackList());
  }

  showQualityMenu() {
    const qualityLevels = this.player.qualityLevels
      ? this.player.qualityLevels()
      : null;
    if (!qualityLevels || qualityLevels.length === 0) {
      console.log("No quality levels available");
      return;
    }

    this.currentMenu = "quality";
    this.selectedIndex = this.getCurrentQualityIndex();
    this.menuVisible = true;
    this.renderMenu("Quality", this.getQualityList());
  }

  closeMenu() {
    this.menuVisible = false;
    this.currentMenu = null;
    this.removeMenuUI();
  }

  selectAudioTrack(index) {
    const audioTracks = this.player.audioTracks();
    if (!audioTracks || index >= audioTracks.length) return;

    for (let i = 0; i < audioTracks.length; i++) {
      audioTracks[i].enabled = i === index;
    }

    console.log("Selected audio track:", index);
  }

  selectSubtitleTrack(index) {
    const textTracks = this.player.textTracks();
    if (!textTracks) return;

    // Index 0 = Off
    for (let i = 0; i < textTracks.length; i++) {
      textTracks[i].mode = "disabled";
    }

    if (index > 0 && index <= textTracks.length) {
      textTracks[index - 1].mode = "showing";
    }

    console.log("Selected subtitle track:", index);
  }

  selectQuality(index) {
    const qualityLevels = this.player.qualityLevels
      ? this.player.qualityLevels()
      : null;
    if (!qualityLevels || index >= qualityLevels.length) return;

    // Disable all quality levels
    for (let i = 0; i < qualityLevels.length; i++) {
      qualityLevels[i].enabled = false;
    }

    // Enable selected quality
    qualityLevels[index].enabled = true;

    console.log("Selected quality:", index);
  }

  getCurrentAudioTrackIndex() {
    const audioTracks = this.player.audioTracks();
    if (!audioTracks) return 0;

    for (let i = 0; i < audioTracks.length; i++) {
      if (audioTracks[i].enabled) return i;
    }
    return 0;
  }

  getCurrentSubtitleTrackIndex() {
    const textTracks = this.player.textTracks();
    if (!textTracks) return 0;

    for (let i = 0; i < textTracks.length; i++) {
      if (textTracks[i].mode === "showing") return i + 1;
    }
    return 0; // Off
  }

  getCurrentQualityIndex() {
    const qualityLevels = this.player.qualityLevels
      ? this.player.qualityLevels()
      : null;
    if (!qualityLevels) return 0;

    for (let i = 0; i < qualityLevels.length; i++) {
      if (qualityLevels[i].enabled) return i;
    }
    return 0;
  }

  getAudioTrackList() {
    const audioTracks = this.player.audioTracks();
    const list = [];

    for (let i = 0; i < audioTracks.length; i++) {
      const track = audioTracks[i];
      list.push({
        label: track.label || `Audio ${i + 1}`,
        active: track.enabled,
      });
    }

    return list;
  }

  getSubtitleTrackList() {
    const textTracks = this.player.textTracks();
    const list = [{ label: "Off", active: true }];

    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      list.push({
        label: track.label || `Subtitle ${i + 1}`,
        active: track.mode === "showing",
      });
      if (track.mode === "showing") {
        list[0].active = false;
      }
    }

    return list;
  }

  getQualityList() {
    const qualityLevels = this.player.qualityLevels
      ? this.player.qualityLevels()
      : null;
    const list = [];

    if (!qualityLevels) return list;

    for (let i = 0; i < qualityLevels.length; i++) {
      const level = qualityLevels[i];
      list.push({
        label: `${level.height}p`,
        active: level.enabled,
      });
    }

    return list;
  }

  getMenuItemCount() {
    switch (this.currentMenu) {
      case "audio":
        return this.player.audioTracks() ? this.player.audioTracks().length : 0;
      case "subtitles":
        return (
          (this.player.textTracks() ? this.player.textTracks().length : 0) + 1
        ); // +1 for "Off"
      case "quality":
        return this.player.qualityLevels
          ? this.player.qualityLevels().length
          : 0;
      default:
        return 0;
    }
  }

  renderMenu(title, items) {
    this.removeMenuUI();

    const menuContainer = document.createElement("div");
    menuContainer.className = "remote-menu";
    menuContainer.innerHTML = `
      <div class="remote-menu-content">
        <h3 class="remote-menu-title">${title}</h3>
        <ul class="remote-menu-list">
          ${items
            .map(
              (item, index) => `
            <li class="remote-menu-item ${
              index === this.selectedIndex ? "selected" : ""
            } ${item.active ? "active" : ""}">
              ${item.label}
            </li>
          `
            )
            .join("")}
        </ul>
        <div class="remote-menu-hint">Use ↑↓ to navigate, Enter to select, Esc to close</div>
      </div>
    `;

    document.body.appendChild(menuContainer);
  }

  updateMenuUI() {
    const items = document.querySelectorAll(".remote-menu-item");
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    });
  }

  removeMenuUI() {
    const menu = document.querySelector(".remote-menu");
    if (menu) {
      menu.remove();
    }
  }

  seekBackward() {
    const currentTime = this.player.currentTime();
    this.player.currentTime(Math.max(0, currentTime - 10));
  }

  seekForward() {
    const currentTime = this.player.currentTime();
    const duration = this.player.duration();
    this.player.currentTime(Math.min(duration, currentTime + 10));
  }

  togglePlayPause() {
    if (this.player.paused()) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }
}
