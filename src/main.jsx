import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      console.log('perf:navigation', Math.round(nav.responseEnd - nav.startTime));
    }
    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const e of entries) {
        console.log('perf:' + e.entryType, Math.round(e.startTime || e.processingStart || 0));
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
    po.observe({ type: 'first-input', buffered: true });
    po.observe({ type: 'layout-shift', buffered: true });
  } catch {}
}
