import { storage } from 'webextension-polyfill';
import { emit, EventType } from './event';

export async function saveRefreshTokenToLocalStorage(token: string) {
  await storage.local.remove('token');
  await storage.local.set({ 'token': token });
}

export async function invalidToken() {
  await storage.local.remove('token');
  emit(EventType.SESSION_INVALID);
}

export async function hasToken() {
  let storage_data: any = await storage.local.get(['token']);
  return !!storage_data.token;
}

export async function getToken() {
  let storage_data: any = await storage.local.get(['token']);
  return storage_data.token;
}

export async function getTokenFromLocalStorage(): Promise<{
  access_token: string;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
} | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  try {
    return JSON.parse(token);
  } catch (e) {
    return null;
  }
}
