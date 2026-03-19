# MCPR — MCP Registry Protocol

## 项目说明
MCP Server 的注册、发现与信任协议。CLI-first，零依赖，纯 Node.js ESM。

## 协议规范
见 mcpr-protocol-v0.md

## 技术决策
- 零外部依赖
- Node.js ESM (type: "module")
- 本地 JSON 文件作为 registry (v0)
- @scope/name 命名空间

## CLI 命令
mcpr init / validate / publish / search / info / install / stats
