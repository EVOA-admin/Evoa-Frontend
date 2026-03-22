import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <GARouteTracker />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

