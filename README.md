# Video.js Chromecast Receiver

A custom Chromecast receiver application built with Video.js and Vite, featuring TV remote control support for track selection.

## Features

- ✅ **Video.js Player**: Modern HTML5 video player with HLS support
- ✅ **Chromecast Integration**: Full Cast Receiver Framework v3 support
- ✅ **TV Remote Control**: Navigate and control playback using TV remote
- ✅ **Track Selection**: Change audio, subtitle, and quality tracks via remote
- ✅ **Modern Build**: Built with Vite for fast development and optimized production builds
- ✅ **Debug Mode**: Toggle debug logging via URL parameters
- ✅ **Responsive UI**: Beautiful overlay with metadata display and progress bar

## Building the Receiver

```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Remote Control Features

The receiver supports TV remote control navigation with the following features:

### Keyboard/Remote Shortcuts

- **Arrow Keys**: Navigate menus (Up/Down) or seek (Left/Right)
- **Enter**: Select menu item or toggle play/pause
- **Escape/Backspace**: Close menu
- **A**: Toggle audio track menu
- **S**: Toggle subtitle menu
- **Q**: Toggle quality menu
- **MediaPlayPause**: Toggle play/pause
- **MediaRewind/MediaTrackPrevious**: Seek backward 10 seconds
- **MediaFastForward/MediaTrackNext**: Seek forward 10 seconds

### Track Selection

When a menu is open:

1. Use **Up/Down** arrows to navigate tracks
2. Press **Enter** to select the highlighted track
3. Press **Escape** to close without selecting

The currently active track is marked with a checkmark (✓).

## Setting Up the Receiver

### 1. Build and Deploy

Build the receiver for production:

```bash
npm run build
```

The built files will be in the `dist` directory. Deploy these files to a secure HTTPS server.

### 2. Register with Google Cast

1. Go to the [Google Cast SDK Developer Console](https://cast.google.com/u/0/publish/#/signup)
2. Register a new Custom Receiver Application
3. Set the URL to your deployed receiver (e.g., `https://yourdomain.com/receiver/`)
4. Note the Application ID provided

### 3. Configure Your Sender App

Use the Application ID in your sender application to cast to this receiver.

## URL Parameters

### Debug Mode

Enable debug logging by adding `?debug=true` to the receiver URL:

```
https://yourdomain.com/receiver/?debug=true
```

Debug mode can also be enabled via the content URL by adding `debug=true` as a query parameter to the media source.

## Development

### Project Structure

```
cast-videojs/
├── src/
│   ├── main.js              # Main receiver application
│   ├── remoteControl.js     # TV remote control handler
│   └── style.css            # Receiver styles
├── index.html               # HTML template
├── package.json             # Dependencies
└── vite.config.js           # Vite configuration (if needed)
```

### Key Components

#### VideojsCastReceiver (main.js)

Main receiver class that:

- Initializes Video.js player
- Sets up Cast Receiver Framework
- Handles media loading and playback
- Manages UI state and metadata display
- Integrates remote control handler

#### RemoteControlHandler (remoteControl.js)

Handles TV remote input for:

- Track menu navigation
- Audio track selection
- Subtitle track selection
- Quality level selection
- Playback control

## Customization

### Styling

Edit `src/style.css` to customize the receiver appearance. The CSS uses CSS variables for easy theming:

```css
:root {
  --white: #fff;
  --light-grey: #777;
  --accent: #ff0046;
  --text-accent: #aab4c8;
  --dark-bg: #000;
}
```

### Logo

Replace the SVG logo in the `.logo` class background-image in `style.css` with your own logo.

### Player Configuration

Modify the Video.js player options in `main.js` `initPlayer()` method to customize player behavior.

## Differences from JWPlayer Receiver

This receiver is based on the JWPlayer Cast Receiver but with key differences:

1. **Player**: Uses Video.js instead of JWPlayer
2. **Build System**: Uses Vite instead of Gulp
3. **Remote Control**: Added TV remote control support for track selection
4. **Modern ES6+**: Uses modern JavaScript features and modules
5. **Simplified**: Removed ad support and related features for cleaner codebase

## Browser Compatibility

The receiver is designed to run on Chromecast devices and supports:

- HLS (HTTP Live Streaming)
- DASH (with appropriate Video.js plugins)
- MP4 and other HTML5 video formats

## Troubleshooting

### Player not loading

- Check browser console for errors
- Verify the media URL is accessible from the Chromecast device
- Ensure CORS headers are properly configured on your media server

### Remote control not working

- Remote control features require the receiver to have focus
- Some Chromecast devices may have limited remote control support
- Test with keyboard shortcuts in a browser first

### Debug mode

Enable debug mode to see detailed logs:

- Add `?debug=true` to receiver URL
- Or add `debug=true` to content URL query parameters
- Check the Chrome Remote Debugger for Chromecast logs

## License

This project is provided as-is for use with Chromecast applications.

## Credits

- Based on the [JWPlayer Cast Receiver](https://github.com/jwplayer/jwplayer-cast-receiver)
- Built with [Video.js](https://videojs.com/)
- Powered by [Vite](https://vitejs.dev/)
