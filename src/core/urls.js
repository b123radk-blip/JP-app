// Resolve app-relative paths (audio/..., content/..., data/...) no matter which page or sub-path the app is served from.
const ROOT = new URL('../../', import.meta.url);
export const appUrl = (path) => new URL(path, ROOT).href;
