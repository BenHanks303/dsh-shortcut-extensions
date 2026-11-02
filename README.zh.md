# dsh-shortcut-extensions · 快捷键拓展

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/tag/BenHanks303/dsh-shortcut-extensions?label=release&color=3559e0)](https://github.com/BenHanks303/dsh-shortcut-extensions/releases)
[![Platform](https://img.shields.io/badge/platform-DSH_桌面_%7C_网页-3559e0)](https://github.com/deepseek-ai/deepseek-harness)

一个 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 插件，为 DSH 网页/桌面界面增加一层**键盘驱动的快速切换**：模型面板、带提问预览的会话面板、会话循环、查找下一个已回答会话、聚焦输入框、可配置的权限循环——全部可以在侧栏控制面板里管理。

English documentation: [README.md](README.md)。
- **页头标签** — 在会话标题右侧显示当前工作区名与 git 分支（`conversation.session.header.actions`），每次进入会话都会重新读取分支。

## 功能

- **模型面板**（`Cmd/Ctrl+Shift+M`）— 模糊搜索；AntD 风格的彩色提供方标签（点标签过滤该提供方）；名字后缀标签（如 `routing group`）；推理能力徽标；常用模型置顶。
- **会话面板**（`Cmd/Ctrl+Shift+S`）— 左右两栏：左侧会话列表，右侧**你的提问预览**（跟随高亮行，防抖 + 缓存）。包含已归档会话（带徽标），Enter 打开时自动恢复归档。
- **会话循环**（`Ctrl+Tab` / `Ctrl+Shift+Tab`，桌面端）— 按侧栏活动时间顺序循环切换。
- **查找下一个已回答的会话**（`Cmd/Ctrl+G`，网页端 `Cmd/Ctrl+Shift+G`）— 跳到最近回答完、你还没看过的会话；没有则跳到正在回答的会话。
- **聚焦输入框**（`Cmd/Ctrl+I`）— 通过宿主 composer 门面恢复光标位置。
- **权限循环**（`Cmd/Ctrl+Shift+P`）— 在你配置的预设档位间循环（仅可查看 / 工作区内修改 / 完全权限中任选 2 个以上，支持部署自定义预设），面板内展开配置。
- **侧栏控制面板** — 每条指令带实时键帽显示和独立开关；**快捷键速查 tab** 列出宿主全部命令，可本机改键/恢复默认；所有失败都有浮层提示，绝不静默。
- **输入法安全** — 按键处理忽略 IME 合成态（按 Enter 上屏候选字绝不会误选条目）。
- 跟随宿主明暗主题；弹层固定高度，搜索时不跳动。

## 默认快捷键（macOS 桌面；Windows/Linux 用 Ctrl）

| 指令 | 键位 |
|---|---|
| 模型面板 | ⌘⇧M |
| 会话面板 | ⌘⇧S |
| 权限循环 | ⌘⇧P |
| 查找下一个已回答的会话 | ⌘G（网页端 ⌘⇧G） |
| 聚焦输入框 | ⌘I（网页端 ⌘⌥I） |
| 下一个 / 上一个会话 | ⌃Tab / ⌃⇧Tab |

所有指令都可以在 **DSH 设置 → 快捷键** 或面板的「快捷键速查」tab 中改键；改键仅作用于本机。

## 安装

1. 克隆本仓库。
2. 在 DSH 中打开 **插件** 页面，从克隆的目录安装本插件。
3. 重载窗口（Cmd+R）。

需要标准 DSH web 组合。可选的宿主能力会优雅降级：没有权限预设时相关界面自动隐藏；没有会话大纲投影时提问预览显示提示。

## 说明与限制

- 浏览器会保留部分按键：`Cmd+G` 这类单修饰键绑定仅桌面端可用；`Cmd+Shift+P` 被 Firefox（隐私窗口）占用。
- 桌面应用中 `Cmd+W` 属于原生"关闭窗口"菜单，插件无法接管。
- 改键记录按设备存储（桌面：`userData/keybindings.json`；网页：站点本地存储）。

## 开发

纯 JavaScript，无构建步骤，无 npm 依赖（React 由宿主模块表提供）：

```
dsh-shortcut-extensions/
├── package.json        # 清单：bundle patch + dsh.client 声明
├── cordis.patch.yml    # Loader 补丁：一行 insert
├── index.js            # Host 半（空 apply；全部能力使用宿主服务）
├── client.js           # 全部 UI/逻辑（Client 半，经 ModuleLoader 注册）
├── locale/zh.json      # 展示元数据 + 词典（中/英）
├── locale/en.json
└── icon.svg
```

## 图标 / Icons

- 图标：[Lucide](https://lucide.dev)（`keyboard`、`cpu`、`messages-square`、`arrow-left`、`arrow-right`、`search-check`、`text-cursor-input`、`shield`、`shield-half`、`panel-left`、`message-circle`、`layout-grid`、`message-square-plus`，ISC 许可证）。

## 许可证

[MIT](LICENSE)
