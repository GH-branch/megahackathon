if (typeof window !== 'undefined') {
  // Ensure Buffer is polyfilled
  window.Buffer = window.Buffer || require('buffer').Buffer;
  
  // Polyfill WebSocket
  if (typeof window.WebSocket === 'undefined') {
    const WS = require('ws');
    window.WebSocket = WS;
  }
} 