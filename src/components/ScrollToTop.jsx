// Resets scroll position to top on every route change. Mounts inside the
// Router (sibling to <Routes>), renders nothing. Closes the React Router
// default-behaviour gap where pathname changes preserve prior scroll.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
