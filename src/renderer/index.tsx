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
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('[CopiaOS] Render called successfully');
}
