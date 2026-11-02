window.__ModuleLoader__.load({
  id: 'dsh-shortcut-extensions',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useMemo, useRef, useReducer, useCallback, useSyncExternalStore } = React;

    const NS = 'shortcutExt';
    const PANEL_ID = 'shortcut-ext';
    const PIN_KEY = 'dsh.quick-switch.pinned.v1';
    const TOGGLE_KEY = 'dsh.shortcut-ext.enabled.v1';

    /* ------------------------------------------------------------------ */
    /* Locale dictionaries                                                 */
    /* ------------------------------------------------------------------ */

    const zh = {
      'panel.title': '快捷键拓展',
      'panel.subtitle': '已注册的快捷指令 · 可开关 · 键位跟随 设置 → 快捷键',
      'panel.commands': '指令',
      'panel.search': '搜索指令',
      'panel.empty': '没有匹配的指令',
      'panel.allOn': '全部开启',
      'panel.allOff': '全部关闭',
      'panel.enabled': '已启用',
      'panel.disabled': '已停用',
      'filter.all': '全部',
      'filter.on': '已启用',
      'filter.off': '已停用',
      'tab.commands': '快捷键拓展',
      'tab.system': '快捷键速查',
      'system.reset': '恢复默认',
      'system.fixed': '固定',
      'system.saveFailed': '保存失败，请重试',
      'system.hint': '改键与恢复仅作用于本设备；「固定」项由宿主保留，不可改键。',
      'custom.add': '添加指令',
      'custom.title': '新增自定义指令',
      'custom.action': '动作',
      'custom.param': '参数',
      'custom.key': '快捷键',
      'custom.record': '按下快捷键…',
      'custom.recordHelp': '松开即确认；Esc 取消录制',
      'custom.save': '保存',
      'custom.cancel': '取消',
      'custom.remove': '删除',
      'custom.needKey': '请先录制一个快捷键',
      'custom.keyIssue': '该组合不可用（系统保留或不受支持）',
      'custom.modifierRequired': '请同时按下 Command、Ctrl 或 Alt 修饰键',
      'custom.conflict': '该组合已被其它命令占用',
      'preset.readOnly': '仅可查看',
      'preset.workspaceWrite': '工作区内修改',
      'preset.full': '完全权限',
      'action.openModelPalette': '打开模型列表',
      'action.openSessionPalette': '打开会话列表',
      'action.jumpCompleted': '查找下一个已回答的会话',
      'action.focusComposer': '聚焦聊天输入框',
      'action.togglePermission': '权限切换',
      'action.setPermission': '设置权限为指定档位',
      'action.nextSession': '下一个会话',
      'action.prevSession': '上一个会话',
      'action.toggleSidebar': '显示 / 隐藏侧栏',
      'action.showConversation': '回到对话视图',
      'action.showDeck': '打开快捷键拓展面板',
      'action.newSession': '新建会话',
      'palette.title': '切换模型',
      'palette.placeholder': '输入以搜索模型（置顶模型排在最前）',
      'palette.loading': '模型目录加载中…',
      'palette.loadError': '模型目录加载失败',
      'palette.empty': '暂无可用模型',
      'palette.noMatch': '无匹配模型',
      'palette.noSession': '当前没有打开的会话，先打开或新建一个会话',
      'palette.switching': '切换中…',
      'palette.selectFailed': '切换失败',
      'palette.pin': '置顶',
      'palette.providerFailures': '部分模型提供方暂不可用',
      'palette.hint.nav': '选择',
      'palette.hint.confirm': '切换',
      'palette.hint.close': '关闭',
      'palette.hint.pin': '置顶/取消置顶',
      'palette.hint.tag': '点标签过滤同族',
      'tag.reasoning': '推理',
      'shortcut.modelPalette': '打开模型快速切换',
      'shortcut.permToggle': '权限切换',
      'shortcut.sessionPalette': '打开会话列表',
      'shortcut.nextSession': '下一个会话',
      'shortcut.prevSession': '上一个会话',
      'shortcut.focusComposer': '聚焦聊天输入框',
      'shortcut.jumpCompleted': '查找下一个已回答的会话',
      'shortcut.unbound': '未绑定',
      'session.none': '未打开会话',
      'session.noneOther': '没有其它会话可切换',
      'session.noneCompleted': '暂时没有刚回答完的会话',
      'session.paletteTitle': '切换会话',
      'session.placeholder': '搜索会话（含已归档）',
      'session.badgeArchived': '已归档',
      'session.newSession': '新会话',
      'session.empty': '没有匹配的会话',
      'session.noneYet': '暂无会话',
      'session.busy': '处理中…',
      'session.restoreFailed': '恢复失败',
      'session.openFailed': '打开失败',
      'session.hint.nav': '选择',
      'session.hint.open': '打开（归档自动恢复）',
      'session.hint.close': '关闭',
      'session.previewTitle': '我的提问',
      'session.previewEmpty': '暂无提问记录',
      'session.previewUnavailable': '该部署未提供会话大纲，无法预览',
      'session.previewLoading': '预览加载中…',
      'perm.noSession': '打开一个会话后即可切换权限',
      'perm.unavailable': '当前部署未提供权限预设',
      'perm.section': '权限循环',
      'perm.current': '当前',
      'perm.cycleHint': '点击档位加入或移出循环（至少两个）；切换键按此顺序循环。',
      'perm.needTwo': '至少保留两个权限档位',
      'perm.autoExcluded': '自动审查为会话级临时档，不参与循环。',
      'perm.catalogLoading': '权限目录加载中…',
      'time.now': '刚刚',
      'time.minutes': '{n} 分钟前',
      'time.hours': '{n} 小时前',
      'time.days': '{n} 天前'
    };

    const en = {
      'panel.title': 'Shortcut Extensions',
      'panel.subtitle': 'Registered shortcut commands · toggleable · keys follow Settings → Shortcuts',
      'panel.commands': 'Commands',
      'panel.search': 'Search commands',
      'panel.empty': 'No matching commands',
      'panel.allOn': 'Enable all',
      'panel.allOff': 'Disable all',
      'panel.enabled': 'On',
      'panel.disabled': 'Off',
      'filter.all': 'All',
      'filter.on': 'Enabled',
      'filter.off': 'Disabled',
      'tab.commands': 'Shortcut Extensions',
      'tab.system': 'Shortcut reference',
      'system.reset': 'Reset',
      'system.fixed': 'Fixed',
      'system.saveFailed': 'Save failed; try again',
      'system.hint': 'Rebinds and resets are device-local; "Fixed" rows are host-reserved and cannot be rebound.',
      'custom.add': 'Add command',
      'custom.title': 'New custom command',
      'custom.action': 'Action',
      'custom.param': 'Parameter',
      'custom.key': 'Shortcut',
      'custom.record': 'Press shortcut…',
      'custom.recordHelp': 'Release to confirm; Esc cancels recording',
      'custom.save': 'Save',
      'custom.cancel': 'Cancel',
      'custom.remove': 'Remove',
      'custom.needKey': 'Record a shortcut first',
      'custom.keyIssue': 'This combination is unusable (reserved or unsupported)',
      'custom.modifierRequired': 'Include Command, Ctrl, or Alt in the combination',
      'custom.conflict': 'This combination is already used by another command',
      'preset.readOnly': 'Read Only',
      'preset.workspaceWrite': 'Workspace Write',
      'preset.full': 'Full access',
      'action.openModelPalette': 'Open the model palette',
      'action.openSessionPalette': 'Open the session palette',
      'action.jumpCompleted': 'Find next answered session',
      'action.focusComposer': 'Focus the chat input',
      'action.togglePermission': 'Toggle permissions',
      'action.setPermission': 'Set permissions to a preset',
      'action.nextSession': 'Next session',
      'action.prevSession': 'Previous session',
      'action.toggleSidebar': 'Show / hide the sidebar',
      'action.showConversation': 'Return to the conversation view',
      'action.showDeck': 'Open the Shortcut Extensions panel',
      'action.newSession': 'Start a new session',
      'palette.title': 'Switch model',
      'palette.placeholder': 'Type to search models (pinned models come first)',
      'palette.loading': 'Loading model catalog…',
      'palette.loadError': 'Failed to load the model catalog',
      'palette.empty': 'No models available',
      'palette.noMatch': 'No matching model',
      'palette.noSession': 'No open session; open or create one first',
      'palette.switching': 'Switching…',
      'palette.selectFailed': 'Switch failed',
      'palette.pin': 'Pin',
      'palette.providerFailures': 'Some model providers are currently unavailable',
      'palette.hint.nav': 'navigate',
      'palette.hint.confirm': 'switch',
      'palette.hint.close': 'close',
      'palette.hint.pin': 'pin/unpin',
      'palette.hint.tag': 'click a tag to filter',
      'tag.reasoning': 'Reasoning',
      'shortcut.modelPalette': 'Open the model quick switcher',
      'shortcut.permToggle': 'Toggle permissions',
      'shortcut.sessionPalette': 'Open the session list',
      'shortcut.nextSession': 'Next session',
      'shortcut.prevSession': 'Previous session',
      'shortcut.focusComposer': 'Focus the chat input',
      'shortcut.jumpCompleted': 'Find next answered session',
      'shortcut.unbound': 'Unbound',
      'session.none': 'No open session',
      'session.noneOther': 'No other session to switch to',
      'session.noneCompleted': 'No session has just answered',
      'session.paletteTitle': 'Switch session',
      'session.placeholder': 'Search sessions (including archived)',
      'session.badgeArchived': 'Archived',
      'session.newSession': 'New session',
      'session.empty': 'No matching session',
      'session.noneYet': 'No sessions yet',
      'session.busy': 'Working…',
      'session.restoreFailed': 'Restore failed',
      'session.openFailed': 'Open failed',
      'session.hint.nav': 'navigate',
      'session.hint.open': 'open (restores archived)',
      'session.hint.close': 'close',
      'session.previewTitle': 'My prompts',
      'session.previewEmpty': 'No prompts recorded yet',
      'session.previewUnavailable': 'This deployment exposes no session outline; preview unavailable',
      'session.previewLoading': 'Loading preview…',
      'perm.noSession': 'Open a session to switch permissions',
      'perm.unavailable': 'This deployment offers no permission presets',
      'perm.section': 'Permission cycle',
      'perm.current': 'Current',
      'perm.cycleHint': 'Click presets to include or exclude them (at least two); the toggle key cycles in this order.',
      'perm.needTwo': 'Keep at least two permission presets',
      'perm.autoExcluded': 'Auto review is a session-only temporary preset and never joins the cycle.',
      'perm.catalogLoading': 'Loading permission catalog…',
      'time.now': 'now',
      'time.minutes': '{n}m ago',
      'time.hours': '{n}h ago',
      'time.days': '{n}d ago'
    };

    /* ------------------------------------------------------------------ */
    /* Command table: labels, implementation terms, default bindings       */
    /* ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------ */
    /* Action catalog (safe, verified operations) and command table        */
    /* ------------------------------------------------------------------ */

    const PRESETS = [
      { value: 'read-only', labelKey: 'preset.readOnly' },
      { value: 'workspace-write', labelKey: 'preset.workspaceWrite' },
      { value: 'danger-full-access', labelKey: 'preset.full' }
    ];

    const PRESET_LABEL_KEY = {
      'read-only': 'preset.readOnly',
      'workspace-write': 'preset.workspaceWrite',
      'danger-full-access': 'preset.full'
    };

    function cycleTarget(ctx, direction, t) {
      let sessionsSnap = EMPTY_SESSIONS_SNAP;
      let workspacesSnap = EMPTY_WORKSPACES_SNAP;
      try { sessionsSnap = ctx.sessions.list.getSnapshot(); } catch { /* keep empty */ }
      try { workspacesSnap = ctx.workspaces?.list?.getSnapshot?.() ?? EMPTY_WORKSPACES_SNAP; } catch { /* keep empty */ }
      const currentId = mainSessionId(ctx);
      const order = visibleSessionOrder(workspacesSnap, sessionsSnap, currentId);
      if (order.length === 0) return { blocked: t('session.none') };
      if (order.length === 1 && order[0] === currentId) return { blocked: t('session.noneOther') };
      const index = currentId === undefined ? -1 : order.indexOf(currentId);
      const target = index === -1
        ? (direction > 0 ? order[0] : order[order.length - 1])
        : order[(index + direction + order.length) % order.length];
      return { target };
    }

    function runPermissionToggle(d) {
      const live = liveSession(d.ctx, mainSessionId(d.ctx));
      if (!live) return d.hint(d.t('perm.noSession'));
      let current;
      try { current = live.projections?.faceOf?.('permissions')?.getSnapshot()?.currentValue; }
      catch { current = undefined; }
      if (current === undefined) return d.hint(d.t('perm.unavailable'));
      const cycle = d.permCycle.getSnapshot();
      if (cycle.length < 2) return d.hint(d.t('perm.needTwo'));
      const target = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      switchPermission(d.ctx, target).catch((error) => {
        d.hint(`${d.t('perm.failed')}: ${error?.message ?? error}`);
      });
      return undefined;
    }

    const ACTIONS = [
      {
        id: 'open-model-palette',
        labelKey: 'action.openModelPalette',
        impl: 'palette.open(model)',
        run: (d) => { d.paletteOpen.set(true); }
      },
      {
        id: 'open-session-palette',
        labelKey: 'action.openSessionPalette',
        impl: 'palette.open(session)',
        run: (d) => { d.sessionPaletteOpen.set(true); }
      },
      {
        id: 'jump-completed',
        labelKey: 'action.jumpCompleted',
        impl: 'sessions.list: updatedAt > viewedAt',
        run: (d) => {
          if (d.jumpTracker.jump() === 'none') d.hint(d.t('session.noneCompleted'));
        }
      },
      {
        id: 'focus-composer',
        labelKey: 'action.focusComposer',
        impl: 'SessionInput.focus()',
        run: (d) => {
          const id = mainSessionId(d.ctx);
          if (id === undefined) return d.hint(d.t('session.none'));
          focusComposer(d.ctx, id);
          return undefined;
        }
      },
      {
        id: 'toggle-permission',
        labelKey: 'action.togglePermission',
        impl: 'cycle \u2192 live.command("/permission <next>")',
        run: runPermissionToggle
      },
      {
        id: 'set-permission',
        labelKey: 'action.setPermission',
        impl: 'live.command("/permission <preset>")',
        param: 'preset',
        run: (d, param) => {
          switchPermission(d.ctx, param).catch((error) => {
            const reason = error?.message === 'NO_SESSION' ? d.t('perm.noSession')
              : error?.message === 'NO_COMMAND' ? d.t('perm.unavailable')
              : `${d.t('perm.failed')}: ${error?.message ?? error}`;
            d.hint(reason);
          });
        }
      },
      {
        id: 'next-session',
        labelKey: 'action.nextSession',
        impl: 'uiWorkspace.openSession()',
        run: (d) => {
          const result = cycleTarget(d.ctx, 1, d.t);
          if (result.blocked) return d.hint(result.blocked);
          try { openSessionId(d.ctx, result.target); } catch (error) { console.error('[shortcut-ext] cycle failed', error); }
          return undefined;
        }
      },
      {
        id: 'prev-session',
        labelKey: 'action.prevSession',
        impl: 'uiWorkspace.openSession()',
        run: (d) => {
          const result = cycleTarget(d.ctx, -1, d.t);
          if (result.blocked) return d.hint(result.blocked);
          try { openSessionId(d.ctx, result.target); } catch (error) { console.error('[shortcut-ext] cycle failed', error); }
          return undefined;
        }
      },
      {
        id: 'toggle-sidebar',
        labelKey: 'action.toggleSidebar',
        impl: 'layout.toggleSidebar()',
        run: (d) => { try { d.ctx.layout.toggleSidebar(); } catch (error) { console.error('[shortcut-ext] sidebar toggle failed', error); } }
      },
      {
        id: 'show-conversation',
        labelKey: 'action.showConversation',
        impl: 'layout.selectPanel(null)',
        run: (d) => { try { d.ctx.layout.selectPanel(null); } catch (error) { console.error('[shortcut-ext] selectPanel failed', error); } }
      },
      {
        id: 'show-deck',
        labelKey: 'action.showDeck',
        impl: "layout.selectPanel('shortcut-ext')",
        run: (d) => { try { d.ctx.layout.selectPanel(PANEL_ID); } catch (error) { console.error('[shortcut-ext] selectPanel failed', error); } }
      },
      {
        id: 'new-session',
        labelKey: 'action.newSession',
        impl: 'uiWorkspace.startSession()',
        run: (d) => { try { d.ctx.uiWorkspace.startSession(); } catch (error) { console.error('[shortcut-ext] startSession failed', error); } }
      },
   ];

    const ACTION_BY_ID = new Map(ACTIONS.map((action) => [action.id, action]));

    /** Built-in commands: fixed ids (rebindable in Settings) over the action catalog. */
    const COMMANDS = [
      {
        id: 'shortcut-ext.model-palette',
        action: 'open-model-palette',
        attempts: [
          {
            'desktop:macos': { code: 'KeyM', modifiers: ['primary', 'shift'] },
            'desktop:windows': { code: 'KeyM', modifiers: ['primary', 'shift'] },
            'desktop:linux': { code: 'KeyM', modifiers: ['primary', 'shift'] },
            'web:macos': { code: 'KeyM', modifiers: ['primary', 'shift'] },
            'web:windows': { code: 'KeyM', modifiers: ['primary', 'shift'] }
          },
          {
            'desktop:macos': { code: 'KeyM', modifiers: ['primary', 'alt'] },
            'desktop:windows': { code: 'KeyM', modifiers: ['primary', 'alt'] },
            'desktop:linux': { code: 'KeyM', modifiers: ['primary', 'alt'] },
            'web:macos': { code: 'KeyM', modifiers: ['primary', 'alt'] },
            'web:windows': { code: 'KeyM', modifiers: ['primary', 'alt'] }
          },
          {}
        ]
      },
      {
        id: 'shortcut-ext.session-palette',
        action: 'open-session-palette',
        attempts: [
          {
            'desktop:macos': { code: 'KeyS', modifiers: ['primary', 'shift'] },
            'desktop:windows': { code: 'KeyS', modifiers: ['primary', 'shift'] },
            'desktop:linux': { code: 'KeyS', modifiers: ['primary', 'shift'] },
            'web:macos': { code: 'KeyS', modifiers: ['primary', 'shift'] },
            'web:windows': { code: 'KeyS', modifiers: ['primary', 'shift'] }
          },
          {
            'desktop:macos': { code: 'KeyS', modifiers: ['primary', 'shift'] },
            'desktop:windows': { code: 'KeyS', modifiers: ['primary', 'shift'] },
            'desktop:linux': { code: 'KeyS', modifiers: ['primary', 'shift'] }
          },
          {}
        ]
      },
      {
        id: 'shortcut-ext.session-next',
        action: 'next-session',
        attempts: [
          {
            'desktop:macos': { code: 'Tab', modifiers: ['control'] },
            'desktop:windows': { code: 'Tab', modifiers: ['control'] }
          },
          {}
        ]
      },
      {
        id: 'shortcut-ext.session-prev',
        action: 'prev-session',
        attempts: [
          {
            'desktop:macos': { code: 'Tab', modifiers: ['control', 'shift'] },
            'desktop:windows': { code: 'Tab', modifiers: ['control', 'shift'] }
          },
          {}
        ]
      },
      {
        id: 'shortcut-ext.jump-completed',
        action: 'jump-completed',
        attempts: [
          {
            'desktop:macos': { code: 'KeyG', modifiers: ['primary'] },
            'desktop:windows': { code: 'KeyG', modifiers: ['primary'] },
            'desktop:linux': { code: 'KeyG', modifiers: ['primary'] },
            'web:macos': { code: 'KeyG', modifiers: ['primary', 'shift'] },
            'web:windows': { code: 'KeyG', modifiers: ['primary', 'shift'] }
          },
          {
            'desktop:macos': { code: 'KeyG', modifiers: ['primary'] },
            'desktop:windows': { code: 'KeyG', modifiers: ['primary'] },
            'desktop:linux': { code: 'KeyG', modifiers: ['primary'] }
          },
          {}
        ]
      },
      {
        id: 'shortcut-ext.focus-composer',
        action: 'focus-composer',
        attempts: [
          {
            'desktop:macos': { code: 'KeyI', modifiers: ['primary'] },
            'desktop:windows': { code: 'KeyI', modifiers: ['primary'] },
            'desktop:linux': { code: 'KeyI', modifiers: ['primary'] },
            'web:macos': { code: 'KeyI', modifiers: ['primary', 'alt'] },
            'web:windows': { code: 'KeyI', modifiers: ['primary', 'alt'] }
          },
          {}
        ]
      },
      {
        id: 'shortcut-ext.permission-toggle',
        action: 'toggle-permission',
        attempts: [
          {
            'desktop:macos': { code: 'KeyP', modifiers: ['primary', 'shift'] },
            'desktop:windows': { code: 'KeyP', modifiers: ['primary', 'shift'] },
            'desktop:linux': { code: 'KeyP', modifiers: ['primary', 'shift'] },
            'web:macos': { code: 'KeyP', modifiers: ['primary', 'shift'] },
            'web:windows': { code: 'KeyP', modifiers: ['primary', 'shift'] }
          },
          {
            'desktop:macos': { code: 'KeyP', modifiers: ['primary', 'alt'] },
            'desktop:windows': { code: 'KeyP', modifiers: ['primary', 'alt'] },
            'desktop:linux': { code: 'KeyP', modifiers: ['primary', 'alt'] },
            'web:macos': { code: 'KeyP', modifiers: ['primary', 'alt'] },
            'web:windows': { code: 'KeyP', modifiers: ['primary', 'alt'] }
          },
          {}
        ]
      },
    ];

    const COMMAND_IDS = COMMANDS.map((command) => command.id);

    /* ------------------------------------------------------------------ */
    /* Styles (theme tokens only; injected once with effect cleanup)       */
    /* ------------------------------------------------------------------ */

    const CSS = [
      /* Palettes: menu-toned surface over an opaque base (no see-through) */
      '.dqs-backdrop{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;',
      'background:rgba(0,0,0,.32);}',
      '.dqs-palette{width:min(720px,calc(100vw - 48px));max-height:min(70vh,660px);display:flex;flex-direction:column;',
      'overflow:hidden;background-color:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-overlay));',
      'background-image:linear-gradient(var(--dsw-specific-menu,var(--dsw-alias-bg-overlay)),',
      'var(--dsw-specific-menu,var(--dsw-alias-bg-overlay)));',
      'border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,14px);',
      'box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.28));color:var(--dsw-alias-label-primary);}',
      '.dqs-paletteHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px 10px;}',
      '.dqs-paletteTitle{font-size:15px;font-weight:600;}',
      '.dqs-closeBtn{border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-secondary);',
      'font-size:13px;line-height:1;padding:5px;border-radius:6px;display:flex;}',
      '.dqs-closeBtn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));',
      'color:var(--dsw-alias-label-primary);}',
      '.dqs-input{width:100%;box-sizing:border-box;height:40px;padding:0 12px 0 34px;',
      'border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-2);',
      'color:var(--dsw-alias-label-primary);font-size:13px;outline:none;transition:border-color .12s;}',
      '.dqs-input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.8;}',
      '.dqs-input:hover:not(:focus){border-color:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));}',
      '.dqs-input:focus{border-color:var(--dsw-alias-state-business-primary);}',
      '.dqs-searchWrap{position:relative;margin:0 14px 10px;}',
      '.dqs-searchIcon{position:absolute;left:11px;top:50%;transform:translateY(-50%);',
      'color:var(--dsw-alias-label-secondary);display:flex;pointer-events:none;}',
      '.dqs-list{height:360px;overflow-y:auto;padding:2px 8px 6px;}',
      '.dqs-list::-webkit-scrollbar{width:8px;height:8px;}',
      '.dqs-list::-webkit-scrollbar-track{background:transparent;}',
      '.dqs-list::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,var(--dsw-alias-border-l2));',
      'border-radius:999px;}',
      '.dqs-list::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,var(--dsw-alias-border-l1));}',
      '.dqs-columns{display:flex;height:360px;min-height:0;}',
      '.dqs-columns .dqs-list{flex:1 1 auto;height:100%;min-width:0;border-right:none;}',
      '.dqs-paletteWide{width:min(880px,calc(100vw - 48px));}',
      '.dqs-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;',
      'font-size:14px;min-height:36px;box-sizing:border-box;}',
      '.dqs-row[data-active="true"]{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}',
      '.dqs-rowName{flex:0 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-rowProvider{flex:1 1 auto;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-rowBusy{flex:none;font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.dqs-rowEnd{margin-left:auto;flex:none;display:flex;align-items:center;gap:6px;}',
      '.dqs-tag{flex:none;font-size:10.5px;line-height:16px;padding:0 6px;border-radius:4px;',
      'border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));',
      'color:var(--dsw-alias-label-secondary);background:transparent;white-space:nowrap;',
      'overflow:hidden;text-overflow:ellipsis;}',
      'button.dqs-tag{cursor:pointer;}',
      'button.dqs-tag:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));',
      'color:var(--dsw-alias-label-primary);}',
      '.dqs-tagProvider{max-width:130px;min-width:64px;text-align:center;',
      'color:var(--dsw-alias-label-secondary);',
      'border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:transparent;}',
      '.dqs-tagProvider{color:hsl(var(--dqs-hue,210) 70% 50%);',
      'border-color:color-mix(in srgb, currentColor 45%, transparent);',
      'background:color-mix(in srgb, currentColor 12%, transparent);}',
      '.dqs-tagReasoning{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);}',
      '.dqs-check{flex:none;color:var(--dsw-alias-brand-primary);display:flex;}',
      '.dqs-pinBtn{flex:none;border:none;background:none;cursor:pointer;padding:2px;border-radius:4px;display:flex;',
      'color:var(--dsw-alias-label-secondary);}',
      '.dqs-pinBtn:hover{color:var(--dsw-alias-brand-primary);}',
      '.dqs-pinBtn[data-pinned="true"]{color:var(--dsw-alias-brand-primary);}',
      '.dqs-status{padding:10px 16px;font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.dqs-statusError{color:var(--dsw-alias-state-error-primary);}',
      '.dqs-footer{padding:12px 18px 13px;font-size:12px;color:var(--dsw-alias-label-secondary);',
      'border-top:.5px solid var(--dsw-alias-border-l1);display:flex;align-items:center;gap:8px 22px;flex-wrap:wrap;}',
      '.dqs-hintItem{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;}',
      '.dqs-kbd{border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));',
      'background:var(--dsw-alias-bg-layer-1);border-radius:5px;',
      'min-width:22px;height:20px;padding:0 7px;box-sizing:border-box;text-align:center;font-size:11px;',
      'color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;}',
      '.dqs-rowDot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);opacity:.45;}',
      '.dqs-rowDot[data-running="true"]{background:var(--dsw-alias-state-success-primary);opacity:1;}',
      '.dqs-rowPin{flex:none;color:var(--dsw-alias-brand-primary);display:flex;}',
      '.dqs-badge{flex:none;font-size:11px;color:var(--dsw-alias-state-warn-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:0 8px;line-height:16px;}',
      /* Panel (mirrors the host Plugins page: centered 960px column) */
      '.dqs-page{box-sizing:border-box;height:100%;color:var(--dsw-alias-label-primary);display:flex;',
      'flex-direction:column;align-items:center;gap:26px;padding:0 clamp(24px,4vw,48px) 48px;overflow:auto;}',
      '.dqs-page>*{width:100%;max-width:960px;}',
      '.dqs-pageHead{padding-top:36px;margin-bottom:-6px;}',
      '.dqs-pageTitle{font-size:20px;font-weight:500;line-height:28px;margin:0 0 6px;}',
      '.dqs-pageSub{font-size:13px;color:var(--dsw-alias-label-secondary);margin:0;}',
      '.dqs-toolbar{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}',
      '.dqs-tabs{display:flex;gap:2px;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);}',
      '.dqs-tab{border:none;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;',
      'padding:7px 20px;border-radius:7px;cursor:pointer;}',
      '.dqs-tab:hover{color:var(--dsw-alias-label-primary);}',
      '.dqs-tab[aria-selected="true"]{background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));',
      'color:var(--dsw-alias-label-primary);font-weight:500;}',
      '.dqs-toolbarRight{margin-left:auto;display:flex;align-items:center;gap:12px;}',
      '.dqs-count{font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.dqs-linkBtn{border:none;background:none;color:var(--dsw-alias-brand-primary);cursor:pointer;font-size:12px;padding:0;}',
      '.dqs-linkBtn:hover{text-decoration:underline;}',
      '.dqs-search{width:220px;height:32px;padding:0 12px;box-sizing:border-box;border-radius:8px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);',
      'color:var(--dsw-alias-label-primary);font-size:13px;outline:none;transition:border-color .12s;}',
      '.dqs-search::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7;}',
      '.dqs-search:hover:not(:focus){border-color:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));}',
      '.dqs-search:focus{border-color:var(--dsw-alias-state-business-primary);}',
      '.dqs-rows{display:flex;flex-direction:column;}',
      '.dqs-cmdRow{display:flex;align-items:center;gap:16px;padding:14px 2px;',
      'border-bottom:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));transition:opacity .15s;}',
      '.dqs-cmdRow[data-enabled="false"]{opacity:.5;}',
      '.dqs-tile{flex:none;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);border:1px solid var(--dsw-alias-border-l1);}',
      '.dqs-cmdInfo{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px;}',
      '.dqs-cmdName{font-size:14px;font-weight:400;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-cmdImpl{font-size:11px;color:var(--dsw-alias-label-secondary);',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-cmdRight{flex:none;display:flex;align-items:center;gap:14px;}',
      '.dqs-cmdKeys{display:flex;align-items:center;gap:3px;}',
      '.dqs-keycap{min-width:20px;height:20px;padding:0 5px;box-sizing:border-box;display:inline-flex;align-items:center;',
      'justify-content:center;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:5px;',
      'font-size:11px;line-height:1;color:var(--dsw-alias-label-secondary);',
      'background:var(--dsw-alias-bg-layer-2);white-space:nowrap;}',
      '.dqs-keycapNone{border:none;background:none;font-size:11px;color:var(--dsw-alias-label-secondary);opacity:.7;}',
      '.dqs-switch{flex:none;position:relative;width:34px;height:20px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));',
      'background:var(--dsw-alias-bg-layer-2);cursor:pointer;padding:0;transition:background .15s,border-color .15s;}',
      '.dqs-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);}',
      '.dqs-switch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;',
      'background:var(--dsw-alias-bg-overlay,#fff);box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .15s;}',
      '.dqs-switch[aria-checked="true"]::after{transform:translateX(14px);}',
      '.dqs-emptyState{padding:56px 0;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px;}',
      /* Custom command editor */
      '.dqs-editor{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;',
      'background:var(--dsw-alias-bg-layer-1);padding:16px 18px;}',
      '.dqs-editorTitle{font-size:13px;font-weight:600;margin-bottom:14px;}',
      '.dqs-editorRow{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;}',
      '.dqs-editorLabel{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.dqs-select{height:32px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-size:13px;',
      'padding:0 8px;outline:none;max-width:320px;}',
      '.dqs-recordBtn{height:32px;min-width:150px;padding:0 12px;border-radius:8px;',
      'border:1px dashed var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:transparent;',
      'color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer;display:inline-flex;',
      'align-items:center;justify-content:center;gap:4px;outline:none;}',
      '.dqs-recordBtn[data-recording="true"]{border-style:solid;border-color:var(--dsw-alias-brand-primary);',
      'color:var(--dsw-alias-brand-primary);}',
      '.dqs-editorHelp{font-size:11px;color:var(--dsw-alias-label-secondary);}',
      '.dqs-editorError{font-size:12px;color:var(--dsw-alias-state-error-primary);}',
      '.dqs-editorActions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}',
      '.dqs-saveBtn{height:30px;padding:0 16px;border-radius:8px;border:1px solid var(--dsw-alias-brand-primary);',
      'background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-overlay,#fff);font-size:13px;cursor:pointer;}',
      '.dqs-ghostBtn{height:30px;padding:0 16px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));',
      'background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;cursor:pointer;}',
      '.dqs-ghostBtn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}',
      '.dqs-removeBtn{flex:none;border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-secondary);',
      'display:flex;padding:4px;border-radius:6px;}',
      '.dqs-removeBtn:hover{color:var(--dsw-alias-state-error-primary);',
      'background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}',
      '.dqs-hintbar{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:1300;',
      'background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1)));',
      'backdrop-filter:var(--dsw-menu-backdrop-filter,blur(20px));-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter,blur(20px));',
      'border:.5px solid var(--dsw-alias-border-l1);',
      'border-radius:999px;padding:8px 18px;font-size:13px;color:var(--dsw-alias-label-primary);',
      'box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.28));pointer-events:none;}',
      /* Session palette: right-hand preview pane (always visible) */
      '.dqs-previewPane{flex:0 0 42%;border-left:.5px solid var(--dsw-alias-border-l1);',
      'display:flex;flex-direction:column;min-width:0;height:100%;}',
      '.dqs-previewHead{display:flex;gap:10px;align-items:baseline;padding:10px 16px 4px;font-size:12px;font-weight:600;}',
      '.dqs-previewSession{flex:1 1 auto;min-width:0;color:var(--dsw-alias-label-secondary);font-weight:400;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-previewMeta{padding:0 16px 6px;font-size:11px;color:var(--dsw-alias-label-secondary);',
      'display:flex;gap:8px;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-previewScroll{flex:1 1 auto;overflow-y:auto;min-height:0;padding:2px 0 8px;}',
      '.dqs-previewLine{padding:2px 16px;font-size:12px;color:var(--dsw-alias-label-secondary);',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      /* Permission cycle card */
      '.dqs-permCard{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;',
      'background:var(--dsw-alias-bg-layer-1);padding:16px 18px;}',
      '.dqs-sectionHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px;}',
      '.dqs-sectionTitle{font-size:14px;font-weight:500;line-height:20px;}',
      '.dqs-chips{display:flex;gap:8px;flex-wrap:wrap;}',
      '.dqs-permChip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));',
      'border-radius:999px;padding:5px 14px;font-size:12px;cursor:pointer;background:transparent;color:var(--dsw-alias-label-secondary);}',
      '.dqs-permChip:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}',
      '.dqs-permChip[data-included="true"]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:500;}',
      '.dqs-hint{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:8px;line-height:1.6;}',
      /* Expandable permission config + system shortcut rows */
      '.dqs-expandBtn{flex:none;border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-secondary);',
      'display:flex;padding:4px;border-radius:6px;}',
      '.dqs-expandBtn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));',
      'color:var(--dsw-alias-label-primary);}',
      '.dqs-expand{padding:2px 2px 18px 64px;}',
      '.dqs-sysRow{display:flex;align-items:center;gap:12px;padding:12px 2px;',
      'border-bottom:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));}',
      '.dqs-sysLabel{flex:1 1 auto;min-width:0;font-size:14px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dqs-tip{position:relative;}',
      '.dqs-tip:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;',
      'transform:translateX(-50%);background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));',
      'border:.5px solid var(--dsw-alias-border-l1);border-radius:6px;padding:3px 8px;font-size:11px;',
      'line-height:16px;color:var(--dsw-alias-label-primary);white-space:nowrap;z-index:20;',
      'box-shadow:var(--dsw-elevation-prominent,0 6px 16px rgba(0,0,0,.18));pointer-events:none;}',
      '.dqs-iconBtn{flex:none;border:none;background:none;cursor:pointer;display:flex;padding:4px;',
      'border-radius:6px;color:var(--dsw-alias-label-secondary);}',
      '.dqs-iconBtn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}',
      '.dqs-iconBtn[data-hidden="true"]{visibility:hidden;pointer-events:none;}',
      '.dqs-sysFixed{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary);',
      'border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:1px 8px;}'
    ].join('');

    /* ------------------------------------------------------------------ */
    /* Small stores                                                        */
    /* ------------------------------------------------------------------ */

    function createStore(initial) {
      let value = initial;
      const listeners = new Set();
      const emit = () => { for (const fn of [...listeners]) fn(); };
      return {
        getSnapshot: () => value,
        subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; },
        set(next) { if (Object.is(next, value)) return; value = next; emit(); },
        update(fn) { this.set(fn(value)); }
      };
    }

    function readJsonArray(key) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
      } catch { return []; }
    }

    function createPinStore() {
      const base = createStore(readJsonArray(PIN_KEY));
      const persist = () => {
        try { localStorage.setItem(PIN_KEY, JSON.stringify(base.getSnapshot())); } catch { /* private mode */ }
      };
      return {
        getSnapshot: base.getSnapshot,
        subscribe: base.subscribe,
        toggle(key) {
          const value = base.getSnapshot();
          base.set(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
          persist();
        }
      };
    }

    function readDisabled() {
      try {
        const parsed = JSON.parse(localStorage.getItem(TOGGLE_KEY));
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
      } catch { return []; }
    }

    function createEnabledStore() {
      const base = createStore(readDisabled());
      const persist = () => {
        try { localStorage.setItem(TOGGLE_KEY, JSON.stringify(base.getSnapshot())); } catch { /* private mode */ }
      };
      return {
        getSnapshot: base.getSnapshot,
        isEnabled: (id) => !base.getSnapshot().includes(id),
        subscribe: base.subscribe,
        toggle(id) {
          const disabled = base.getSnapshot();
          base.set(disabled.includes(id) ? disabled.filter((x) => x !== id) : [...disabled, id]);
          persist();
        },
        setAll(enabled, ids) {
          base.set(enabled ? [] : [...(ids ?? COMMAND_IDS)]);
          persist();
        }
      };
    }

    function useStore(store) {
      return useSyncExternalStore(store.subscribe, store.getSnapshot);
    }

    /* ------------------------------------------------------------------ */
    /* Session / permission / model data access                            */
    /* ------------------------------------------------------------------ */

    function mainSessionId(ctx) {
      try {
        const snap = ctx.sessions.list.getSnapshot();
        const row = Object.values(snap?.byId ?? {}).find((r) => (r?.retainedBy?.mainView ?? 0) > 0);
        return row?.id;
      } catch { return undefined; }
    }

    function useSessionId(ctx) {
      const list = ctx.sessions?.list;
      return useSyncExternalStore(
        (cb) => (list && typeof list.subscribe === 'function') ? list.subscribe(cb) : () => {},
        () => {
          try {
            const snap = list.getSnapshot();
            return Object.values(snap?.byId ?? {}).find((r) => (r?.retainedBy?.mainView ?? 0) > 0)?.id;
          } catch { return undefined; }
        }
      );
    }

    function liveSession(ctx, sessionId) {
      if (sessionId === undefined) return undefined;
      try { return ctx.sessions.binding(sessionId)?.session; } catch { return undefined; }
    }

    const EMPTY_SESSIONS_SNAP = Object.freeze({ byId: {}, ids: [] });
    const EMPTY_WORKSPACES_SNAP = Object.freeze({ items: [], archivedSessionIds: [], pinnedSessionIds: [] });
    const EMPTY_SHORTCUT_ROWS = Object.freeze([]);

    function useSessionsList(ctx) {
      const list = ctx.sessions?.list;
      return useSyncExternalStore(
        (cb) => (list?.subscribe ? list.subscribe(cb) : () => {}),
        () => { try { return list ? list.getSnapshot() : EMPTY_SESSIONS_SNAP; } catch { return EMPTY_SESSIONS_SNAP; } }
      );
    }

    function useWorkspacesList(ctx) {
      const list = ctx.workspaces?.list;
      return useSyncExternalStore(
        (cb) => (list?.subscribe ? list.subscribe(cb) : () => {}),
        () => { try { return list ? list.getSnapshot() : EMPTY_WORKSPACES_SNAP; } catch { return EMPTY_WORKSPACES_SNAP; } }
      );
    }

    function useShortcutRows(ctx) {
      const catalog = ctx.shortcuts?.catalog;
      return useSyncExternalStore(
        (cb) => (catalog?.subscribe ? catalog.subscribe(cb) : () => {}),
        () => { try { return catalog?.getSnapshot ? catalog.getSnapshot() : EMPTY_SHORTCUT_ROWS; } catch { return EMPTY_SHORTCUT_ROWS; } }
      );
    }

    /** Mirrors ui-workspace visibility: no subagent children; blank only when current. */
    function isListableSession(summary, id, currentId) {
      if (!summary) return false;
      if (summary.origin === 'subagent') return false;
      if (summary.blank && id !== currentId) return false;
      return true;
    }

    /**
     * Cycle order mirroring the sidebar's default recency view (newest first):
     * "next" walks down the visible list (older), "previous" walks up (newer).
     */
    function visibleSessionOrder(workspacesSnap, sessionsSnap, currentId) {
      const archived = new Set(workspacesSnap?.archivedSessionIds ?? []);
      const byId = sessionsSnap?.byId ?? {};
      const rows = [];
      for (const [id, summary] of Object.entries(byId)) {
        if (archived.has(id) || !isListableSession(summary, id, currentId)) continue;
        rows.push({ id, at: summary?.updatedAt ?? 0 });
      }
      rows.sort((a, b) => (b.at - a.at) || (a.id < b.id ? -1 : 1));
      return rows.map((row) => row.id);
    }

    function openSessionId(ctx, sessionId) {
      ctx.uiWorkspace.openSession(sessionId);
      try {
        if (ctx.layout?.panelInfo?.getSnapshot?.().activePanelId != null) ctx.layout.selectPanel(null);
      } catch { /* navigation already restored the conversation */ }
    }

    function focusComposer(ctx, sessionId) {
      try {
        if (ctx.layout?.panelInfo?.getSnapshot?.().activePanelId != null) ctx.layout.selectPanel(null);
      } catch { /* noop */ }
      const attempt = () => {
        try {
          const conversation = ctx.conversation ?? ctx.get?.('conversation');
          const scope = ctx.sessions.scope(sessionId);
          const input = scope && conversation?.input?.for ? conversation.input.for(scope) : undefined;
          input?.focus?.();
        } catch (error) {
          console.warn('[shortcut-ext] focus composer failed', error);
        }
      };
      setTimeout(attempt, 0);
    }

    /**
     * Jump target selection with the host's own "answered while away" semantics:
     * a session counts as completed-unvisited when its activity time is newer
     * than the last moment the user viewed it. Tiers: completed first, then
     * still-answering sessions, then nothing.
     */
    function createJumpTracker(ctx) {
      const visited = new Map();
      let seeded = false;
      let lastMain = mainSessionId(ctx);
      const readSessions = () => {
        try { return ctx.sessions.list.getSnapshot(); } catch { return EMPTY_SESSIONS_SNAP; }
      };
      const readArchived = () => {
        try { return new Set(ctx.workspaces?.list?.getSnapshot?.().archivedSessionIds ?? []); }
        catch { return new Set(); }
      };
      const seed = (byId) => {
        for (const [id, summary] of Object.entries(byId)) visited.set(id, summary?.updatedAt ?? 0);
        seeded = true;
      };
      const syncView = () => {
        const byId = readSessions()?.byId ?? {};
        if (!seeded && Object.keys(byId).length > 0) seed(byId);
        const current = mainSessionId(ctx);
        if (current !== lastMain) {
          lastMain = current;
          if (current) visited.set(current, Date.now());
        }
      };
      syncView();
      const off = (() => {
        try {
          const list = ctx.sessions?.list;
          return list?.subscribe ? list.subscribe(syncView) : undefined;
        } catch { return undefined; }
      })();
      return {
        /** @returns 'done' | 'running' | 'none' */
        jump() {
          syncView();
          const byId = readSessions()?.byId ?? {};
          const archived = readArchived();
          const done = [];
          const running = [];
          for (const [id, summary] of Object.entries(byId)) {
            if (archived.has(id) || !isListableSession(summary, id, lastMain)) continue;
            const at = summary?.updatedAt ?? 0;
            if (summary?.running === true) running.push({ id, at });
            else if (at > (visited.get(id) ?? 0)) done.push({ id, at });
          }
          done.sort((a, b) => b.at - a.at);
          running.sort((a, b) => a.at - b.at);
          const target = done[0] ?? running[0];
          if (!target) return 'none';
          try {
            openSessionId(ctx, target.id);
            visited.set(target.id, Date.now());
            lastMain = target.id;
          } catch (error) {
            console.error('[shortcut-ext] jump failed', error);
          }
          return done[0] ? 'done' : 'running';
        },
        dispose() { if (typeof off === 'function') off(); }
      };
    }

    function buildSessionRows(sessionsSnap, workspacesSnap, query, currentId, t) {
      const archived = new Set(workspacesSnap?.archivedSessionIds ?? []);
      const pinned = new Set(workspacesSnap?.pinnedSessionIds ?? []);
      const workspaceOf = new Map();
      for (const workspace of workspacesSnap?.items ?? []) {
        for (const id of workspace?.sessionIds ?? []) workspaceOf.set(id, workspace?.title ?? '');
      }
      const rows = [];
      for (const [id, summary] of Object.entries(sessionsSnap?.byId ?? {})) {
        if (!isListableSession(summary, id, currentId)) continue;
        rows.push({
          id,
          title: summary?.displayTitle || (summary?.blank ? t('session.newSession') : String(id).slice(0, 8)),
          archived: archived.has(id),
          pinned: pinned.has(id),
          running: summary?.running === true,
          updatedAt: summary?.updatedAt ?? 0,
          workspace: workspaceOf.get(id) ?? ''
        });
      }
      const q = query.trim().toLowerCase();
      let list = rows;
      if (q !== '') {
        list = rows
          .map((row, index) => {
            const title = row.title.toLowerCase();
            const score = title.startsWith(q) ? 3
              : title.includes(q) ? 2
              : subsequence(q, title) ? 1
              : subsequence(q, row.workspace.toLowerCase()) ? 1
              : 0;
            return { row, index, score };
          })
          .filter((entry) => entry.score > 0)
          .sort((a, b) => (b.score - a.score) || (a.index - b.index))
          .map((entry) => entry.row);
      }
      list.sort((a, b) => (Number(a.archived) - Number(b.archived)) ||
        (q !== '' ? 0 : ((Number(b.pinned) - Number(a.pinned)) || (b.updatedAt - a.updatedAt))));
      return list;
    }

    function relativeTimeLabel(updatedAt, now, t) {
      if (!updatedAt) return '';
      const diff = Math.max(0, now - updatedAt);
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return t('time.now');
      if (minutes < 60) return t('time.minutes').replace('{n}', String(minutes));
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return t('time.hours').replace('{n}', String(hours));
      const days = Math.floor(hours / 24);
      if (days < 30) return t('time.days').replace('{n}', String(days));
      const date = new Date(updatedAt);
      return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function useLocaleTick(ctx) {
      const [, tick] = useReducer((n) => n + 1, 0);
      useEffect(() => {
        try { return ctx.locale.subscribe(tick); } catch { return undefined; }
      }, [ctx]);
    }

    async function switchPermission(ctx, preset) {
      const sessionId = mainSessionId(ctx);
      const live = liveSession(ctx, sessionId);
      if (!live || typeof live.command !== 'function') throw new Error('NO_SESSION');
      const result = await live.command(`/permission ${preset}`);
      if (!result?.ok) throw new Error(`${result?.error?.code ?? 'error'}: ${result?.error?.message ?? ''}`);
      if (!result.value?.matched) throw new Error('NO_COMMAND');
      return true;
    }

    const EMPTY_MODEL_STATE = Object.freeze({
      current: null, routable: null, groups: [], failures: [], status: 'idle', pending: null, error: null
    });

    function useModelDirectory(ctx, sessionId) {
      const [dir, setDir] = useState(undefined);
      useEffect(() => {
        if (sessionId === undefined || !ctx.modelDirectories?.directoryFor) { setDir(undefined); return; }
        let next;
        try { next = ctx.modelDirectories.directoryFor(sessionId); } catch { next = undefined; }
        setDir(next);
        if (next) next.load().catch(() => {});
      }, [ctx, sessionId]);
      const snap = useSyncExternalStore(
        (cb) => (dir?.store && typeof dir.store.subscribe === 'function') ? dir.store.subscribe(cb) : () => {},
        () => (dir?.store ? dir.store.getSnapshot() : EMPTY_MODEL_STATE)
      );
      return { dir, snap };
    }

    /* ------------------------------------------------------------------ */
    /* Session outline preview + permission cycle                          */
    /* ------------------------------------------------------------------ */

    /** Read the host `turnOutline` projection: one 50-char prompt line per turn. */
    async function loadOutline(ctx, sessionId) {
      const read = (session) => {
        let snap;
        try { snap = session?.projections?.faceOf?.('turnOutline')?.getSnapshot?.(); }
        catch { return undefined; }
        if (snap === undefined || snap === null) return undefined;
        if (Array.isArray(snap)) return snap;
        if (Array.isArray(snap.entries)) return snap.entries;
        return undefined;
      };
      const binding = ctx.sessions.binding(sessionId);
      if (binding?.session) return read(binding.session);
      return await ctx.sessions.using(
        sessionId,
        { source: 'shortcutExtPreview' },
        (reference) => read(reference.binding.session)
      );
    }

    function usePermissionValue(ctx, sessionId) {
      let face;
      try {
        face = sessionId === undefined ? undefined
          : ctx.sessions.binding(sessionId)?.session?.projections?.faceOf?.('permissions');
      } catch { face = undefined; }
      return useSyncExternalStore(
        (cb) => (face && typeof face.subscribe === 'function') ? face.subscribe(cb) : () => {},
        () => { try { return face ? face.getSnapshot() : undefined; } catch { return undefined; } }
      );
    }

    function usePermissionCatalog(ctx) {
      const store = useMemo(() => createStore({ status: 'idle', options: [], error: null }), [ctx]);
      useEffect(() => {
        let disposed = false;
        const load = () => {
          const ns = ctx.remote?.permissionPresets;
          if (!ns || typeof ns.catalog !== 'function') {
            store.set({ status: 'unavailable', options: [], error: null });
            return;
          }
          store.set({ ...store.getSnapshot(), status: 'loading' });
          ns.catalog().then((result) => {
            if (disposed) return;
            if (!result?.ok) throw new Error(`${result?.error?.code ?? 'error'}: ${result?.error?.message ?? ''}`);
            store.set({ status: 'ready', options: result.value?.options ?? [], error: null });
          }).catch((error) => {
            if (!disposed) store.set({ status: 'error', options: [], error: error?.message ?? String(error) });
          });
        };
        load();
        let off;
        try { off = ctx.remote?.$on?.('permission-presets/catalog-changed', load); } catch { off = undefined; }
        return () => { disposed = true; if (typeof off === 'function') off(); };
      }, [ctx, store]);
      return useStore(store);
    }

    const PERM_CYCLE_KEY = 'dsh.shortcut-ext.perm-cycle.v1';
    const CANONICAL_PRESETS = ['read-only', 'workspace-write', 'danger-full-access'];

    function presetOrder(value) {
      const index = CANONICAL_PRESETS.indexOf(value);
      return index === -1 ? 99 : index;
    }

    function readPermCycle() {
      try {
        const parsed = JSON.parse(localStorage.getItem(PERM_CYCLE_KEY));
        if (Array.isArray(parsed)) {
          const clean = [...new Set(parsed.filter((v) => typeof v === 'string' && v !== 'auto' && v !== 'custom'))];
          if (clean.length >= 2) return clean.sort((a, b) => presetOrder(a) - presetOrder(b));
        }
      } catch { /* fall through to default */ }
      return ['read-only', 'danger-full-access'];
    }

    function createPermCycleStore() {
      const base = createStore(readPermCycle());
      const persist = () => {
        try { localStorage.setItem(PERM_CYCLE_KEY, JSON.stringify(base.getSnapshot())); } catch { /* private mode */ }
      };
      return {
        getSnapshot: base.getSnapshot,
        subscribe: base.subscribe,
        /** @returns false when the removal would leave fewer than two presets */
        toggle(value) {
          const list = base.getSnapshot();
          if (list.includes(value)) {
            if (list.length <= 2) return false;
            base.set(list.filter((v) => v !== value));
          } else {
            base.set([...list, value].sort((a, b) => presetOrder(a) - presetOrder(b)));
          }
          persist();
          return true;
        }
      };
    }

    /* ------------------------------------------------------------------ */
    /* Row building and matching                                           */
    /* ------------------------------------------------------------------ */

    function subsequence(query, text) {
      let i = 0;
      for (let j = 0; j < text.length && i < query.length; j++) {
        if (text[j] === query[i]) i++;
      }
      return i === query.length;
    }

    function matchScore(query, row) {
      const name = row.name.toLowerCase();
      const provider = row.providerName.toLowerCase();
      if (name.startsWith(query)) return 3;
      if (name.includes(query) || provider.includes(query)) return 2;
      if (subsequence(query, name)) return 1;
      return 0;
    }

    /** AntD-style preset hues, assigned to providers by stable catalog order. */
    const PROVIDER_HUES = [210, 102, 24, 262, 188, 334, 74, 14, 230, 50];

    function buildRows(snap, pinnedKeys, query) {
      const all = [];
      const groups = snap?.groups ?? [];
      for (let gi = 0; gi < groups.length; gi++) {
        const group = groups[gi];
        for (const model of group?.models ?? []) {
          const fullName = model.name ?? model.id;
          const dot = fullName.lastIndexOf('\u00B7');
          const base = dot > 0 ? fullName.slice(0, dot).trim() : '';
          const suffix = dot > 0 && dot < fullName.length - 1 ? fullName.slice(dot + 1).trim() : '';
          all.push({
            provider: group.id,
            providerName: group.name ?? group.id,
            hue: PROVIDER_HUES[gi % PROVIDER_HUES.length],
            model: model.id,
            name: fullName,
            baseName: base || fullName,
            suffix,
            reasoning: model.reasoning,
            description: model.description,
            key: `${group.id}/${model.id}`
          });
        }
      }
      const q = query.trim().toLowerCase();
      let list = all;
      if (q !== '') {
        list = all
          .map((row, index) => ({ row, index, score: matchScore(q, row) }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => (b.score - a.score) || (a.index - b.index))
          .map((entry) => entry.row);
      }
      const pinOrder = new Map(pinnedKeys.map((key, index) => [key, index]));
      const pinned = list.filter((row) => pinOrder.has(row.key))
        .sort((a, b) => pinOrder.get(a.key) - pinOrder.get(b.key));
      const rest = list.filter((row) => !pinOrder.has(row.key));
      return [...pinned, ...rest];
    }

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    function StarIcon({ pinned }) {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true, style: { display: 'block' }
      }, h('path', {
        d: 'M8 1.6l1.85 3.95 4.35.52-3.2 2.95.86 4.28L8 11.2l-3.86 2.1.86-4.28-3.2-2.95 4.35-.52z',
        fill: pinned ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: 1.2,
        strokeLinejoin: 'round'
      }));
    }

    function CheckIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true, style: { display: 'block' }
      }, h('path', {
        d: 'M3 8.6 6.4 12 13 4.6', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
        strokeLinecap: 'round', strokeLinejoin: 'round'
      }));
    }


    /** Sidebar glyph: Lucide `keyboard` (ISC) - https://lucide.dev/icons/keyboard */
    function PanelIcon({ size, active }) {
      const px = size ?? 16;
      const dot = (d) => h('path', { key: d, d });
      return h('svg', {
        width: px,
        height: px,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        style: { display: 'block', color: active ? 'var(--dsw-alias-state-business-primary)' : undefined }
      },
        h('rect', { key: 'frame', x: 2, y: 4, width: 20, height: 16, rx: 2 }),
        dot('M6 8h.01'),
        dot('M10 8h.01'),
        dot('M14 8h.01'),
        dot('M18 8h.01'),
        dot('M8 12h.01'),
        dot('M12 12h.01'),
        dot('M16 12h.01'),
        dot('M7 16h10'));
    }


    /** Lucide `rotate-ccw` (ISC) - restore a command's default binding. */
    function ResetIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
        style: { display: 'block' }
      },
        h('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
        h('path', { d: 'M3 3v5h5' }));
    }

    /* ------------------------------------------------------------------ */
    /* Model palette                                                       */
    /* ------------------------------------------------------------------ */

    function PaletteLayer(props) {
      const open = useStore(props.openStore);
      if (!open) return null;
      return h(PaletteInner, props);
    }

    function PaletteInner({ ctx, t, openStore, pins }) {
      useLocaleTick(ctx);
      const sessionId = useSessionId(ctx);
      const { dir, snap } = useModelDirectory(ctx, sessionId);
      const pinnedKeys = useStore(pins);
      const [query, setQuery] = useState('');
      const [highlight, setHighlight] = useState(0);
      const [busyKey, setBusyKey] = useState(null);
      const [error, setError] = useState(null);
      const inputRef = useRef(null);
      const rowRefs = useRef([]);

      useEffect(() => {
        const id = setTimeout(() => { try { inputRef.current?.focus(); } catch { /* noop */ } }, 0);
        return () => clearTimeout(id);
      }, []);

      useEffect(() => {
        const onDocKey = (event) => {
          if (event.isComposing || event.keyCode === 229) return;
          if (event.key === 'Escape') { event.preventDefault(); openStore.set(false); }
        };
        document.addEventListener('keydown', onDocKey, true);
        return () => document.removeEventListener('keydown', onDocKey, true);
      }, [openStore]);

      const rows = useMemo(() => buildRows(snap, pinnedKeys, query), [snap, pinnedKeys, query]);
      const currentKey = snap?.current ? `${snap.current.provider}/${snap.current.model}` : null;

      useEffect(() => {
        setHighlight((prev) => Math.min(prev, Math.max(0, rows.length - 1)));
      }, [rows.length]);

      useEffect(() => {
        try { rowRefs.current[highlight]?.scrollIntoView({ block: 'nearest' }); } catch { /* noop */ }
      }, [highlight]);

      const select = useCallback(async (row) => {
        if (busyKey !== null || !dir) return;
        setBusyKey(row.key);
        setError(null);
        try {
          const result = await dir.select({ provider: row.provider, model: row.model });
          if (result?.ok) {
            openStore.set(false);
            return;
          }
          setError(`${t('palette.selectFailed')}: ${result?.error?.message ?? result?.error?.code ?? ''}`);
        } catch (e) {
          setError(`${t('palette.selectFailed')}: ${e?.message ?? e}`);
        } finally {
          setBusyKey(null);
        }
      }, [busyKey, dir, openStore, t]);

      const onKeyDown = (event) => {
        if (event.isComposing || event.keyCode === 229) return;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setHighlight((prev) => (rows.length === 0 ? 0 : (prev + 1) % rows.length));
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setHighlight((prev) => (rows.length === 0 ? 0 : (prev - 1 + rows.length) % rows.length));
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const row = rows[highlight];
          if (row) select(row);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          openStore.set(false);
        }
      };

      let status = null;
      if (sessionId === undefined) status = t('palette.noSession');
      else if (snap.status === 'loading' || snap.status === 'idle') status = t('palette.loading');
      else if (snap.status === 'error') status = `${t('palette.loadError')}${snap.error ? `: ${snap.error}` : ''}`;
      else if (rows.length === 0) status = query.trim() === '' ? t('palette.empty') : t('palette.noMatch');

      const failures = snap?.failures ?? [];

      return h('div', {
        className: 'dqs-backdrop',
        onMouseDown: () => openStore.set(false)
      },
        h('div', {
          className: 'dqs-palette',
          role: 'dialog',
          'aria-label': t('palette.title'),
          onMouseDown: (event) => event.stopPropagation()
        },
          h('div', { className: 'dqs-paletteHead' },
            h('span', { className: 'dqs-paletteTitle' }, t('palette.title')),
            h('button', {
              type: 'button',
              className: 'dqs-closeBtn',
              'aria-label': t('palette.hint.close'),
              onClick: () => openStore.set(false)
            }, '\u2715')),
          h('div', { className: 'dqs-searchWrap' },
            h('span', { className: 'dqs-searchIcon' }, h(SearchIcon)),
            h('input', {
              className: 'dqs-input',
              ref: inputRef,
              value: query,
              placeholder: t('palette.placeholder'),
              'aria-label': t('palette.title'),
              autoComplete: 'off',
              spellCheck: false,
              onChange: (event) => { setQuery(event.target.value); setHighlight(0); },
              onKeyDown
            })),
          h('div', { className: 'dqs-list', role: 'listbox', 'aria-label': t('palette.title') },
            rows.map((row, index) => {
              const pinned = pinnedKeys.includes(row.key);
              const isCurrent = row.key === currentKey;
              return h('div', {
                key: row.key,
                ref: (el) => { rowRefs.current[index] = el; },
                className: 'dqs-row',
                role: 'option',
                'aria-selected': index === highlight,
                'data-active': index === highlight ? 'true' : 'false',
                onMouseEnter: () => setHighlight(index),
                onClick: () => select(row)
              },
                h('button', {
                  type: 'button',
                  className: 'dqs-tag dqs-tagProvider',
                  style: { '--dqs-hue': String(row.hue ?? 210) },
                  title: row.providerName,
                  onClick: (event) => { event.stopPropagation(); setQuery(row.providerName); setHighlight(0); }
                }, row.providerName),
                h('button', {
                  type: 'button',
                  className: 'dqs-pinBtn',
                  'data-pinned': pinned ? 'true' : 'false',
                  title: t('palette.pin'),
                  'aria-label': `${t('palette.pin')}: ${row.name}`,
                  'aria-pressed': pinned,
                  onClick: (event) => { event.stopPropagation(); pins.toggle(row.key); }
                }, h(StarIcon, { pinned })),
                h('span', { className: 'dqs-rowName', title: row.description ?? undefined }, row.baseName),
                row.suffix
                  ? h('button', {
                    type: 'button',
                    className: 'dqs-tag',
                    title: row.suffix,
                    onClick: (event) => { event.stopPropagation(); setQuery(row.suffix); setHighlight(0); }
                  }, row.suffix)
                  : null,
                row.reasoning
                  ? h('span', { className: 'dqs-tag dqs-tagReasoning' },
                    `${t('tag.reasoning')}\u00B7${row.reasoning?.efforts?.length ?? 0}`)
                  : null,
                h('span', { className: 'dqs-rowEnd' },
                  busyKey === row.key
                    ? h('span', { className: 'dqs-rowBusy' }, t('palette.switching'))
                    : (isCurrent ? h('span', { className: 'dqs-check' }, h(CheckIcon)) : null))
              );
            })),
          status ? h('div', {
            className: `dqs-status${snap.status === 'error' ? ' dqs-statusError' : ''}`
          }, status) : null,
          error ? h('div', { className: 'dqs-status dqs-statusError' }, error) : null,
          !status && failures.length > 0
            ? h('div', { className: 'dqs-status' }, t('palette.providerFailures'))
            : null,
          h('div', { className: 'dqs-footer' },
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, '\u2191\u2193'), t('palette.hint.nav')),
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, 'Enter'), t('palette.hint.confirm')),
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, 'Esc'), t('palette.hint.close')),
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, '\u2605'), t('palette.hint.pin')),
            h('span', { className: 'dqs-hintItem' }, t('palette.hint.tag')))
        ));
    }

    /* ------------------------------------------------------------------ */
    /* Session palette (quick open for sessions, archived included)        */
    /* ------------------------------------------------------------------ */

    function SessionPaletteLayer(props) {
      const open = useStore(props.openStore);
      if (!open) return null;
      return h(SessionPaletteInner, props);
    }

    function SessionPaletteInner({ ctx, t, openStore }) {
      useLocaleTick(ctx);
      const sessionsSnap = useSessionsList(ctx);
      const workspacesSnap = useWorkspacesList(ctx);
      const currentId = useSessionId(ctx);
      const [query, setQuery] = useState('');
      const [highlight, setHighlight] = useState(0);
      const [busyId, setBusyId] = useState(null);
      const [error, setError] = useState(null);
      const [preview, setPreview] = useState(null);
      const outlineCache = useRef(new Map());
      const inputRef = useRef(null);
      const rowRefs = useRef([]);
      const now = Date.now();

      useEffect(() => {
        const id = setTimeout(() => { try { inputRef.current?.focus(); } catch { /* noop */ } }, 0);
        return () => clearTimeout(id);
      }, []);

      useEffect(() => {
        const onDocKey = (event) => {
          if (event.isComposing || event.keyCode === 229) return;
          if (event.key === 'Escape') { event.preventDefault(); openStore.set(false); }
        };
        document.addEventListener('keydown', onDocKey, true);
        return () => document.removeEventListener('keydown', onDocKey, true);
      }, [openStore]);

      const rows = useMemo(
        () => buildSessionRows(sessionsSnap, workspacesSnap, query, currentId, t),
        [sessionsSnap, workspacesSnap, query, currentId, t]
      );

      useEffect(() => {
        setHighlight((prev) => Math.min(prev, Math.max(0, rows.length - 1)));
      }, [rows.length]);

      useEffect(() => {
        try { rowRefs.current[highlight]?.scrollIntoView({ block: 'nearest' }); } catch { /* noop */ }
      }, [highlight]);

      // Right-hand preview follows the highlight; debounced so fast arrow
      // sweeps do not retain cold sessions one by one.
      const previewId = rows[highlight]?.id ?? null;
      useEffect(() => {
        if (previewId === null) { setPreview(null); return undefined; }
        const cached = outlineCache.current.get(previewId);
        if (cached) { setPreview({ id: previewId, status: 'ready', lines: cached }); return undefined; }
        let cancelled = false;
        const timer = setTimeout(() => {
          setPreview({ id: previewId, status: 'loading', lines: [] });
          loadOutline(ctx, previewId).then((outline) => {
            if (cancelled) return;
            if (outline === undefined) { setPreview({ id: previewId, status: 'unavailable', lines: [] }); return; }
            const lines = outline.map((entry) => entry?.prompt ?? '').filter((text) => text !== '');
            outlineCache.current.set(previewId, lines);
            setPreview({ id: previewId, status: 'ready', lines });
          }).catch(() => {
            if (!cancelled) setPreview({ id: previewId, status: 'unavailable', lines: [] });
          });
        }, 150);
        return () => { cancelled = true; clearTimeout(timer); };
      }, [previewId, ctx]);

      const openRow = useCallback(async (row) => {
        if (busyId !== null) return;
        setBusyId(row.id);
        setError(null);
        try {
          if (row.archived) await ctx.uiWorkspace.unarchiveSession(row.id);
          openSessionId(ctx, row.id);
          openStore.set(false);
        } catch (e) {
          setError(`${t('session.openFailed')}: ${e?.message ?? e}`);
        } finally {
          setBusyId(null);
        }
      }, [busyId, ctx, openStore, t]);

      const onKeyDown = (event) => {
        if (event.isComposing || event.keyCode === 229) return;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setHighlight((prev) => (rows.length === 0 ? 0 : (prev + 1) % rows.length));
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setHighlight((prev) => (rows.length === 0 ? 0 : (prev - 1 + rows.length) % rows.length));
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const row = rows[highlight];
          if (row) openRow(row);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          openStore.set(false);
        }
      };

      let status = null;
      if (rows.length === 0) {
        status = Object.keys(sessionsSnap?.byId ?? {}).length === 0
          ? t('session.noneYet')
          : (query.trim() === '' ? t('session.noneYet') : t('session.empty'));
      }

      const currentRow = rows[highlight];
      const previewMeta = currentRow
        ? [
          currentRow.archived ? t('session.badgeArchived') : null,
          currentRow.workspace || null,
          relativeTimeLabel(currentRow.updatedAt, now, t) || null
        ].filter(Boolean).join(' \u00B7 ')
        : '\u00A0';

      return h('div', {
        className: 'dqs-backdrop',
        onMouseDown: () => openStore.set(false)
      },
        h('div', {
          className: 'dqs-palette dqs-paletteWide',
          role: 'dialog',
          'aria-label': t('session.paletteTitle'),
          onMouseDown: (event) => event.stopPropagation()
        },
          h('div', { className: 'dqs-paletteHead' },
            h('span', { className: 'dqs-paletteTitle' }, t('session.paletteTitle')),
            h('button', {
              type: 'button',
              className: 'dqs-closeBtn',
              'aria-label': t('session.hint.close'),
              onClick: () => openStore.set(false)
            }, '\u2715')),
          h('div', { className: 'dqs-searchWrap' },
            h('span', { className: 'dqs-searchIcon' }, h(SearchIcon)),
            h('input', {
              className: 'dqs-input',
              ref: inputRef,
              value: query,
              placeholder: t('session.placeholder'),
              'aria-label': t('session.paletteTitle'),
              autoComplete: 'off',
              spellCheck: false,
              onChange: (event) => { setQuery(event.target.value); setHighlight(0); },
              onKeyDown
            })),
          h('div', { className: 'dqs-columns' },
            h('div', { className: 'dqs-list', role: 'listbox', 'aria-label': t('session.paletteTitle') },
              status
                ? h('div', { className: 'dqs-status' }, status)
                : rows.map((row, index) => h('div', {
                  key: row.id,
                  ref: (el) => { rowRefs.current[index] = el; },
                  className: 'dqs-row',
                  role: 'option',
                  'aria-selected': index === highlight,
                  'data-active': index === highlight ? 'true' : 'false',
                  onMouseEnter: () => setHighlight(index),
                  onClick: () => openRow(row)
                },
                  h('span', {
                    className: 'dqs-rowDot',
                    'data-running': row.running ? 'true' : 'false',
                    'aria-hidden': true
                  }),
                  h('span', { className: 'dqs-rowName' }, row.title),
                  row.pinned ? h('span', { className: 'dqs-rowPin', 'aria-hidden': true }, h(StarIcon, { pinned: true })) : null,
                  row.archived ? h('span', { className: 'dqs-badge' }, t('session.badgeArchived')) : null,
                  h('span', { className: 'dqs-rowProvider' },
                    [row.workspace, relativeTimeLabel(row.updatedAt, now, t)].filter(Boolean).join(' \u00B7 ')),
                  busyId === row.id
                    ? h('span', { className: 'dqs-rowBusy' }, t('session.busy'))
                    : (row.id === currentId && !row.archived
                      ? h('span', { className: 'dqs-check' }, h(CheckIcon))
                      : null)))),
            h('div', { className: 'dqs-previewPane' },
              h('div', { className: 'dqs-previewHead' },
                h('span', null, t('session.previewTitle')),
                h('span', { className: 'dqs-previewSession' }, currentRow?.title ?? '')),
              h('div', { className: 'dqs-previewMeta' }, previewMeta),
              h('div', { className: 'dqs-previewScroll' },
                preview === null
                  ? null
                  : preview.status === 'loading'
                    ? h('div', { className: 'dqs-previewLine' }, t('session.previewLoading'))
                    : preview.status === 'unavailable'
                      ? h('div', { className: 'dqs-previewLine' }, t('session.previewUnavailable'))
                      : preview.lines.length === 0
                        ? h('div', { className: 'dqs-previewLine' }, t('session.previewEmpty'))
                        : preview.lines.map((line, index) => {
                          return h('div', { key: index, className: 'dqs-previewLine' }, `${index + 1}. ${line}`);
                        })))),
          error ? h('div', { className: 'dqs-status dqs-statusError' }, error) : null,
          h('div', { className: 'dqs-footer' },
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, '\u2191\u2193'), t('session.hint.nav')),
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, 'Enter'), t('session.hint.open')),
            h('span', { className: 'dqs-hintItem' }, h('span', { className: 'dqs-kbd' }, 'Esc'), t('session.hint.close')))));
    }

    /* ------------------------------------------------------------------ */
    /* Transient hint banner (visible feedback for blocked commands)       */
    /* ------------------------------------------------------------------ */

    function HintBanner({ store }) {
      const state = useStore(store);
      useEffect(() => {
        if (!state) return undefined;
        const id = setTimeout(() => store.set(null), 2600);
        return () => clearTimeout(id);
      }, [state, store]);
      if (!state) return null;
      return h('div', { className: 'dqs-hintbar', role: 'status' }, state.text);
    }

    /* ------------------------------------------------------------------ */
    /* Sidebar panel: command deck                                         */
    /* ------------------------------------------------------------------ */

    function KeyCaps({ row, t }) {
      if (!row?.keys?.length) return h('span', { className: 'dqs-keycapNone' }, t('shortcut.unbound'));
      return h('span', { className: 'dqs-cmdKeys' },
        row.keys.map((cap, index) => h('span', { key: index, className: 'dqs-keycap' }, cap)));
    }

    /**
     * Command tile glyphs: Lucide icons (ISC, https://lucide.dev) rendered as
     * static trusted markup, stroked with the current text color.
     */
    const COMMAND_GLYPHS = {
      'open-model-palette': '<rect width="16" height="16" x="4" y="4" rx="2" /> <rect width="6" height="6" x="9" y="9" rx="1" /> <path d="M15 2v2" /> <path d="M15 20v2" /> <path d="M2 15h2" /> <path d="M2 9h2" /> <path d="M20 15h2" /> <path d="M20 9h2" /> <path d="M9 2v2" /> <path d="M9 20v2" />',
      'open-session-palette': '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" /> <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />',
      'next-session': '<path d="M5 12h14" /> <path d="m12 5 7 7-7 7" />',
      'prev-session': '<path d="m12 19-7-7 7-7" /> <path d="M19 12H5" />',
      'jump-completed': '<path d="m8 11 2 2 4-4" /> <circle cx="11" cy="11" r="8" /> <path d="m21 21-4.3-4.3" />',
      'focus-composer': '<path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1" /> <path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5" /> <path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" /> <path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" /> <path d="M9 7v10" />',
      'toggle-permission': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />',
      'set-permission': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="M12 22V2" />',
      'toggle-sidebar': '<rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M9 3v18" />',
      'show-conversation': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />',
      'show-deck': '<rect width="7" height="7" x="3" y="3" rx="1" /> <rect width="7" height="7" x="14" y="3" rx="1" /> <rect width="7" height="7" x="14" y="14" rx="1" /> <rect width="7" height="7" x="3" y="14" rx="1" />',
      'new-session': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> <path d="M12 7v6" /> <path d="M9 10h6" />'
    };

    function CommandGlyph({ id }) {
      const markup = COMMAND_GLYPHS[id] ?? COMMAND_GLYPHS['toggle-permission'];
      return h('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        style: { display: 'block' },
        dangerouslySetInnerHTML: { __html: markup }
      });
    }

    function SearchIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true, style: { display: 'block' }
      },
        h('circle', { cx: 7, cy: 7, r: 4.2, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M10.4 10.4 14 14', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }));
    }

    function ChevronIcon({ open }) {
      return h('svg', {
        width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': true,
        style: { display: 'block', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }
      }, h('path', {
        d: 'M3 5.5 8 10.5 13 5.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', strokeLinejoin: 'round'
      }));
    }

    const RECORDER_ISSUE_KEY = {
      'modifier-required': 'custom.modifierRequired'
    };

    function KeyRecorder({ ctx, t, value, onChange }) {
      const [recording, setRecording] = useState(false);
      const [issue, setIssue] = useState(null);
      const ref = useRef(null);
      useEffect(() => {
        if (recording) { try { ref.current?.focus(); } catch { /* noop */ } }
      }, [recording]);
      // Desktop recording protection: suspend native menu accelerators while
      // capturing, exactly like the host shortcut settings recorder.
      useEffect(() => {
        if (!recording) return undefined;
        try { ctx.shortcuts?.recording?.(true)?.catch?.(() => {}); } catch { /* noop */ }
        return () => {
          try { ctx.shortcuts?.recording?.(false)?.catch?.(() => {}); } catch { /* noop */ }
        };
      }, [recording, ctx]);
      const describe = (binding) => {
        try { return ctx.shortcuts.describeBinding(binding); } catch { return undefined; }
      };
      const shown = value ? describe(value) : undefined;
      const onKeyDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'Escape') { setRecording(false); return; }
        if (/^(Control|Alt|Shift|Meta)(Left|Right)$/.test(event.code)) return;
        const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
        const primary = isMac ? 'meta' : 'control';
        const modifiers = ['control', 'alt', 'shift', 'meta']
          .filter((name) => event[`${name}Key`])
          .map((name) => (name === primary ? 'primary' : name));
        if (modifiers.length === 0) { setIssue(t('custom.modifierRequired')); return; }
        const described = describe({ code: event.code, modifiers });
        if (!described?.binding) { setIssue(t('custom.keyIssue')); return; }
        if (described.issue) { setIssue(t(RECORDER_ISSUE_KEY[described.issue] ?? 'custom.keyIssue')); return; }
        if (described.conflicts?.length) { setIssue(t('custom.conflict')); return; }
        setIssue(null);
        onChange({ code: event.code, modifiers });
        setRecording(false);
      };
      return h('span', { style: { display: 'inline-flex', flexDirection: 'column', gap: 4 } },
        h('button', {
          ref,
          type: 'button',
          className: 'dqs-recordBtn',
          'data-recording': recording ? 'true' : 'false',
          onFocus: () => setRecording(true),
          onBlur: () => setRecording(false),
          onKeyDown: recording
            ? onKeyDown
            : (event) => {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setRecording(true); }
            }
        }, recording
          ? t('custom.record')
          : (shown?.keys?.length ? shown.keys.join('') : t('custom.record'))),
        issue
          ? h('span', { className: 'dqs-editorError' }, issue)
          : (recording ? h('span', { className: 'dqs-editorHelp' }, t('custom.recordHelp')) : null));
    }

    /**
     * Reserved: custom-command editor card. Its toolbar entry point is hidden
     * for now; re-add a "+ Add" button that sets `editing` to re-enable.
     */
    function CustomEditorCard({ ctx, t, editing, setEditing, onSave }) {
      return h('div', { className: 'dqs-editor' },
        h('div', { className: 'dqs-editorTitle' }, t('custom.title')),
        h('div', { className: 'dqs-editorRow' },
          h('label', { className: 'dqs-editorLabel' }, t('custom.action'),
            h('select', {
              className: 'dqs-select',
              value: editing.action,
              onChange: (event) => setEditing({ ...editing, action: event.target.value })
            }, ACTIONS.map((action) => {
              return h('option', { key: action.id, value: action.id }, t(action.labelKey));
            }))),
          ACTION_BY_ID.get(editing.action)?.param === 'preset'
            ? h('label', { className: 'dqs-editorLabel' }, t('custom.param'),
              h('select', {
                className: 'dqs-select',
                value: editing.param,
                onChange: (event) => setEditing({ ...editing, param: event.target.value })
              }, PRESETS.map((preset) => {
                return h('option', { key: preset.value, value: preset.value }, t(preset.labelKey));
              })))
            : null,
          h('label', { className: 'dqs-editorLabel' }, t('custom.key'),
            h(KeyRecorder, {
              ctx,
              t,
              value: editing.binding,
              onChange: (binding) => setEditing({ ...editing, binding, issue: null })
            }))),
        editing.issue
          ? h('div', { className: 'dqs-editorError', style: { marginTop: 10 } }, editing.issue)
          : null,
        h('div', { className: 'dqs-editorActions' },
          h('button', { type: 'button', className: 'dqs-saveBtn', onClick: onSave }, t('custom.save')),
          h('button', {
            type: 'button',
            className: 'dqs-ghostBtn',
            onClick: () => setEditing(null)
          }, t('custom.cancel'))));
    }

    function PermExpand(props) {
      const { t, catalog, catalogOptions, cycle, permCurrent, permIssue, permLabel, permCycle, setPermIssue } = props;
      return h('div', { className: 'dqs-expand' },
        catalogOptions.length === 0
          ? h('div', { className: 'dqs-hint', style: { marginTop: 0 } },
            catalog.status === 'unavailable' || catalog.status === 'error'
              ? t('perm.unavailable')
              : t('perm.catalogLoading'))
          : h('div', { className: 'dqs-chips' },
            catalogOptions.map((option) => {
              return h('button', {
                key: option.value,
                type: 'button',
                className: 'dqs-permChip',
                'data-included': cycle.includes(option.value) ? 'true' : 'false',
                'aria-pressed': cycle.includes(option.value) ? 'true' : 'false',
                title: option.description ?? undefined,
                onClick: () => {
                  const ok = permCycle.toggle(option.value);
                  setPermIssue(ok ? null : t('perm.needTwo'));
                }
              }, permLabel(option.value, option.name));
            })),
        h('div', { className: 'dqs-hint' }, cycle.map((value) => permLabel(value)).join(' \u2192 ')),
        permCurrent
          ? h('div', { className: 'dqs-hint' }, `${t('perm.current')}\uFF1A${permLabel(permCurrent)}`)
          : null,
        permIssue
          ? h('div', { className: 'dqs-hint', style: { color: 'var(--dsw-alias-state-error-primary)' } }, permIssue)
          : null,
        h('div', { className: 'dqs-hint' }, t('perm.cycleHint')),
        h('div', { className: 'dqs-hint' }, t('perm.autoExcluded')));
    }

    /** Host shortcut catalog with device-local rebind/reset through ctx.shortcuts.edit. */
    function SystemTab({ ctx, t, query }) {
      const shortcutRows = useShortcutRows(ctx);
      const configSnap = useSyncExternalStore(
        (cb) => (ctx.shortcuts?.config?.subscribe ? ctx.shortcuts.config.subscribe(cb) : () => {}),
        () => { try { return ctx.shortcuts?.config?.getSnapshot?.() ?? null; } catch { return null; } }
      );
      const fixedRows = useSyncExternalStore(
        (cb) => (ctx.shortcuts?.fixedCatalog?.subscribe ? ctx.shortcuts.fixedCatalog.subscribe(cb) : () => {}),
        () => {
          try { return ctx.shortcuts?.fixedCatalog?.getSnapshot?.() ?? EMPTY_SHORTCUT_ROWS; }
          catch { return EMPTY_SHORTCUT_ROWS; }
        }
      );
      const [sysIssues, setSysIssues] = useState({});

      const profileKey = `${ctx.shortcuts?.runtime ?? 'desktop'}:${ctx.shortcuts?.platform ?? 'macos'}`;
      const overrides = configSnap?.document?.profiles?.[profileKey] ?? {};
      const FAILED = useMemo(() => new Set(['stale', 'not-ready', 'unreadable', 'write-failed']), []);
      const applyEdit = async (edit) => {
        let result = await ctx.shortcuts.edit(edit, configSnap?.revision);
        if (result?.status === 'stale') result = await ctx.shortcuts.edit(edit, result.snapshot?.revision);
        return result;
      };
      const markResult = (id, result) => {
        setSysIssues((current) => {
          const next = { ...current };
          if (result && FAILED.has(result.status)) next[id] = t('system.saveFailed');
          else delete next[id];
          return next;
        });
      };
      const sysRows = useMemo(() => {
        // The host catalog also lists this plugin's own commands; the reference
        // tab shows host/system commands only (the deck tab owns ours).
        const rows = (shortcutRows ?? []).filter((row) => !row.id.startsWith('shortcut-ext.'));
        const qq = (query ?? '').trim().toLowerCase();
        if (qq === '') return rows;
        return rows.filter((row) => {
          const hay = `${row.label ?? ''} ${(row.keys ?? []).join('')}`.toLowerCase();
          return hay.includes(qq) || subsequence(qq, hay);
        });
      }, [shortcutRows, query]);

      return h(React.Fragment, null,
        h('div', { className: 'dqs-rows' },
          sysRows.map((row) => {
            return h('div', { key: row.id, className: 'dqs-sysRow' },
              h('span', { className: 'dqs-sysLabel' }, row.label),
              h('button', {
                type: 'button',
                className: 'dqs-iconBtn dqs-tip',
                'data-tip': t('system.reset'),
                'aria-label': t('system.reset'),
                'data-hidden': overrides[row.id] === undefined ? 'true' : 'false',
                onClick: async () => {
                  markResult(row.id, await applyEdit({ type: 'reset', id: row.id }));
                }
              }, h(ResetIcon)),
              h(KeyRecorder, {
                ctx,
                t,
                value: row.binding ?? null,
                onChange: async (binding) => {
                  markResult(row.id, await applyEdit({ type: 'set', id: row.id, binding }));
                }
              }),
              sysIssues[row.id]
                ? h('span', { className: 'dqs-editorError' }, sysIssues[row.id])
                : null);
          }),
          fixedRows.map((row) => {
            return h('div', { key: row.id, className: 'dqs-sysRow' },
              h('span', { className: 'dqs-sysLabel' }, row.label),
              h('span', { className: 'dqs-cmdKeys' },
                (row.keys ?? []).map((cap, index) => {
                  return h('span', { key: index, className: 'dqs-keycap' }, cap);
                })),
              h('span', { className: 'dqs-sysFixed' }, t('system.fixed')));
          })),
        h('div', { className: 'dqs-hint' }, t('system.hint')));
    }

    function CommandDeckPanel({ ctx, t, enabled, custom, permCycle }) {
      useLocaleTick(ctx);
      const shortcutRows = useShortcutRows(ctx);
      useStore(enabled);
      const customList = useStore(custom);
      const cycle = useStore(permCycle);
      const sessionId = useSessionId(ctx);
      const permCurrent = usePermissionValue(ctx, sessionId)?.currentValue;
      const catalog = usePermissionCatalog(ctx);
      const [permIssue, setPermIssue] = useState(null);
      const [query, setQuery] = useState('');
      const [expandedId, setExpandedId] = useState(null);
      const [tab, setTab] = useState('commands');

      const catalogOptions = useMemo(() => {
        const options = (catalog.options ?? [])
          .filter((option) => option.value !== 'auto' && option.value !== 'custom');
        return [...options].sort((a, b) => presetOrder(a.value) - presetOrder(b.value));
      }, [catalog]);
      const permLabel = (value, hostName) => {
        const key = PRESET_LABEL_KEY[value];
        if (key) return t(key);
        return hostName ?? String(value);
      };

      const entries = useMemo(() => commandEntries(customList), [customList]);
      const rowOf = (id) => (shortcutRows ?? []).find((candidate) => candidate.id === id);
      const labelOf = (entry) => (entry.paramKey
        ? `${t(entry.labelKey)}\uFF1A${t(entry.paramKey)}`
        : t(entry.labelKey));
      const q = query.trim().toLowerCase();
      const visible = entries.filter((entry) => {
        if (q === '') return true;
        const row = rowOf(entry.id);
        const hay = `${labelOf(entry)} ${entry.action.impl} ${(row?.keys ?? []).join('')}`.toLowerCase();
        return hay.includes(q) || subsequence(q, hay);
      });
      return h('div', { className: 'dqs-page' },
        h('div', { className: 'dqs-pageHead' },
          h('h1', { className: 'dqs-pageTitle' }, t('panel.title')),
          h('p', { className: 'dqs-pageSub' }, t('panel.subtitle'))),

        h('div', { className: 'dqs-toolbar' },
          h('div', { className: 'dqs-tabs', role: 'tablist', 'aria-label': t('panel.title') },
            [['commands', t('tab.commands')], ['system', t('tab.system')]].map(([value, label]) =>
              h('button', {
                key: value,
                type: 'button',
                role: 'tab',
                'aria-selected': tab === value ? 'true' : 'false',
                className: 'dqs-tab',
                onClick: () => setTab(value)
              }, label))),
          h('input', {
            className: 'dqs-search',
            style: { marginLeft: 'auto' },
            value: query,
            placeholder: t('panel.search'),
            'aria-label': t('panel.search'),
            autoComplete: 'off',
            spellCheck: false,
            onChange: (event) => setQuery(event.target.value)
          })),

        tab === 'commands'
          ? h(React.Fragment, null,
            h('div', { className: 'dqs-rows' },
              visible.length === 0
                ? h('div', { className: 'dqs-emptyState' }, t('panel.empty'))
                : visible.map((entry) => {
                  const row = rowOf(entry.id);
                  const on = enabled.isEnabled(entry.id);
                  const label = row?.label ?? labelOf(entry);
                  const expandable = entry.action.id === 'toggle-permission';
                  const expanded = expandedId === entry.id;
                  return h(React.Fragment, { key: entry.id },
                    h('div', { className: 'dqs-cmdRow', 'data-enabled': on ? 'true' : 'false' },
                      h('span', { className: 'dqs-tile' }, h(CommandGlyph, { id: entry.action.id })),
                      h('div', { className: 'dqs-cmdInfo' },
                        h('div', { className: 'dqs-cmdName' }, label),
                        h('div', { className: 'dqs-cmdImpl' }, entry.action.impl)),
                      h('div', { className: 'dqs-cmdRight' },
                        on ? h(KeyCaps, { row, t }) : h('span', { className: 'dqs-keycapNone' }, t('panel.disabled')),
                        expandable
                          ? h('button', {
                            type: 'button',
                            className: 'dqs-expandBtn',
                            'aria-expanded': expanded ? 'true' : 'false',
                            title: t('perm.section'),
                            'aria-label': t('perm.section'),
                            onClick: () => setExpandedId(expanded ? null : entry.id)
                          }, h(ChevronIcon, { open: expanded }))
                          : null,
                        entry.custom
                          ? h('button', {
                            type: 'button',
                            className: 'dqs-removeBtn',
                            title: t('custom.remove'),
                            'aria-label': `${t('custom.remove')}: ${label}`,
                            onClick: () => custom.remove(entry.uid)
                          }, '\u2715')
                          : null,
                        h('button', {
                          type: 'button',
                          role: 'switch',
                          className: 'dqs-switch',
                          'aria-checked': on ? 'true' : 'false',
                          'aria-label': `${on ? t('panel.enabled') : t('panel.disabled')}: ${label}`,
                          onClick: () => enabled.toggle(entry.id)
                        }))),
                    expanded
                      ? h(PermExpand, {
                        t,
                        catalog,
                        catalogOptions,
                        cycle,
                        permCurrent,
                        permIssue,
                        permLabel,
                        permCycle,
                        setPermIssue
                      })
                      : null);
                })))
          : h(SystemTab, { ctx, t, query }));
    }

    /* ------------------------------------------------------------------ */
    /* Custom commands: persisted user entries over the action catalog     */
    /* ------------------------------------------------------------------ */

    const CUSTOM_KEY = 'dsh.shortcut-ext.custom.v1';

    function sanitizeBinding(value) {
      if (!value || typeof value !== 'object') return undefined;
      if (typeof value.code !== 'string' || !Array.isArray(value.modifiers)) return undefined;
      const modifiers = value.modifiers.filter((m) => ['primary', 'control', 'alt', 'shift', 'meta'].includes(m));
      if (modifiers.length === 0) return undefined;
      return { code: value.code, modifiers };
    }

    function readCustom() {
      try {
        const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY));
        if (!Array.isArray(parsed)) return [];
        const out = [];
        for (const entry of parsed) {
          if (!entry || typeof entry.uid !== 'string') continue;
          const action = ACTION_BY_ID.get(entry.action);
          const binding = sanitizeBinding(entry.binding);
          if (!action || !binding) continue;
          const wantsParam = action.param === 'preset';
          const paramOk = !wantsParam || PRESET_LABEL_KEY[entry.param] !== undefined;
          if (!paramOk) continue;
          out.push({
            uid: entry.uid,
            action: entry.action,
            ...wantsParam ? { param: entry.param } : {},
            binding
          });
        }
        return out;
      } catch { return []; }
    }

    function createCustomStore() {
      const base = createStore(readCustom());
      const persist = () => {
        try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(base.getSnapshot())); } catch { /* private mode */ }
      };
      return {
        getSnapshot: base.getSnapshot,
        subscribe: base.subscribe,
        add(entry) { base.set([...base.getSnapshot(), entry]); persist(); },
        remove(uid) { base.set(base.getSnapshot().filter((e) => e.uid !== uid)); persist(); }
      };
    }

    function makeUid() {
      return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    }

    function bindingProfiles(binding, includeWeb) {
      const profiles = {
        'desktop:macos': binding,
        'desktop:windows': binding,
        'desktop:linux': binding
      };
      if (includeWeb) {
        profiles['web:macos'] = binding;
        profiles['web:windows'] = binding;
      }
      return profiles;
    }

    /** Built-in + custom entries as one registration table. */
    function commandEntries(customList) {
      const entries = COMMANDS.map((command) => {
        const action = ACTION_BY_ID.get(command.action);
        return {
          id: command.id,
          action,
          labelKey: action.labelKey,
          attempts: command.attempts
        };
      });
      for (const custom of customList) {
        const action = ACTION_BY_ID.get(custom.action);
        if (!action) continue;
        entries.push({
          id: `shortcut-ext.custom-${custom.uid}`,
          custom: true,
          uid: custom.uid,
          action,
          param: custom.param,
          labelKey: action.labelKey,
          paramKey: custom.param ? PRESET_LABEL_KEY[custom.param] : undefined,
          attempts: [
            bindingProfiles(custom.binding, true),
            bindingProfiles(custom.binding, false),
            {}
          ]
        });
      }
      return entries;
    }

    /**
     * One effect owning every toggleable shortcut registration: an entry is
     * registered exactly while its deck switch is on; custom entries follow
     * the persisted user table. Each registration walks its candidate
     * binding sets until the registry accepts one.
     */
    function installCommands(ctx, deps, enabled, custom) {
      const disposers = new Map();
      const labelOf = (entry) => () => (entry.paramKey
        ? `${deps.t(entry.labelKey)}\uFF1A${deps.t(entry.paramKey)}`
        : deps.t(entry.labelKey));
      const build = (entry) => {
        const resolve = () => ({
          status: 'handled',
          run: () => { entry.action.run(deps, entry.param); }
        });
        for (const defaults of entry.attempts) {
          try {
            return ctx.shortcuts.register({
              id: entry.id,
              label: labelOf(entry),
              aliases: [entry.action.id.replace(/-/g, ' '), entry.id],
              regions: ['page', 'editable'],
              modals: [],
              defaults,
              resolve
            });
          } catch { /* try the next candidate binding set */ }
        }
        console.error(`[shortcut-ext] shortcut registration failed: ${entry.id}`);
        return () => {};
      };
      const sync = () => {
        const entries = commandEntries(custom.getSnapshot());
        const wanted = new Map(entries.map((entry) => [entry.id, entry]));
        for (const [id, dispose] of [...disposers]) {
          if (!wanted.has(id) || !enabled.isEnabled(id)) {
            try { dispose(); } catch { /* already disposed */ }
            disposers.delete(id);
          }
        }
        for (const entry of entries) {
          if (enabled.isEnabled(entry.id) && !disposers.has(entry.id)) {
            disposers.set(entry.id, build(entry));
          }
        }
      };
      sync();
      const offEnabled = enabled.subscribe(sync);
      const offCustom = custom.subscribe(() => {
        for (const [id, dispose] of [...disposers]) {
          if (id.startsWith('shortcut-ext.custom-')) {
            try { dispose(); } catch { /* already disposed */ }
            disposers.delete(id);
          }
        }
        sync();
      });
      return () => {
        offEnabled();
        offCustom();
        for (const dispose of disposers.values()) {
          try { dispose(); } catch { /* already disposed */ }
        }
        disposers.clear();
      };
    }

    /* ------------------------------------------------------------------ */
    /* Plugin body                                                         */
    /* ------------------------------------------------------------------ */

    return {
      inject: [
        'slots',
        'locale',
        'sessions',
        'workspaces',
        'uiWorkspace',
        'conversation',
        'layout',
        'shortcuts',
        'remote',
        'remote.permissionPresets',
        'modelDirectories'
      ],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'shortcut-ext: dictionaries');
        const t = ctx.locale.bind(NS);
        const paletteOpen = createStore(false);
        const sessionPaletteOpen = createStore(false);
        const pins = createPinStore();
        const enabled = createEnabledStore();
        const custom = createCustomStore();
        const permCycle = createPermCycleStore();
        const hintStore = createStore(null);
        let hintSeq = 0;
        const hint = (text) => hintStore.set({ seq: ++hintSeq, text });

        ctx.effect(() => {
          if (typeof document === 'undefined') return undefined;
          // Upgrade an existing tag in place: after a hot reload the old tag is
          // still attached, and skipping it would keep stale CSS alive.
          const existing = document.querySelector('style[data-dqs="1"]');
          const style = existing ?? document.createElement('style');
          style.setAttribute('data-dqs', '1');
          style.textContent = CSS;
          if (!existing) document.head.appendChild(style);
          return () => { if (style.isConnected) style.remove(); };
        }, 'shortcut-ext: styles');

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'shortcut-ext-palette',
          order: 40
        }, () => h(PaletteLayer, { ctx, t, openStore: paletteOpen, pins })));

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'shortcut-ext-sessions',
          order: 41
        }, () => h(SessionPaletteLayer, { ctx, t, openStore: sessionPaletteOpen })));

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'shortcut-ext-hint',
          order: 43
        }, () => h(HintBanner, { store: hintStore })));

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 50,
          label: () => t('panel.title')
        }, PanelIcon));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID
        }, () => h(CommandDeckPanel, { ctx, t, enabled, custom, permCycle })));

        ctx.effect(() => {
          const jumpTracker = createJumpTracker(ctx);
          const disposeCommands = installCommands(ctx, {
            ctx, t, paletteOpen, sessionPaletteOpen, jumpTracker, hint, permCycle
          }, enabled, custom);
          return () => {
            disposeCommands();
            jumpTracker.dispose();
          };
        }, 'shortcut-ext: shortcut commands');
      }
    };
  }
});
