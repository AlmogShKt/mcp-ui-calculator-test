# MCP-UI Calculator - ChatGPT Integration Guide

This is a fully functional MCP-UI calculator widget with OpenAI Apps SDK integration, ready to be tested in ChatGPT.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Start the Server

```bash
npm start
```

Or for development with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` and display connection information.

### 4. Test Locally

Visit `http://localhost:3000/calculator` to see the widget in action.

## Connecting to ChatGPT

### Option A: Using ngrok (Recommended)

1. **Install ngrok** (if not already installed):
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com/download
   ```

2. **Start ngrok tunnel** (in a new terminal):
   ```bash
   ngrok http 3000
   ```

   This will output something like:
   ```
   Forwarding   https://abc123-456.ngrok.io -> http://localhost:3000
   ```

3. **Copy the HTTPS URL** - you'll use this in ChatGPT

### Option B: Using localtunnel

```bash
npx localtunnel --port 3000 --subdomain mcp-calculator
```

## ChatGPT Configuration

### For ChatGPT Plus with Custom GPTs:

1. Create a new Custom GPT
2. Go to **"Actions"** tab
3. Click **"Create new action"**
4. Paste the following JSON in the schema section:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Calculator API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-ngrok-url.ngrok.io"
    }
  ],
  "paths": {
    "/calculator": {
      "get": {
        "operationId": "openCalculator",
        "summary": "Open an interactive calculator",
        "description": "Opens an interactive calculator widget",
        "responses": {
          "200": {
            "description": "Calculator widget HTML"
          }
        }
      }
    }
  }
}
```

5. Test the connection by clicking the test button
6. If successful, you can now use the calculator in your Custom GPT

### For ChatGPT Plus with OpenAI Agents SDK (Python):

```python
from agents import Agent, HostedMCPTool

agent = Agent(
    name="Assistant",
    tools=[
        HostedMCPTool(
            tool_config={
                "type": "mcp",
                "server_label": "calculator-mcp",
                "server_url": "https://your-ngrok-url.ngrok.io/mcp",
                "require_approval": "never",
            }
        )
    ]
)

# Use the agent
agent.run("Open the calculator and compute 15 * 23")
```

## Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/info` | GET | Server information and available tools |
| `/calculator` | GET | Direct calculator widget (for testing) |
| `/mcp` | POST | MCP protocol endpoint for ChatGPT |

## Architecture

### Files Structure

```
src/
├── server.ts              # Main MCP server with Express HTTP
├── widgets/
│   └── calculator.ts      # Calculator widget HTML generator
```

### How It Works

1. **Template Registration** (`server.ts`):
   - Creates an Apps SDK-enabled template at `ui://widgets/calculator`
   - Registers it as a resource that ChatGPT can fetch

2. **Tool Handler** (`open_calculator`):
   - Returns an embedded MCP-UI resource for non-ChatGPT hosts
   - Passes the template URI to ChatGPT via `_meta["openai/outputTemplate"]`

3. **Calculator Widget** (`calculator.ts`):
   - Pure HTML/CSS/JavaScript implementation
   - No external dependencies
   - Posts messages to parent window for integration

## Testing Checklist

- [ ] Local widget loads at `http://localhost:3000/calculator`
- [ ] Calculator performs basic arithmetic (+, -, *, /)
- [ ] ngrok/localtunnel tunnel is active
- [ ] Health check passes: `https://your-public-url/health`
- [ ] ChatGPT can reach the server
- [ ] Custom GPT can call the tool
- [ ] Calculator widget displays in ChatGPT chat

## Troubleshooting

### Server won't start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process
kill -9 <PID>

# Try a different port
PORT=3001 npm start
```

### CORS errors in ChatGPT

The server has CORS enabled for all origins. If you see CORS errors:
- Verify the ngrok URL is correct
- Check browser console for specific error messages
- Ensure the ngrok tunnel is still active

### Widget doesn't load in ChatGPT

1. Check `/info` endpoint to verify server is responding
2. Verify the `_meta["openai/outputTemplate"]` value in the tool definition
3. Ensure the template resource is accessible at the URI

### ngrok connection drops

- ngrok tunnels are temporary; disconnect and reconnect
- Use `ngrok authtoken <your-token>` for persistent subdomains (paid feature)

## Next Steps

After successful testing:

1. **Deploy to production** (Heroku, Vercel, Railway, etc.)
2. **Add authentication** if needed (API keys, OAuth)
3. **Enhance the widget** with additional features
4. **Create more tools** following the same pattern

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP-UI Server Docs](https://github.com/anthropics/mcp-ui)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [ngrok Documentation](https://ngrok.com/docs)

---

**Happy calculating! 🧮**
