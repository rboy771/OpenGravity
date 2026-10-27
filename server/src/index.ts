/**
 * OpenGravity Server Entry Point v2.0
 * Starts Relay WebSocket Server (Port 9223) & HTTP API server (Port 9224).
 * Provides self-documenting AI agent endpoints (HTML dashboard, Markdown manual, JSON schemas, OpenAPI).
 */

import express from 'express';
import { OpenGravityRelayServer } from './relay-server.js';
import { setupMcpServer } from './mcp-server.js';
import { OPENGRAVITY_TOOLS } from './tools-schema.js';
import { OPENGRAVITY_AGENT_MANUAL, generateHtmlDashboard } from './agent-manual.js';

const HTTP_PORT = Number(process.env.PORT) || 9224;
const WS_PORT = 9223;

async function main() {
  console.log('----------------------------------------------------');
  console.log('🌌 Starting OpenGravity Server v2.0 for Antigravity...');
  console.log('----------------------------------------------------');

  const relayServer = new OpenGravityRelayServer(WS_PORT);
  await relayServer.start();

  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // CORS for local development and cross-origin extension requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // 1. Root: Interactive Web Dashboard & AI Agent Manual
  app.get('/', (req, res) => {
    const status = {
      isConnected: relayServer.isConnected(),
      wsPort: WS_PORT,
      httpPort: HTTP_PORT
    };
    res.send(generateHtmlDashboard(status));
  });

  // 2. AI Agent Markdown Guide (for LLMs to read/ingest)
  app.get('/api/agent-guide', (req, res) => {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(OPENGRAVITY_AGENT_MANUAL);
  });

  // 3. Tool Definitions (standard schema list)
  app.get('/api/tools', (req, res) => {
    res.json({
      service: 'OpenGravity Browser Relay',
      version: '2.0.0',
      totalTools: OPENGRAVITY_TOOLS.length,
      tools: OPENGRAVITY_TOOLS
    });
  });

  // 4. Schema endpoint
  app.get('/api/schema', (req, res) => {
    const schemas: Record<string, any> = {};
    for (const tool of OPENGRAVITY_TOOLS) {
      schemas[tool.action] = {
        description: tool.description,
        category: tool.category,
        inputSchema: tool.inputSchema,
        example: tool.example
      };
    }
    res.json({ version: '2.0.0', schemas });
  });

  // 5. OpenAPI 3.0 specification
  app.get('/api/openapi.json', (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'OpenGravity Browser Relay API',
        version: '2.0.0',
        description: 'Autonomous browser relay API for AI agents (Antigravity, Claude, ChatGPT).'
      },
      servers: [{ url: `http://localhost:${HTTP_PORT}` }],
      paths: {
        '/api/command': {
          post: {
            summary: 'Execute a browser action',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      action: { type: 'string', description: 'Action name (e.g. LIST_TABS, NAVIGATE, CLICK_ELEMENT)' },
                      params: { type: 'object', description: 'Action parameters' }
                    },
                    required: ['action']
                  }
                }
              }
            },
            responses: {
              200: { description: 'Command execution result' }
            }
          }
        },
        '/status': {
          get: {
            summary: 'Server & extension status',
            responses: { 200: { description: 'Status info' } }
          }
        }
      }
    });
  });

  // 6. Live Status
  app.get(['/status', '/api/status'], (req, res) => {
    res.json({
      status: 'online',
      service: 'OpenGravity Relay Engine v2.0',
      extensionConnected: relayServer.isConnected(),
      wsPort: WS_PORT,
      httpPort: HTTP_PORT,
      availableActions: OPENGRAVITY_TOOLS.map(t => t.action),
      timestamp: new Date().toISOString()
    });
  });

  // 7. Command Dispatcher
  app.post('/api/command', async (req, res) => {
    try {
      let { action, params } = req.body;
      if (!action) {
        action = req.body.command;
      }
      if (!action) {
        return res.status(400).json({
          success: false,
          error: 'Missing "action" parameter in request body.',
          availableActions: OPENGRAVITY_TOOLS.map(t => t.action),
          docsUrl: `http://localhost:${HTTP_PORT}/`
        });
      }
      if (!params) {
        params = { ...req.body };
        delete params.action;
        delete params.command;
      }

      const toolDef = OPENGRAVITY_TOOLS.find(t => t.action.toUpperCase() === action.toUpperCase());
      const normalizedAction = toolDef ? toolDef.action : action.toUpperCase();

      const result = await relayServer.sendCommand(normalizedAction, params || {});
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || String(err),
        tip: 'Ensure the OpenGravity Chrome extension is installed, loaded, and active at chrome://extensions.'
      });
    }
  });

  app.listen(HTTP_PORT, () => {
    console.log(`[OpenGravity Server v2.0] HTTP status & API server live at http://localhost:${HTTP_PORT}`);
    console.log(`[OpenGravity Server v2.0] AI Agent Manual available at http://localhost:${HTTP_PORT}/api/agent-guide`);
  });

  if (process.argv.includes('--mcp')) {
    const mcp = setupMcpServer(relayServer);
    await mcp.startStdio();
  }
}

main().catch((err) => {
  console.error('[OpenGravity Server v2.0] Fatal initialization error:', err);
  process.exit(1);
});
