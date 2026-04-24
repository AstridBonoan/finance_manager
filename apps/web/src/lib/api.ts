import { getSession } from 'next-auth/react';

function resolveUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  return `${base}${path}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) {
    throw new Error('You are not authenticated. Please log in again.');
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);

  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(resolveUrl(path), {
    ...init,
    headers,
  });
}

