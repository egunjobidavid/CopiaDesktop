import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

console.log('[CopiaOS] Bundle executing, React version:', React.version);
const root = document.getElementById('root');
console.log('[CopiaOS] Root element:', root ? 'found' : 'MISSING');
if (root) {
  console.log('[CopiaOS] Creating React root...');
  const reactRoot = ReactDOM.createRoot(root);
  console.log('[CopiaOS] Rendering App...');

  // Debug: inspect DOM after React renders
  const observer = new MutationObserver(() => {
    setTimeout(() => {
      const r = document.getElementById('root');
      console.log('[CopiaOS] #root innerHTML length:', r?.innerHTML?.length);
      console.log('[CopiaOS] #root first child:', r?.firstElementChild?.tagName || 'none');
      console.log('[CopiaOS] Body bg:', getComputedStyle(document.body).backgroundColor);
      console.log('[CopiaOS] Body visible:', document.body.isConnected && document.body.style.display !== 'none');
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(l => console.log('[CopiaOS] CSS loaded:', l.href, l.sheet ? 'applied' : 'NOT applied'));
    }, 100);
  });
  observer.observe(root, { childList: true, subtree: true });

  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('[CopiaOS] Render called successfully');
}
