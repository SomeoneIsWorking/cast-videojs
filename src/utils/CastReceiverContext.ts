export class CastReceiverContext {
  static get instance() {
    return cast.framework.CastReceiverContext.getInstance();
  }

  static get playerManager() {
    return this.instance.getPlayerManager();
  }

  static start(options: cast.framework.CastReceiverOptions) {
    this.instance.start(options);
  }

  static get textTracksManager() {
    return this.playerManager.getTextTracksManager();
  }

  static get audioTracksManager() {
    return this.playerManager.getAudioTracksManager();
  }

  static get textTracks() {
    return this.textTracksManager.getTracks();
  }

  static get audioTracks() {
    return this.audioTracksManager.getTracks();
  }
}
