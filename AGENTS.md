# AGENTS.md

给在这个仓库里工作的 AI agent 的**流程与约定**说明。

## 这个仓库是什么

`dsh-shortcut-extensions` —— 一个 DeepSeek Harness (DSH) 的客户端插件（bundle）。

- 纯 JavaScript，**没有构建步骤、没有 npm 依赖**；React 由宿主提供（`window.__ModuleLoader__` 的 `require('react')`）。
- `index.js`：宿主 half，`apply()` 为空；所有能力都走宿主已有服务。
- `client.js`：全部客户端 UI / 逻辑（一个 `window.__ModuleLoader__.load({ id, factory })` 模块）。
- `cordis.patch.yml`：加载器 patch（插入一行插件）。
- `locale/zh.json`、`locale/en.json`：插件市场展示用的标题 / 简介，**不是**运行时词典（运行时词典在 `client.js` 的 `zh` / `en` 里）。
- `icon.svg`、`assets/`：图标 / 市场素材。
- `package.json`：manifest；`files` 是 npm 打包**白名单**，新增运行文件必须加进去。

## 本地检查（没有测试框架）

```bash
node --check client.js
node -e "for (const f of ['package.json','locale/zh.json','locale/en.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
```

- 改了 `client.js` 里 `t('...')` 的 key，确认 `zh` / `en` 两套词典都补上。
- 不要引入构建工具或运行时依赖。
- 本机调试：profile 是 `link:` 到这个目录，改完 `client.js` 后在 DSH 里 **Reload Window**（Cmd+R）即可；没有 dev server 热更新。

## 发布流程（重要）

**不要在本地跑 `npm publish`。** 发布由 GitHub Actions 完成：

- 工作流：`.github/workflows/release.yml`，在 push `v*` tag 时触发（也可手动 `workflow_dispatch`）。
- 认证：npm **Trusted Publishing (OIDC)** —— 不需要 npm token，也不需要本机 2FA。
- 发布前会校验 tag 与 `package.json` 的 `version` 一致。

发布一个版本：

```bash
npm version patch        # 或 minor / major：改 package.json + commit + 打 vX.Y.Z tag
git push origin main --follow-tags
```

然后等 GitHub Actions 的 `Release` 工作流跑完（`gh run list` / `gh run watch`）。npm registry 可能有几分钟 “processing” 延迟，用 `npm view dsh-shortcut-extensions version` 确认。

注意：

- 版本号必须先升；已发布的版本不能重复发。
- tag 必须是 `v<version>`，且与 `package.json` 一致。
- 不要提交任何 npm token / 密钥；仓库和 npm 包都是公开的。
- 手动重跑：Actions 里对 `Release` 点 “Run workflow”（发布当前 `package.json` 的版本）。

## 其他约定

- 保持 `client.js` 无外部依赖，优先使用宿主注入的服务（`ctx.*`）。
- 对外展示的信息变更时，同步更新 `locale/zh.json` 和 `locale/en.json`。
- 只改本机、不想提交的指令，写 `AGENTS.local.md`（DSH 支持本地 overlay，已在 `.gitignore` 忽略），不要写进本文件。
