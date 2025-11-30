/**
 * Debug Log Viewer
 * A toggleable console log viewer for debugging on TV
 */

export class DebugLogViewer {
  constructor() {
    this.visible = false;
    this.logs = [];
    this.maxLogs = 100;
    this.container = null;
    this.originalConsole = {};
    
    this.init();
  }

  init() {
    // Create the log viewer UI
    this.createUI();
    
    // Intercept console methods
    this.interceptConsole();
    
    // Add keyboard listener for toggling
    document.addEventListener('keydown', (e) => {
      // Press 'D' or '`' (backtick) to toggle debug viewer
      if (e.key === 'd' || e.key === 'D' || e.key === '`') {
        this.toggle();
      }
      // Press 'C' to clear logs
      if (this.visible && (e.key === 'c' || e.key === 'C')) {
        this.clear();
      }
    });

    // Add click listener for mouse toggle (triple-click top-right corner)
    let clickCount = 0;
    let clickTimer = null;
    
    document.addEventListener('click', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check if click is in top-right corner (within 100px)
      if (x > width - 100 && y < 100) {
        clickCount++;
        
        if (clickTimer) {
          clearTimeout(clickTimer);
        }
        
        if (clickCount >= 3) {
          this.toggle();
          clickCount = 0;
        } else {
          clickTimer = setTimeout(() => {
            clickCount = 0;
          }, 1000);
        }
      }
    });

    console.log('Debug log viewer initialized (Press D or ` to toggle, C to clear)');
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'debug-log-viewer';
    this.container.style.display = 'none';
    
    this.container.innerHTML = `
      <div class="debug-log-header">
        <span class="debug-log-title">🐛 Debug Console</span>
        <div class="debug-log-controls">
          <button class="debug-log-btn" onclick="window.debugViewer.clear()">Clear (C)</button>
          <button class="debug-log-btn" onclick="window.debugViewer.toggle()">Close (D)</button>
        </div>
      </div>
      <div class="debug-log-content"></div>
      <div class="debug-log-footer">
        Press D or \` to toggle | C to clear | Triple-click top-right corner
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Make it globally accessible for onclick handlers
    window.debugViewer = this;
  }

  interceptConsole() {
    const methods = ['log', 'warn', 'error', 'info'];
    
    methods.forEach(method => {
      this.originalConsole[method] = console[method];
      
      console[method] = (...args) => {
        // Call original console method
        this.originalConsole[method].apply(console, args);
        
        // Add to our log viewer
        this.addLog(method, args);
      };
    });
  }

  addLog(type, args) {
    const timestamp = new Date().toLocaleTimeString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const log = {
      type,
      timestamp,
      message
    };

    this.logs.push(log);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Update UI if visible
    if (this.visible) {
      this.render();
    }
  }

  render() {
    const content = this.container.querySelector('.debug-log-content');
    if (!content) return;

    content.innerHTML = this.logs.map(log => {
      const typeClass = `debug-log-${log.type}`;
      const icon = {
        log: '📝',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[log.type] || '📝';

      return `
        <div class="debug-log-entry ${typeClass}">
          <span class="debug-log-time">${log.timestamp}</span>
          <span class="debug-log-icon">${icon}</span>
          <span class="debug-log-message">${this.escapeHtml(log.message)}</span>
        </div>
      `;
    }).join('');

    // Auto-scroll to bottom
    content.scrollTop = content.scrollHeight;
  }

  toggle() {
    this.visible = !this.visible;
    
    if (this.visible) {
      this.container.style.display = 'flex';
      this.render();
    } else {
      this.container.style.display = 'none';
    }
  }

  clear() {
    this.logs = [];
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
