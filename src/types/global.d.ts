// Type declarations for Cast SDK and Video.js

declare global {
  interface Window {
    debugViewer?: any
  }

  namespace cast {
    namespace framework {
      class CastReceiverContext {
        static getInstance(): CastReceiverContext;
        start(options?: CastReceiverOptions): void;
        getPlayerManager(): PlayerManager;
        stop(): void;
      }

      class CastReceiverOptions {
        playbackConfig?: PlaybackConfig;
        useShakaForHls?: boolean;
        shakaVersion?: string;
      }

      class PlaybackConfig {
        shakaConfig?: any;
        enableUITextDisplayer?: boolean;
      }

      class PlayerManager {
        setMediaElement(element: HTMLVideoElement): void;
        setMessageInterceptor(
          type: messages.MessageType,
          interceptor: (data: any) => any
        ): void;
        addEventListener(
          eventType: events.EventType,
          listener: (event: any) => void
        ): void;
        getMediaInformation(): messages.MediaInformation | null;
        getDurationSec(): number;
        getTextTracksManager(): TextTracksManager;
        getAudioTracksManager(): AudioTracksManager;
      }

      class TextTracksManager {
        getTracks(): messages.Track[];
        getTrackById(id: number): messages.Track | null;
        getTracksByLanguage(language: string): messages.Track[];
        getActiveIds(): number[];
        getActiveTracks(): messages.Track[];
        setActiveByIds(newIds: number[]): void;
        setActiveByLanguage(language: string): void;
        addTracks(tracks: messages.Track[]): void;
        createTrack(): messages.Track;
        getTextTracksStyle(): messages.TextTrackStyle | undefined;
        setTextTrackStyle(style: messages.TextTrackStyle): void;
      }

      class AudioTracksManager {
        getTracks(): messages.Track[];
        getTrackById(id: number): messages.Track | null;
        getActiveId(): number | null;
        getActiveTrack(): messages.Track | null;
        setActiveById(id: number): void;
        setActiveByLanguage(language: string): void;
      }

      namespace messages {
        class TextTrackStyle {
          backgroundColor?: string;
          foregroundColor?: string;
          fontScale?: number;
          fontFamily?: string;
          fontGenericFamily?: string;
          edgeType?: string;
          edgeColor?: string;
          windowColor?: string;
          windowRoundedCornerRadius?: number;
        }

        enum MessageType {
          LOAD = 'LOAD',
          PLAY = 'PLAY',
          PAUSE = 'PAUSE',
          SEEK = 'SEEK',
          STOP = 'STOP',
          EDIT_TRACKS_INFO = 'EDIT_TRACKS_INFO',
        }

        enum TrackType {
          TEXT = 'TEXT',
          AUDIO = 'AUDIO',
          VIDEO = 'VIDEO',
        }

        interface EditTracksInfoRequest {
          activeTrackIds?: number[];
        }

        interface TextTrackStyle {
          backgroundColor?: string;
          foregroundColor?: string;
          fontScale?: number;
          fontFamily?: string;
          fontGenericFamily?: string;
          edgeType?: string;
          edgeColor?: string;
          windowColor?: string;
          windowRoundedCornerRadius?: number;
        }

        interface MediaInformation {
          contentId: string;
          contentType: string;
          metadata?: any;
          tracks?: Track[];
        }

        interface Track {
          trackId: number;
          type: TrackType;
          name?: string;
          language?: string;
          subtype?: string;
          trackContentId?: string;
          trackContentType?: string;
        }

        interface LoadRequestData {
          media: MediaInformation;
          activeTrackIds?: number[];
        }
      }

      namespace events {
        enum EventType {
          PLAYER_LOAD_COMPLETE = 'PLAYER_LOAD_COMPLETE',
          PLAYING = 'PLAYING',
          PAUSE = 'PAUSE',
          BUFFERING = 'BUFFERING',
          ENDED = 'ENDED',
          TIME_UPDATE = 'TIME_UPDATE',
          ERROR = 'ERROR',
        }

        interface ErrorEvent {
          detailedErrorCode?: number;
          error?: any;
        }

        interface TimeUpdateEvent {
          currentMediaTime?: number;
        }
      }
    }
  }

  const videojs: any
}

export {}
