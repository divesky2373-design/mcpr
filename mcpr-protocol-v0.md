# MCPR — MCP Registry Protocol v0.1 (Draft)

> MCP Server 的注册、发现与信任协议

## 设计原则

1. **协议先行** — 先定 schema，再写工具
2. **最小可用** — v0 只解决"发现"问题，信任和支付后续迭代
3. **CLI-first** — 所有操作通过命令行完成
4. **去中心化友好** — schema 本身不依赖任何中心化服务，可以是一个 JSON 文件托管在 GitHub

---

## 核心概念

```
┌─────────────┐     publish      ┌──────────────┐
│  MCP Server  │ ───────────────▶ │   Registry   │
│  (服务提供方) │                  │  (索引中心)   │
└─────────────┘                  └──────┬───────┘
                                        │
                                   search/discover
                                        │
                                 ┌──────▼───────┐
                                 │    Agent /    │
                                 │   开发者      │
                                 └──────────────┘
```

---

## ServiceCard Schema

每个 MCP Server 注册时提交一个 `mcpr.json` 文件，放在 repo 根目录。

```jsonc
{
  // === 身份 ===
  "mcpr": "0.1",                          // 协议版本
  "name": "mcp-email-sender",             // 唯一标识符 (npm 风格命名)
  "version": "1.2.0",                     // semver
  "title": "Email Sender",                // 人类可读名称
  "description": "Send emails via SMTP, with template support and attachment handling.",
  
  // === 作者 ===
  "author": {
    "name": "yy兄弟",
    "url": "https://erlich.fun",
    "github": "ErlichLiu"
  },

  // === 能力声明 ===
  "capabilities": {
    // 核心：这个 server 暴露了哪些 tools
    "tools": [
      {
        "name": "send_email",
        "description": "Send an email to one or more recipients",
        "inputSchema": {
          "type": "object",
          "properties": {
            "to": { "type": "array", "items": { "type": "string" } },
            "subject": { "type": "string" },
            "body": { "type": "string" },
            "attachments": { "type": "array", "items": { "type": "string" } }
          },
          "required": ["to", "subject", "body"]
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "messageId": { "type": "string" },
            "status": { "type": "string", "enum": ["sent", "queued", "failed"] }
          }
        }
      },
      {
        "name": "list_templates",
        "description": "List available email templates",
        "inputSchema": { "type": "object", "properties": {} },
        "outputSchema": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" }
            }
          }
        }
      }
    ],

    // 可选：resources 和 prompts
    "resources": [],
    "prompts": []
  },

  // === 发现元数据 ===
  "tags": ["email", "smtp", "communication", "notification"],
  "category": "communication",            // 一级分类

  // === 运行要求 ===
  "runtime": {
    "transport": "stdio",                  // stdio | sse | streamable-http
    "language": "typescript",
    "install": "npx mcp-email-sender",     // 一行安装命令
    "config": {                            // 需要用户提供的配置
      "SMTP_HOST": {
        "type": "string",
        "required": true,
        "description": "SMTP server hostname"
      },
      "SMTP_PORT": {
        "type": "number",
        "required": false,
        "default": 587
      },
      "SMTP_USER": {
        "type": "string",
        "required": true,
        "secret": true                     // 标记为敏感信息
      },
      "SMTP_PASS": {
        "type": "string",
        "required": true,
        "secret": true
      }
    }
  },

  // === 来源 ===
  "source": {
    "repo": "https://github.com/ErlichLiu/mcp-email-sender",
    "license": "MIT",
    "homepage": "https://erlich.fun/mcp-email-sender"
  },

  // === 信任信号 (v0 先做基础的，后续迭代加 ZK proof) ===
  "trust": {
    "verified": false,                     // registry 是否验证过
    "openSource": true,
    "lastUpdated": "2026-03-15T00:00:00Z"
  }
}
```

---

## 分类体系 (v0)

先用一个扁平的 category 列表，够用就行：

| Category         | 说明                   | 示例                        |
|-----------------|------------------------|-----------------------------|
| `communication` | 邮件、消息、通知        | email, slack, telegram      |
| `data`          | 数据库、数据源查询      | postgres, airtable, notion  |
| `dev-tools`     | 开发工具链             | github, gitlab, jira        |
| `file-system`   | 文件操作               | local-fs, s3, google-drive  |
| `search`        | 搜索与检索             | web-search, arxiv, rag      |
| `finance`       | 支付、财务、行情        | stripe, stock-quote         |
| `ai-model`      | 调用其他 AI 模型        | openai, replicate, hf       |
| `physical`      | 物理世界接口           | 3d-print, iot, robotics     |
| `identity`      | 身份、认证、权限        | oauth, kyc, passkey         |
| `other`         | 未分类                 |                             |

---

## CLI 设计

```bash
# 发布 — 读取当前目录下的 mcpr.json 并注册
mcpr publish

# 搜索 — 自然语言或 tag 查询
mcpr search "send email"
mcpr search --tag email --tag notification
mcpr search --category communication

# 查看详情
mcpr info mcp-email-sender

# 安装 — 直接配置到你的 MCP client (Claude Code / Cursor 等)
mcpr install mcp-email-sender --client claude-code

# 验证 — 检查 mcpr.json 是否合规
mcpr validate

# 初始化 — 在当前项目生成 mcpr.json 模板
mcpr init
```

### `mcpr search` 输出示例

```
$ mcpr search "send email"

  mcp-email-sender        ★ 4.8  ↓ 1.2k   communication
  Send emails via SMTP, with template support
  ▸ npx mcp-email-sender

  mcp-resend              ★ 4.5  ↓ 890    communication
  Email via Resend API, built for transactional email
  ▸ npx mcp-resend

  mcp-sendgrid            ★ 4.2  ↓ 450    communication
  SendGrid email integration with analytics
  ▸ npx @sendgrid/mcp-server
```

---

## 演进路线

### v0.1 — 现在
- [x] ServiceCard schema (`mcpr.json`)
- [ ] `mcpr` CLI 工具 (publish / search / install / validate / init)
- [ ] GitHub-based registry (一个 JSON 索引文件)

### v0.2 — 信任层
- [ ] 使用统计 (调用次数、成功率)
- [ ] 社区评分
- [ ] 自动化测试验证 (registry CI 跑 smoke test)

### v0.3 — Agent 原生
- [ ] Agent 可直接查询 registry (MCP Server of MCP Servers)
- [ ] 能力语义匹配 (不只是关键词，而是理解 agent 的意图)
- [ ] 组合推荐 ("你要完成这个任务，需要这三个 server 配合")

### v0.4 — 经济层
- [ ] 付费服务支持 (per-call pricing in ServiceCard)
- [ ] A2A 支付集成
- [ ] ZK proof task verification

---

## 开放问题

1. **命名空间** — 是 npm 风格的先到先得，还是 `@author/name` 的 scoped 形式？
2. **去中心化程度** — v0 先用中心化 registry (GitHub repo)，但 schema 要设计成未来可以上链或 P2P
3. **和现有 MCP manifest 的关系** — mcpr.json 是 MCP Server 的 manifest 的超集？还是独立文件引用 manifest？
4. **语义搜索** — agent 搜索时用的是自然语言，怎么做语义匹配？嵌入向量？LLM rerank？
5. **安全** — 怎么防止恶意 MCP Server 注册（钓鱼、数据窃取）？

---

*这是 v0.1 草稿，所有设计都可以改。*
