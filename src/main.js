import "./style.css";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { RemoteControlHandler } from "./remoteControl.js";
import { DebugLogViewer } from "./debugViewer.js";

// Application states
const AppState = {
  LOADING: "loading",
  IDLE: "idle",
  ERROR: "error",
};

// Content states
const ContentState = {
  LOADING: "loading",
  BUFFERING: "buffering",
  PLAYING: "playback",
  PAUSED: "paused",
};

class VideojsCastReceiver {
  constructor() {
    this.player = null;
    this.castContext = null;
    this.playerManager = null;
    this.remoteControl = null;
    this.debugViewer = null;
    this.appElement = document.getElementById("app");
    this.currentAppState = AppState.LOADING;
    this.currentContentState = null;
    this.userActivityTimeout = null;
    this.debugMode = false;

    // UI elements
    this.elements = {
      mediaTitle: document.querySelector(".media-title"),
      mediaDescription: document.querySelector(".media-description"),
      thumbContainer: document.querySelector(".thumb-container"),
      textElapsed: document.querySelector(".text-elapsed"),
      textDuration: document.querySelector(".text-duration"),
      progressBar: document.querySelector(".progress-bar"),
      iconState: document.getElementById("icon-state"),
      errorMessage: document.querySelector(".error-message"),
      statusText: document.querySelector(".status-text"),
    };

    this.init();
  }

  init() {
    // Initialize debug viewer first so we can see all logs
    this.debugViewer = new DebugLogViewer();

    // Set initial loading state
    this.setAppState(AppState.LOADING);

    // Check for debug mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.debugMode = urlParams.get("debug") === "true";

    if (this.debugMode) {
      cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
      console.log("Debug mode enabled");
    }

    // Initialize Video.js player
    this.initPlayer();

    // Initialize Cast Receiver
    this.initCastReceiver();
  }

  initPlayer() {
    this.player = videojs("player", {
      controls: false,
      autoplay: false,
      preload: "auto",
      fluid: false,
      fill: true,
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
        nativeTextTracks: false,
      },
    });

    // Player event listeners
    this.player.on("loadstart", () => this.onLoadStart());
    this.player.on("loadedmetadata", () => this.onLoadedMetadata());
    this.player.on("play", () => this.onPlay());
    this.player.on("playing", () => this.onPlaying());
    this.player.on("pause", () => this.onPause());
    this.player.on("waiting", () => this.onWaiting());
    this.player.on("timeupdate", () => this.onTimeUpdate());
    this.player.on("ended", () => this.onEnded());
    this.player.on("error", (e) => this.onError(e));

