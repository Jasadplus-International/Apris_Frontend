// SSR-reproduce BroadSheetManager via vite's transform (fixed)
import { createServer } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToString } = require('react-dom/server');

const vite = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

globalThis.fetch = async () => ({ ok: false, json: async () => [] });

try {
  const mod = await vite.ssrLoadModule('/src/pages/BroadSheetManager.jsx');
  const html = renderToString(React.createElement(mod.default));
  console.log('SSR render OK, length:', html.length);
} catch (e) {
  console.log('SSR ERROR:', e?.message);
  console.log(String(e?.stack).split('\n').slice(0, 10).join('\n'));
}
await vite.close();
process.exit(0);