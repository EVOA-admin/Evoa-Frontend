import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/*
 * StrictMode is intentionally removed.
 *
 * React.StrictMode in development double-invokes effects and renders, which:
 *   1. Masks real production remount bugs (the app "works" in dev with StrictMode
 *      because double-invoke is expected, but the same code fails in production
 *      where React only mounts once and state reset is permanent).
 *   2. Causes PageKeepAlive's hasMounted effect to fire twice, incorrectly
 *      making pages appear as "already visited" on the very first render.
 *   3. Creates false-positive "working" impressions for KeepAlive pages that
 *      actually remount in production due to auth state re-renders.
 *
 * The KeepAlive architecture (module-level mountedPages + scrollStore singletons)
 * and the memoised KeepAlivePages component are production-safe without StrictMode.
 */
createRoot(document.getElementById('root')).render(<App />)
