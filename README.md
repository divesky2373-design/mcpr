# MCPR — MCP Registry Protocol

Register, discover, and install [MCP](https://modelcontextprotocol.io) servers from the command line.

MCPR defines a lightweight **ServiceCard** schema (`mcpr.json`) and a CLI to publish, search, and install MCP servers into any compatible client (Claude Code, Cursor, etc.).

## Install

```bash
# global
npm install -g mcpr

# or run directly
npx mcpr <command>
```

Requires Node.js >= 18. Zero external dependencies.

## Quick Start

```bash
# Initialize a ServiceCard in the current project
mcpr init

# Validate your mcpr.json
mcpr validate

# Publish to the registry
mcpr publish

# Search for servers
mcpr search "send email"
mcpr search --tag email --category communication

# View server details
mcpr info mcp-email-sender

# Install a server into your MCP client
mcpr install mcp-email-sender --client claude-code

# Show registry statistics
mcpr stats
```

## CLI Commands

| Command    | Description                                      |
|------------|--------------------------------------------------|
| `init`     | Generate an `mcpr.json` template in the current directory |
| `validate` | Check that `mcpr.json` conforms to the protocol  |
| `publish`  | Publish the current ServiceCard to the registry   |
| `search`   | Find servers by keyword, tag, or category         |
| `info`     | Display detailed info for a specific server       |
| `install`  | Install a server into an MCP client config        |
| `stats`    | Show registry-wide statistics                     |

## ServiceCard Schema

Each MCP server is described by an `mcpr.json` file at the repo root:

```jsonc
{
  "mcpr": "0.1",                        // protocol version
  "name": "@scope/my-server",           // unique identifier (npm-style)
  "version": "1.0.0",                   // semver
  "title": "My Server",                 // human-readable name
  "description": "What this server does",

  "author": {
    "name": "Your Name",
    "url": "https://example.com",
    "github": "username"
  },

  "capabilities": {
    "tools": [
      {
        "name": "tool_name",
        "description": "What the tool does",
        "inputSchema": { /* JSON Schema */ },
        "outputSchema": { /* JSON Schema */ }
      }
    ],
    "resources": [],
    "prompts": []
  },

  "tags": ["email", "smtp"],
  "category": "communication",          // see categories below

  "runtime": {
    "transport": "stdio",               // stdio | sse | streamable-http
    "language": "typescript",
    "install": "npx my-server",         // one-liner install command
    "config": {                         // env vars the user must provide
      "API_KEY": {
        "type": "string",
        "required": true,
        "secret": true,
        "description": "API key for the service"
      }
    }
  },

  "source": {
    "repo": "https://github.com/user/repo",
    "license": "MIT",
    "homepage": "https://example.com"
  },

  "trust": {
    "verified": false,
    "openSource": true,
    "lastUpdated": "2026-03-15T00:00:00Z"
  }
}
```

### Categories

| Category         | Description                   |
|------------------|-------------------------------|
| `communication`  | Email, messaging, notifications |
| `data`           | Databases, data sources       |
| `dev-tools`      | GitHub, GitLab, CI/CD         |
| `file-system`    | Local FS, S3, Google Drive    |
| `search`         | Web search, RAG, retrieval    |
| `finance`        | Payments, quotes, accounting  |
| `ai-model`       | External AI model access      |
| `physical`       | IoT, robotics, 3D printing   |
| `identity`       | Auth, OAuth, KYC              |
| `other`          | Uncategorized                 |

## Protocol

See [mcpr-protocol-v0.md](./mcpr-protocol-v0.md) for the full protocol specification.

## License

MIT
