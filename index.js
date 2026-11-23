/**
 * Host half of the Shortcut Extensions bundle.
 *
 * Most capabilities this plugin uses are already served by the running Host:
 * - permission switching goes through the shipped `/permission <preset>`
 *   session command (dsh-permission-presets), submitted from the Client;
 * - model catalog and selection go through the shared Client
 *   `modelDirectories` service over the `remote.session` namespace;
 * - session open/archive/restore go through the `uiWorkspace` client face.
 *
 * The one Host-side addition is a small same-origin JSON route used by the
 * header git chip: it reads `git status`/`git log` and can run `git pull` /
 * `git push`. Those need a real `git` process, which the Client cannot spawn,
 * so the route runs git through `ctx.subprocess` for the current repository.
 * It is guarded by the connection trust fence and only accepts absolute
 * directories that actually contain a `.git` entry.
 *
 * Permission changes are user-only authority actions, so this bundle
 * deliberately exposes no agent tool for them.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const GIT_ROUTE = '/shortcut-ext/git';
const STATUS_TIMEOUT_MS = 15000;
const FETCH_TIMEOUT_MS = 12000;
const SYNC_TIMEOUT_MS = 120000;
const MAX_BODY_BYTES = 65536;

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function gitEnvironment() {
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    USER: process.env.USER,
    LOGNAME: process.env.LOGNAME,
    LANG: process.env.LANG ?? 'en_US.UTF-8',
    // Never block on an interactive credential prompt from a UI button.
    GIT_TERMINAL_PROMPT: '0'
  };
  if (process.env.SSH_AUTH_SOCK) env.SSH_AUTH_SOCK = process.env.SSH_AUTH_SOCK;
  if (process.env.GIT_SSH_COMMAND) env.GIT_SSH_COMMAND = process.env.GIT_SSH_COMMAND;
  return env;
}

/** Run one git invocation in `cwd`; resolves to collected output and exit facts. */
/**
 * One git process at a time per Host. Identical in-flight calls share their
 * process; anything else queues behind, so polls and double clicks never stack
 * subprocesses.
 */
const gitQueue = {
  chain: Promise.resolve(),
  inflight: new Map(),
  enqueue(task) {
    const run = this.chain.then(task, task);
    this.chain = run.then(() => undefined, () => undefined);
    return run;
  }
};

/** Run one git invocation in `cwd`; resolves to collected output and exit facts. */
async function runGitOnce(subprocess, args, cwd, timeoutMs) {
  const controller = new AbortController();
  let handle;
  let timedOut = false;
  let expire;
  const expired = new Promise((resolve) => { expire = resolve; });
  const timer = setTimeout(() => {
    timedOut = true;
    try { controller.abort(new Error('git timeout')); } catch { /* noop */ }
    // Do not wait out the provider's grace period: reap the child now.
    try { handle?.terminate?.(); } catch { /* already gone */ }
    // Never let a provider that keeps `done` pending hang the request.
    expire();
  }, timeoutMs);
  try {
    const executable = await subprocess.resolveExecutable('git', undefined, controller.signal);
    handle = subprocess.spawn({
      argv: [executable, ...args],
      cwd,
      stdio: {
        stdin: 'ignore',
        stdout: { maxBytes: 262144 },
        stderr: { maxBytes: 65536 }
      },
      graceMs: 2000,
      signal: controller.signal,
      env: gitEnvironment()
    });
    const outcome = await Promise.race([handle.done, expired.then(() => null)]) ?? { exitCode: null, signal: null };
    const stdout = handle.collected.stdout?.readFrom(0)?.text ?? '';
    const stderr = handle.collected.stderr?.readFrom(0)?.text ?? '';
    if (timedOut) {
      return { exitCode: null, signal: outcome.signal, stdout, stderr: stderr || 'git timed out' };
    }
    return { exitCode: outcome.exitCode, signal: outcome.signal, stdout, stderr };
  } catch (error) {
    return { exitCode: null, signal: null, stdout: '', stderr: String(error?.message ?? error) };
  } finally {
    clearTimeout(timer);
    // Covers the path where spawn resolved but the wait was abandoned.
    try { handle?.terminate?.(); } catch { /* already gone */ }
  }
}

