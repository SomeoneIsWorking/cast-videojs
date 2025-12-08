export function useCAFConfig() {
  function createReceiverOptions(): cast.framework.CastReceiverOptions {
    const options = new cast.framework.CastReceiverOptions();
    const playbackConfig = new cast.framework.PlaybackConfig();

    playbackConfig.shakaConfig = {
      streaming: {
        bufferingGoal: 10,
        rebufferingGoal: 2,
        bufferBehind: 3,
        retryParameters: {
          maxAttempts: 5,
          baseDelay: 1000,
          backoffFactor: 2,
          fuzzFactor: 0.5,
        },
      },
    };

    // Use CAF's built-in text displayer (not the UI one)
    // This lets CAF render subtitles using its own engine
    playbackConfig.enableUITextDisplayer = false;

    options.playbackConfig = playbackConfig;
    options.useShakaForHls = true;
    options.shakaVersion = "4.16.11";

    return options;
  }

  return {
    createReceiverOptions,
  };
}
