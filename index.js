/**
 * Host half of the Shortcut Extensions bundle.
 *
 * Every capability this plugin uses is already served by the running Host:
 * - permission switching goes through the shipped `/permission <preset>`
 *   session command (dsh-permission-presets), submitted from the Client;
 * - model catalog and selection go through the shared Client
 *   `modelDirectories` service over the `remote.session` namespace;
 * - session open/archive/restore go through the `uiWorkspace` client face.
 *
 * Permission changes are user-only authority actions, so this bundle
 * deliberately exposes no agent tool for them.
 */
export function apply() {}