/** Run one git invocation, sharing the process of an identical in-flight call. */
function runGit(subprocess, args, cwd, timeoutMs) {
  const key = `${cwd}\u0000${args.join('\u0000')}`;
  const existing = gitQueue.inflight.get(key);
  if (existing !== undefined) return existing;
  const promise = gitQueue.enqueue(() => runGitOnce(subprocess, args, cwd, timeoutMs))
    .finally(() => { gitQueue.inflight.delete(key); });
  gitQueue.inflight.set(key, promise);
  return promise;
}

async function isValidRepository(repoPath) {
  if (typeof repoPath !== 'string' || repoPath === '' || !path.isAbsolute(repoPath)) return false;
  try {
    const stat = await fs.stat(repoPath);
    if (!stat.isDirectory()) return false;
    await fs.stat(path.join(repoPath, '.git'));
    return true;
  } catch {
    return false;
  }
}

function parseStatus(stdout) {
  let branch = null;
  let detached = false;
  let upstream = null;
  let ahead = 0;
  let behind = 0;
  let dirty = false;
  for (const line of stdout.split('\n')) {
    if (line.startsWith('# branch.head ')) branch = line.slice('# branch.head '.length).trim();
    else if (line.startsWith('# branch.upstream ')) upstream = line.slice('# branch.upstream '.length).trim();
    else if (line.startsWith('# branch.ab ')) {
      const match = /\+(\d+) -(\d+)/u.exec(line);
      if (match) { ahead = Number(match[1]); behind = Number(match[2]); }
    } else if (line !== '' && !line.startsWith('#')) dirty = true;
  }
  if (branch === '(detached)') { detached = true; branch = null; }
  return { branch, detached, upstream, ahead, behind, dirty };
}

async function readStatus(subprocess, repoPath, doFetch) {
  let fetched = false;
  if (doFetch) {
    // Refresh the remote-tracking ref first so ahead/behind reflects the real
    // remote, not just the last fetch. A failed/offline fetch is not fatal.
    const fetch = await runGit(subprocess, ['-C', repoPath, 'fetch', '--quiet'], repoPath, FETCH_TIMEOUT_MS);
    fetched = fetch.exitCode === 0;
  }
  const status = await runGit(subprocess, ['-C', repoPath, 'status', '--porcelain=v2', '--branch'], repoPath, STATUS_TIMEOUT_MS);
  if (status.exitCode !== 0) {
    return { error: (status.stderr || status.stdout || 'git status failed').trim().slice(0, 4000) };
  }
  const parsed = parseStatus(status.stdout);
  let commits = [];
  const log = await runGit(subprocess, ['-C', repoPath, 'log', '-5', '--pretty=format:%h%x09%s%x09%ct'], repoPath, STATUS_TIMEOUT_MS);
  if (log.exitCode === 0) {
    commits = log.stdout.split('\n').filter(Boolean).slice(0, 5).map((line) => {
      const parts = line.split('\t');
      return { sha: parts[0] ?? '', subject: parts[1] ?? '', at: Number(parts[2] ?? 0) * 1000 };
    });
  }
  return { ...parsed, commits, source: 'git', fetched };
}