    console.log("Video.js player initialized");
  }

  initCastReceiver() {
    try {
      if (typeof cast === "undefined") {
        console.error("Cast SDK not loaded");
        this.elements.statusText.textContent = "Error: Cast SDK not loaded";
        this.setAppState(AppState.ERROR);
        return;
      }

      this.castContext = cast.framework.CastReceiverContext.getInstance();
      this.playerManager = this.castContext.getPlayerManager();

      const options = new cast.framework.CastReceiverOptions();
      options.disableIdleTimeout = false;
      options.maxInactivity = 3600; // 1 hour

      // Intercept LOAD request
      this.playerManager.setMessageInterceptor(
        cast.framework.messages.MessageType.LOAD,
        (loadRequestData) => this.onLoadRequest(loadRequestData)
      );

      // Player manager event listeners
      this.playerManager.addEventListener(
        cast.framework.events.EventType.PLAY,
        () => this.handleCastPlay()
      );

      this.playerManager.addEventListener(
        cast.framework.events.EventType.PAUSE,
        () => this.handleCastPause()
      );

      this.playerManager.addEventListener(
        cast.framework.events.EventType.SEEK,
        (event) => this.handleCastSeek(event)
      );

      this.playerManager.addEventListener(
        cast.framework.events.EventType.EDIT_TRACKS_INFO,
        (event) => this.handleEditTracksInfo(event)
      );

      // Start the receiver
      this.castContext.start(options);
      console.log("Cast Receiver started");

      // Initialize remote control handler
      this.remoteControl = new RemoteControlHandler(
        this.player,
        this.playerManager
      );

      // Transition to IDLE state when receiver is ready
      // We use a small delay to ensure UI is ready
      setTimeout(() => {
        this.setAppState(AppState.IDLE);
        console.log("Receiver ready - waiting for cast");
      }, 500);
    } catch (e) {
      console.error('Error initializing Cast Receiver:', e);
      this.elements.statusText.textContent = 'Error initializing Cast: ' + e.message;
      this.setAppState(AppState.ERROR);
      
      // Show debug viewer on error
      if (this.debugViewer) {
        this.debugViewer.show();
      }
    }
  }

  onLoadRequest(loadRequestData) {
    console.log("Load request received:", loadRequestData);

    const media = loadRequestData.media;

    if (!media || !media.contentId) {
      console.error("Invalid media in load request");
      if (this.debugViewer) {
        this.debugViewer.show();
      }
      return loadRequestData;
    }


    // Check for debug mode in content URL
    try {
      const contentUrl = new URL(media.contentId);
      const debugParam = contentUrl.searchParams.get("debug");
      if (debugParam === "true" && !this.debugMode) {
        this.debugMode = true;
        cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
        console.log("Debug mode enabled from content URL");
      }
    } catch (e) {
      // Not a valid URL, ignore
    }

    // Update UI with metadata
    if (media.metadata) {
      if (media.metadata.title) {
        this.elements.mediaTitle.textContent = media.metadata.title;
      }
      if (media.metadata.subtitle) {
        this.elements.mediaDescription.textContent = media.metadata.subtitle;
      }
      if (media.metadata.images && media.metadata.images.length > 0) {
        this.elements.thumbContainer.src = media.metadata.images[0].url;
      }
    }

    // Load media in Video.js
    this.setContentState(ContentState.LOADING);

    const sources = [
      {
        src: media.contentId,
        type: media.contentType || "application/x-mpegURL",
      },
    ];

    this.player.src(sources);

    // Handle text tracks (subtitles)
    if (media.tracks) {
      media.tracks.forEach((track) => {
        if (track.type === "TEXT") {
          this.player.addRemoteTextTrack(
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

    return loadRequestData;
  }

  handleCastPlay() {
    console.log("Cast PLAY command");
    if (this.player) {
      this.player.play();
    }
  }

  handleCastPause() {
    console.log("Cast PAUSE command");
    if (this.player) {
      this.player.pause();
    }
  }

  handleCastSeek(event) {
    console.log("Cast SEEK command:", event);
    if (this.player && event.currentTime !== undefined) {
      this.player.currentTime(event.currentTime);
      this.setFlag("seek", true);
      setTimeout(() => this.setFlag("seek", false), 3000);
    }
  }

  handleEditTracksInfo(event) {
    console.log("Edit tracks info:", event);

    if (!event.requestData || !event.requestData.activeTrackIds) {
      return;
    }

    const activeTrackIds = event.requestData.activeTrackIds;

    // Handle text tracks
    const textTracks = this.player.textTracks();
    for (let i = 0; i < textTracks.length; i++) {
      textTracks[i].mode = "disabled";
    }

    activeTrackIds.forEach((trackId) => {
      // Find and enable the track
      for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i].id === trackId) {
          textTracks[i].mode = "showing";
        }
      }
    });

    // Handle audio tracks
    const audioTracks = this.player.audioTracks();
    if (audioTracks) {
      activeTrackIds.forEach((trackId) => {
        for (let i = 0; i < audioTracks.length; i++) {
          if (audioTracks[i].id === trackId) {
            audioTracks[i].enabled = true;
          } else {
            audioTracks[i].enabled = false;
          }
        }
      });
    }
  }

  // Player event handlers
  onLoadStart() {
    console.log("Player: loadstart");
    this.setContentState(ContentState.LOADING);
  }

  onLoadedMetadata() {
    console.log("Player: loadedmetadata");

    // Expose tracks to Cast framework
    this.updateCastTracks();
  }

  onPlay() {
    console.log("Player: play");
  }

  onPlaying() {
    console.log("Player: playing");
    this.setContentState(ContentState.PLAYING);
    this.elements.iconState.classList.add("playing");
  }

  onPause() {
    console.log("Player: pause");
    this.setContentState(ContentState.PAUSED);
    this.elements.iconState.classList.remove("playing");
  }

  onWaiting() {
    console.log("Player: waiting");
    this.setContentState(ContentState.BUFFERING);
  }

  onTimeUpdate() {
    const currentTime = this.player.currentTime();
    const duration = this.player.duration();

    if (!isNaN(currentTime) && !isNaN(duration)) {
      this.elements.textElapsed.textContent = this.formatTime(currentTime);
      this.elements.textDuration.textContent = this.formatTime(duration);

      const progress = (currentTime / duration) * 100;
      this.elements.progressBar.style.width = `${progress}%`;
    }

    this.resetUserActivityTimeout();
  }

  onEnded() {
    console.log("Player: ended");
    this.setContentState(null);
    this.setAppState(AppState.IDLE);
  }

  onError(e) {
    console.error("Player error:", e);
    const error = this.player.error();

    let errorMessage = "An error occurred during playback";
    if (error) {
      errorMessage = `Error ${error.code}: ${error.message}`;
    }

    this.elements.errorMessage.textContent = errorMessage;
    this.setAppState(AppState.ERROR);
    
    if (this.debugViewer) {
      this.debugViewer.show();
    }
  }


  updateCastTracks() {
    const tracks = [];
    let trackId = 1;

    // Add text tracks
    const textTracks = this.player.textTracks();
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
    const audioTracks = this.player.audioTracks();
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

  setAppState(state) {
    // Remove all app state classes
    this.appElement.classList.remove(
      "app-state-loading",
      "app-state-idle",
      "app-state-error"
    );

    // Add new state class
    if (state) {
      this.appElement.classList.add(`app-state-${state}`);
      this.currentAppState = state;

      // Update status text
      const statusMessages = {
        loading: "Initializing receiver...",
        idle: "Ready to Cast",
        error: "Error occurred",
      };

      if (this.elements.statusText) {
        this.elements.statusText.textContent = statusMessages[state] || state;
      }
    }
  }

  setContentState(state) {
    // Remove all content state classes
    this.appElement.classList.remove(
      "content-state-loading",
      "content-state-buffering",
      "content-state-playback",
      "content-state-paused"
    );

    // Add new state class
    if (state) {
      this.appElement.classList.add(`content-state-${state}`);
      this.currentContentState = state;
    }
  }

  setFlag(flag, enabled) {
    if (enabled) {
      this.appElement.classList.add(`flag-${flag}`);
    } else {
      this.appElement.classList.remove(`flag-${flag}`);
    }
  }

  resetUserActivityTimeout() {
    this.setFlag("user-inactive", false);

    if (this.userActivityTimeout) {
      clearTimeout(this.userActivityTimeout);
    }

    this.userActivityTimeout = setTimeout(() => {
      this.setFlag("user-inactive", true);
    }, 5000);
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) {
      return "0:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}

// Initialize the receiver when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new VideojsCastReceiver();
  });
} else {
  new VideojsCastReceiver();
}
