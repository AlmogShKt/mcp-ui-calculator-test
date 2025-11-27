import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createUIResource } from '@mcp-ui/server';
import { renderCalculatorWidget } from './widgets/calculator.js';
import { z } from 'zod';

const PORT = process.env.PORT || 3000;
const TEMPLATE_URI = 'ui://widgets/calculator';

// Initialize MCP Server
const mcpServer = new McpServer({
  name: 'calculator-mcp',
  version: '1.0.0',
});

// Create the Apps SDK template (for ChatGPT)
function createAppsSdkTemplate() {
  return createUIResource({
    uri: TEMPLATE_URI,
    encoding: 'text',
    adapters: {
      appsSdk: {
        enabled: true,
        config: { intentHandling: 'prompt' },
      },
    },
    content: {
      type: 'rawHtml',
      htmlString: renderCalculatorWidget(),
    },
    metadata: {
      'openai/widgetDescription': 'An interactive calculator widget for performing arithmetic operations',
      'openai/widgetCSP': {
        connect_domains: [],
        resource_domains: [],
      },
      'openai/widgetPrefersBorder': true,
      'openai/widgetAccessible': true,
    },
  });
}

// Register the template resource so it can be fetched
mcpServer.registerResource(
  TEMPLATE_URI,
  async () => {
    const template = createAppsSdkTemplate();
    return template.resource;
  }
);

// Register the calculator tool
mcpServer.registerTool(
  'open_calculator',
  {
    description: 'Opens an interactive calculator widget',
    inputSchema: z.object({
      initial_value: z.string().optional().describe('Initial value to display'),
    }),
    _meta: {
      'openai/outputTemplate': TEMPLATE_URI,
      'openai/toolInvocation/invoking': 'Opening calculator…',
      'openai/toolInvocation/invoked': 'Calculator ready',
      'openai/widgetAccessible': true,
    },
  },
  async ({ initial_value }) => {
    // Create the embedded resource for MCP-native hosts (WITHOUT Apps SDK adapter)
    const embeddedResource = createUIResource({
      uri: `ui://widgets/calculator/${Date.now()}`,
      encoding: 'text',
      content: {
        type: 'rawHtml',
        htmlString: renderCalculatorWidget(),
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Calculator opened${initial_value ? ` with initial value: ${initial_value}` : ''}. Use the buttons to perform calculations.`,
        },
        embeddedResource,
      ],
      structuredContent: {
        calculator: {
          status: 'ready',
          initialValue: initial_value || '0',
        },
      },
    };
  }
);

// Express HTTP Server Setup
const app: Express = express();

// CORS configuration for ChatGPT compatibility
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'mcp-session-id'],
    exposedHeaders: ['mcp-session-id'],
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'calculator-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Info endpoint
app.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'calculator-mcp',
    version: '1.0.0',
    description: 'MCP calculator widget with Apps SDK integration',
    tools: ['open_calculator'],
    resources: [TEMPLATE_URI],
  });
});

// MCP HTTP endpoint - using a simple request handler
app.post('/mcp', async (req: Request, res: Response) => {
  try {
    // For this simple implementation, we'll use stdio transport internally
    // In a production setup with sessions, you'd use StreamableHTTPServerTransport
    const request = req.body;

    // Handle resource requests
    if (request.method === 'resources/read') {
      const uri = request.params?.uri;
      if (uri === TEMPLATE_URI) {
        const template = createAppsSdkTemplate();
        return res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            contents: [template.resource],
          },
        });
      }
    }

    // Handle tool calls
    if (request.method === 'tools/call') {
      const toolName = request.params?.name;
      const args = request.params?.arguments || {};

      if (toolName === 'open_calculator') {
        const result = await mcpServer.tools.get('open_calculator')?.handler(args);
        return res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: result?.content || [],
          },
        });
      }
    }

    // Default error response
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32601,
        message: 'Method not found',
      },
    });
  } catch (error) {
    console.error('MCP request error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal server error',
      },
    });
  }
});

// Serve calculator widget directly for testing
app.get('/calculator', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(renderCalculatorWidget());
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          MCP-UI Calculator Server Started                      ║
╚════════════════════════════════════════════════════════════════╝

📍 Server: http://localhost:${PORT}
🎯 Health Check: http://localhost:${PORT}/health
ℹ️  Server Info: http://localhost:${PORT}/info
🧮 Calculator Widget: http://localhost:${PORT}/calculator
🚀 MCP Endpoint: POST http://localhost:${PORT}/mcp

For ChatGPT Integration:
1. Expose this server publicly using ngrok:
   ngrok http ${PORT}

2. Use the public URL in ChatGPT's custom tool configuration

3. Set the server URL to: https://your-ngrok-url.ngrok.io/mcp

4. Available tool: "open_calculator"
   - Opens an interactive calculator widget

═══════════════════════════════════════════════════════════════════
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});