function createGitHandler({ getSubprocess, getConnection }) {
  return async function gitRoute(req, res) {
    try {
    const connection = typeof getConnection === 'function' ? getConnection() : undefined;
    if (connection && typeof connection.requestRejection === 'function') {
      let rejection;
      try { rejection = connection.requestRejection(req); } catch { rejection = undefined; }
      if (rejection !== undefined) {
        res.statusCode = rejection;
        res.end();
        return;
      }
    }
    const subprocess = typeof getSubprocess === 'function' ? getSubprocess() : undefined;
    if (!subprocess) { jsonResponse(res, 503, { error: 'git unavailable' }); return; }
    let url;
    try { url = new URL(String(req.url ?? ''), 'http://localhost'); }
    catch { jsonResponse(res, 400, { error: 'bad url' }); return; }

    if (req.method === 'GET') {
      if (url.searchParams.get('op') === 'ping') { jsonResponse(res, 200, { ok: true, git: Boolean(subprocess) }); return; }
      if (url.searchParams.get('op') !== 'status') { jsonResponse(res, 400, { error: 'unsupported op' }); return; }
      const repoPath = url.searchParams.get('path');
      if (!(await isValidRepository(repoPath))) { jsonResponse(res, 400, { error: 'invalid repository path' }); return; }
      const status = await readStatus(subprocess, repoPath, url.searchParams.get('fetch') === '1');
      jsonResponse(res, 200, status);
      return;
    }

    if (req.method === 'POST') {
      const contentType = String(req.headers['content-type'] ?? '').split(';', 1)[0].trim().toLowerCase();
      if (contentType !== 'application/json') { jsonResponse(res, 415, { error: 'content-type must be application/json' }); return; }
      let body;
      try { body = await readJsonBody(req); }
      catch { jsonResponse(res, 400, { error: 'body is not JSON' }); return; }
      const repoPath = body?.path;
      const op = body?.op;
      if (op !== 'pull' && op !== 'push' && op !== 'sync') { jsonResponse(res, 400, { error: 'unsupported op' }); return; }
      if (!(await isValidRepository(repoPath))) { jsonResponse(res, 400, { error: 'invalid repository path' }); return; }

      // One-click sync: fetch first, then fast-forward if behind, push if ahead.
      // Diverged (both sides) is reported, never merged automatically.
      if (op === 'sync') {
        const before = await readStatus(subprocess, repoPath, true);
        if (before.error) { jsonResponse(res, 200, { ok: false, error: before.error }); return; }
        const steps = [];
        if (before.detached) { jsonResponse(res, 200, { ok: false, error: 'detached HEAD', ...before }); return; }
        if (!before.upstream) { jsonResponse(res, 200, { ok: false, error: 'no upstream branch', ...before }); return; }
        let ahead = before.ahead;
        let behind = before.behind;
        if (ahead > 0 && behind > 0) {
          jsonResponse(res, 200, { ok: false, error: 'diverged', ...before });
          return;
        }
        if (behind > 0) {
          const pull = await runGit(subprocess, ['-C', repoPath, 'pull', '--ff-only'], repoPath, SYNC_TIMEOUT_MS);
          steps.push({ op: 'pull', ok: pull.exitCode === 0, output: (pull.stdout || pull.stderr).trim().slice(0, 4000) });
          if (pull.exitCode !== 0) {
            const after = await readStatus(subprocess, repoPath, false);
            jsonResponse(res, 200, { ok: false, steps, ...after });
            return;
          }
        }
        if (ahead > 0) {
          const push = await runGit(subprocess, ['-C', repoPath, 'push'], repoPath, SYNC_TIMEOUT_MS);
          steps.push({ op: 'push', ok: push.exitCode === 0, output: (push.stdout || push.stderr).trim().slice(0, 4000) });
        }
        const after = await readStatus(subprocess, repoPath, false);
        jsonResponse(res, 200, { ok: steps.every((step) => step.ok), steps, ...after });
        return;
      }

      const args = op === 'pull'
        ? ['-C', repoPath, 'pull', '--ff-only']
        : ['-C', repoPath, 'push'];
      const result = await runGit(subprocess, args, repoPath, SYNC_TIMEOUT_MS);
      jsonResponse(res, 200, {
        ok: result.exitCode === 0,
        exitCode: result.exitCode,
        stdout: result.stdout.trim().slice(0, 8000),
        stderr: result.stderr.trim().slice(0, 8000)
      });
      return;
    }

    res.statusCode = 405;
    res.setHeader('allow', 'GET, POST');
    res.end();
    } catch (error) {
      try {
        if (!res.headersSent) jsonResponse(res, 500, { error: String(error?.message ?? error) });
        else res.end();
      } catch { /* response already gone */ }
    }
  };
}

export function apply(ctx) {
  // ctx.get(name) may throw for unknown names in some contexts; never let that
  // escape from a request or from setup.
  const safeGet = (name) => { try { return ctx.get?.(name); } catch { return undefined; } };
  const setup = (svc) => {
    const webServer = svc.webServer ?? safeGet('webServer');
    if (!webServer) return;
    const handler = createGitHandler({
      getSubprocess: () => svc.subprocess ?? safeGet('subprocess'),
      getConnection: () => svc.connection ?? safeGet('connection')
    });
    svc.effect(() => webServer.register({ kind: 'exact', path: GIT_ROUTE, handler }), 'shortcut-ext: git route');
  };
  // Wait for webServer, subprocess and connection to be mounted; the bundle row
  // can activate before they exist. connection supplies the trust/auth fence.
  if (typeof ctx.inject === 'function') ctx.inject(['webServer', 'subprocess', 'connection'], setup);
  else setup(ctx);
}
