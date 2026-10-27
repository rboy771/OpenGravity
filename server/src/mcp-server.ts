/**
 * OpenGravity Model Context Protocol (MCP) Server v2.0
 * Exposes live browser relay tools directly to Google Antigravity and any MCP-compatible agent.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OpenGravityRelayServer } from './relay-server.js';
import { OPENGRAVITY_TOOLS } from './tools-schema.js';
import { formatDomSummary } from './dom-utils.js';

export function setupMcpServer(relayServer: OpenGravityRelayServer) {
  const server = new Server(
    {
      name: 'opengravity',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available OpenGravity browser tools dynamically from OPENGRAVITY_TOOLS
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: OPENGRAVITY_TOOLS.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    };
  });

  // Handle tool invocations
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const toolDef = OPENGRAVITY_TOOLS.find(t => t.name === name);
      if (!toolDef) {
        throw new Error(`Tool standard '${name}' not recognized.`);
      }

      const result = await relayServer.sendCommand(toolDef.action, (args as Record<string, any>) || {});

      // Custom formatting for screenshots
      if (toolDef.action === 'SCREENSHOT' && result?.dataUrl) {
        return {
          content: [
            { type: 'text', text: `Screenshot captured successfully for tabId: ${result.tabId}` },
            { type: 'image', data: result.dataUrl.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/png' }
          ]
        };
      }

      // Custom formatting for find_elements
      if (toolDef.action === 'FIND_ELEMENTS' && result?.elements) {
        const formatted = formatDomSummary(result.elements);
        return {
          content: [{ type: 'text', text: `Found ${result.count} interactive elements:\n${formatted}` }]
        };
      }

      // Default JSON output
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };

    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `OpenGravity Relay Error: ${err.message || String(err)}` }]
      };
    }
  });

  return {
    startStdio: async () => {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.log('[OpenGravity MCP v2.0] MCP server listening over stdio');
    }
  };
}
