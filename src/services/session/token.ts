import { emit, EventType } from './event';

export function saveRefreshTokenToLocalStorage(token: string) {
  localStorage.removeItem('token');
  localStorage.setItem('token', token);
  emit(EventType.SESSION_REFRESH, token);
}

export function invalidToken() {
  localStorage.removeItem('token');
  emit(EventType.SESSION_INVALID);
}

export function hasToken() {
  return !!localStorage.getItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getTokenFromLocalStorage(): {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
} | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    return JSON.parse(token);
  } catch (e) {
    return null;
  }
}
