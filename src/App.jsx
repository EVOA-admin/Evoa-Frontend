import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import AppRoutes from './routes/app-routes';
import { trackPageView } from './services/analytics';

/**
 * GARouteTracker — lives inside <BrowserRouter> so it can use useLocation.
 * Fires a GA4 page_view on every SPA route change.
 * Renders nothing (null).
 */
function GARouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
}

/**
 * RecoveryRouteHandler — intercepts password recovery tokens landing at any URL
 * (such as root / or OAuth redirects) and instantly forwards to /create-new-password.
 */
function RecoveryRouteHandler() {
  const location = useLocation();
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const searchParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

    const isRecovery =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      searchParams.get('type') === 'recovery' ||
      hashParams.get('type') === 'recovery';

    if (isRecovery && location.pathname !== '/create-new-password' && location.pathname !== '/reset-password') {
      const target = `/create-new-password${hash}${search ? (hash ? '&' + search.slice(1) : search) : ''}`;
      window.location.replace(target);
    }
  }, [location]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataCacheProvider>
            <GARouteTracker />
            <RecoveryRouteHandler />
            <AppRoutes />
          </DataCacheProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
