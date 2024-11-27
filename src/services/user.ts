import { ApplicationConfig, UserHttpService, UserSession } from '@/types';
import axios, { AxiosInstance } from 'axios';
import { saveRefreshTokenToLocalStorage } from '@/services/session';

export const AUTH_CALLBACK_PATH = '/auth/callback';
export const AUTH_CALLBACK_URL = `${window.location.origin}${AUTH_CALLBACK_PATH}`;

export class ClientServicesImpl implements UserHttpService {
  private baseClient: AxiosInstance;
  private gotrueClient: AxiosInstance;

  constructor(config: ApplicationConfig) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Client Config', config);
    }


    this.baseClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.gotrueClient = axios.create({
      baseURL: config.gotrueUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async verifyToken(accessToken: string) {
    const url = `/api/user/verify/${accessToken}`;
    const response = await this.baseClient.get<{
      code: number;
      data?: {
        is_new: boolean;
      };
      message: string;
    }>(url);

    const data = response?.data;
    if (data?.code === 0 && data.data) {
      return data.data;
    }

    return Promise.reject(data);
  }

  async refreshToken(refreshToken: string) {
    const response = await this.gotrueClient.post<{
      access_token: string;
      expires_at: number;
      refresh_token: string;
    }>('/token?grant_type=refresh_token', {
      refreshToken,
    });

    const newToken = response?.data;

    if (newToken) {
      saveRefreshTokenToLocalStorage(JSON.stringify(newToken));
    }

    return newToken;
  }

  async loginAuth(url: string) {
    try {
      const hash = new URL(url).hash;
      if (!hash) {
        return Promise.reject('No hash found');
      }

      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!accessToken || !refresh_token) {
        return Promise.reject({
          code: -1,
          message: 'No access token or refresh token found',
        });
      }

      try {
        await this.verifyToken(accessToken);
      } catch (e) {
        return Promise.reject({
          code: -1,
          message: 'Verify token failed',
        });
      }

      try {
        await saveRefreshTokenToLocalStorage(refresh_token);
      } catch (e) {
        return Promise.reject({
          code: -1,
          message: 'Refresh token failed',
        });
      }
    } catch (error) {
      throw error;
    }
  }
  async signInMagicLink(params: { email: string; redirectTo: string }) {
    const res = await this.gotrueClient.post(
      '/magiclink',
      {
        code_challenge: '',
        code_challenge_method: '',
        data: {},
        email: params.email,
      },
      {
        headers: {
          Redirect_to: params.redirectTo,
        },
      }
    );

    return res?.data;
  }
  async signInGoogle() {
    const provider = 'google';
    const redirectTo = encodeURIComponent(AUTH_CALLBACK_URL);
    const accessType = 'offline';
    const prompt = 'consent';
    const baseURL = this.gotrueClient?.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}&access_type=${accessType}&prompt=${prompt}`;

    window.open(url, '_current');
  }
  async signInGithub(params: { redirectTo: string }) {
    const provider = 'github';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const baseURL = this.gotrueClient.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}`;

    window.open(url, '_current');
  }
  async signInDiscord(params: { redirectTo: string }) {
    const provider = 'discord';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const baseURL = this.gotrueClient.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}`;

    window.open(url, '_current');
  }
  async signInApple(params: { redirectTo: string }) {
    const provider = 'apple';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const baseURL = this.gotrueClient.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}`;

    window.open(url, '_current');
  }

  async getCurrentUser() {
    // const token = getTokenFromLocalStorage();
    // const userId = token?.user?.id;

    const url = '/api/user/profile';
    const response = await this.baseClient.get<{
      code: number;
      data?: {
        uid: number;
        uuid: string;
        email: string;
        name: string;
        metadata: {
          icon_url: string;
        };
        encryption_sign: null;
        latest_workspace_id: string;
        updated_at: number;
      };
      message: string;
    }>(url);

    const data = response?.data;

    if (data?.code === 0 && data.data) {
      const { uid, uuid, email, name, metadata } = data.data;

      return {
        uid: String(uid),
        uuid,
        email,
        name,
        avatar: metadata.icon_url,
        latestWorkspaceId: data.data.latest_workspace_id,
      };
    }

    return Promise.reject(data);
  }
}

export class UserSessionImpl implements UserSession {
  getRedirectTo(): string | null {
    return localStorage.getItem('redirectTo');
  }

  setRedirectTo(redirectTo: string): void {
    localStorage.setItem('redirectTo', redirectTo);
  }

  clearRedirectTo() {
    localStorage.removeItem('redirectTo');
  }
}
