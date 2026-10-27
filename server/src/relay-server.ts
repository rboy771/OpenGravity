/**
 * OpenGravity Relay WebSocket Server v2.0
 * Listens on ws://127.0.0.1:9223 for incoming Chrome Extension connection.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

export interface PendingRequest {
  resolve: (data: any) => void;
  reject: (err: any) => void;
  timer: NodeJS.Timeout;
}

export class OpenGravityRelayServer extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private extensionSocket: WebSocket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCounter = 0;
  private port: number;
  private lastHandshake: any = null;

  constructor(port = 9223) {
    super();
    this.port = port;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on('listening', () => {
          console.log(`[OpenGravity Server v2.0] Listening for extension link on ws://127.0.0.1:${this.port}`);
          resolve();
        });

        this.wss.on('connection', (ws: WebSocket) => {
          console.log('[OpenGravity Server] Extension connected via WebSocket!');
          this.extensionSocket = ws;
          this.emit('extension-connected');

          ws.on('message', (data: string) => {
            try {
              const msg = JSON.parse(data.toString());
              this.handleExtensionMessage(msg, ws);
            } catch (err) {
              console.error('[OpenGravity Server] Failed to parse message:', err);
            }
          });

          ws.on('close', () => {
            console.log('[OpenGravity Server] Extension disconnected.');
            this.extensionSocket = null;
            this.emit('extension-disconnected');
          });

          ws.on('error', (err) => {
            console.error('[OpenGravity Server] WebSocket error:', err);
          });
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  public isConnected(): boolean {
    return this.extensionSocket !== null && this.extensionSocket.readyState === WebSocket.OPEN;
  }

  public getStatus() {
    return {
      connected: this.isConnected(),
      wsPort: this.port,
      lastHandshake: this.lastHandshake,
      pendingRequestsCount: this.pendingRequests.size
    };
  }

  public sendCommand<T = any>(action: string, params: Record<string, any> = {}, timeoutMs = 20000): Promise<T> {
    if (!this.isConnected()) {
      return Promise.reject(new Error('OpenGravity Extension is not connected. Please ensure the Chrome extension is loaded and active at chrome://extensions.'));
    }

    const requestId = `og_req_${++this.requestCounter}_${Date.now()}`;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`OpenGravity command '${action}' timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timer });

      const payload = {
        requestId,
        action,
        params
      };

      this.extensionSocket!.send(JSON.stringify(payload));
    });
  }

  private handleExtensionMessage(msg: any, ws: WebSocket) {
    if (msg.type === 'PING') {
      ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      return;
    }

    if (msg.type === 'RESPONSE' && msg.requestId) {
      const pending = this.pendingRequests.get(msg.requestId);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.requestId);

        if (msg.success) {
          pending.resolve(msg.data);
        } else {
          pending.reject(new Error(msg.error || 'Command failed in browser extension'));
        }
      }
    } else if (msg.type === 'HANDSHAKE') {
      this.lastHandshake = msg;
      console.log('[OpenGravity Server] Extension handshake completed:', msg);
    }
  }

  public stop(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}
