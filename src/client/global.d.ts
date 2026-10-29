// sn-translate: t() traduce con sys_ui_message nella lingua dell'utente
// (l'SDK inietta window.__TRANSLATIONS__ nella UI Page). Segnaposto: {0}, {1}, ...
declare module 'sn-translate' {
    export function t(message: string, ...args: unknown[]): string
}
