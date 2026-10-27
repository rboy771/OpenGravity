const fs = require('fs');
const path = require('path');

const targetDir = process.env.ANTIGRAVITY_MCP_DIR || 
  path.join(process.env.USERPROFILE || process.env.HOME || '', '.gemini', 'antigravity', 'mcp', 'opengravity');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Read dist/tools-schema.js
const { OPENGRAVITY_TOOLS } = require('./server/dist/tools-schema.js');

for (const tool of OPENGRAVITY_TOOLS) {
  const schemaPath = path.join(targetDir, `${tool.name}.json`);
  const toolJson = {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema
  };
  fs.writeFileSync(schemaPath, JSON.stringify(toolJson, null, 2));
  console.log('Created MCP schema:', tool.name);
}

console.log('All MCP schemas generated successfully at:', targetDir);
