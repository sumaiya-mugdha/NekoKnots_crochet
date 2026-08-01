import { useEffect, useState, useCallback } from 'react';

export type Route = {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
};

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  return {
    path: pathPart || '/',
    params: {},
    query: new URLSearchParams(queryPart || ''),
  };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to.startsWith('#')) to = to.slice(1);
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}

export function navigate(to: string) {
  if (to.startsWith('#')) to = to.slice(1);
  window.location.hash = to;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Match a route pattern like "/patterns/:slug" against a path.
export function matchRoute(
  pattern: string,
  path: string,
): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return { match: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const v = pathParts[i];
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(v);
    } else if (p !== v) {
      return { match: false, params: {} };
    }
  }
  return { match: true, params };
}
