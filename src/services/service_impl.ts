import {
  AIService,
  ApplicationConfig,
  CompleteTextData,
  UserHttpService,
  UserSession,
} from '@/types';
import axios, { AxiosInstance } from 'axios';
import { emit, EventType, getTokenFromLocalStorage, invalidToken, saveRefreshTokenToLocalStorage } from '@/services/session';
import dayjs from 'dayjs';
import browser from 'webextension-polyfill';

export const AUTH_CALLBACK_PATH = '/auth/callback';
export const AUTH_CALLBACK_URL = `${window.location.origin}${AUTH_CALLBACK_PATH}`;

export class ClientServicesImpl implements UserHttpService, AIService {
  private baseClient: AxiosInstance;
  private gotrueClient: AxiosInstance;

  constructor(config: ApplicationConfig) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Client Config', config);
    }

    this.gotrueClient = axios.create({
      baseURL: config.gotrueUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.baseClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.baseClient.interceptors.request.use(
      async (config) => {
        const token = getTokenFromLocalStorage();
        if (!token) {
          // If no token, proceed with the request as is
          return config;
        }
 
        // Check if the token is expired
        const isExpired = dayjs().isAfter(dayjs.unix(token.expires_at));
        let access_token = token.access_token;
        const refresh_token = token.refresh_token;
        if (isExpired) {
          // If the token is expired, refresh it
          const newToken = await this.refreshToken(refresh_token);
          access_token = newToken?.access_token || '';
        }
  
        // If the token is valid, add it to the headers
        if (access_token) {
          Object.assign(config.headers, {
            Authorization: `Bearer ${access_token}`,
          });
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  

    this.baseClient.interceptors.response.use(async (response) => {
      const status = response.status;
      // Handle 401 Unauthorized status
      if (status === 401) {
        const token = getTokenFromLocalStorage();
          if (!token) {
          invalidToken();
          return response;
        }
  
        const refresh_token = token.refresh_token;
        try {
           // Attempt to refresh the token
          await this.refreshToken(refresh_token);
        } catch (e) {
          invalidToken();
        }
      }
      return response;
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
        emit(EventType.SESSION_REFRESH, refresh_token);

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

  @withSignIn()
  async signInGoogle(params: { redirectTo: string }): Promise<string> {
    const provider = 'google';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const accessType = 'offline';
    const prompt = 'consent';
    const baseURL = this.gotrueClient?.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}&access_type=${accessType}&prompt=${prompt}`;
    const redirectResult = await browser.identity.launchWebAuthFlow({
      url: url,
      interactive: true,
    });
    // FIXME: redirectResult failed with message: Authorization page could not be loaded.

    return redirectResult;

  }

  @withSignIn()
  async signInGithub(params: { redirectTo: string }): Promise<string> {
    const provider = 'github';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const baseURL = this.gotrueClient.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}`;
    const redirectResult = await browser.identity.launchWebAuthFlow({
      url: url,
      interactive: true,
    });

    return redirectResult;
  }

  @withSignIn()
  async signInDiscord(params: { redirectTo: string }): Promise<string> {
    const provider = 'discord';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const baseURL = this.gotrueClient.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}`;
    const redirectResult = await browser.identity.launchWebAuthFlow({
      url: url,
      interactive: true,
    });

    return redirectResult;
  }

  @withSignIn()
  async signInApple(params: { redirectTo: string }): Promise<string> {
    const provider = 'apple';
    const redirectTo = encodeURIComponent(params.redirectTo);
    const baseURL = this.gotrueClient.defaults.baseURL;
    const url = `${baseURL}/authorize?provider=${provider}&redirect_to=${redirectTo}`;
    const redirectResult = await browser.identity.launchWebAuthFlow({
      url: url,
      interactive: true,
    });

    return redirectResult;
  }

  async getCurrentUser() {
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

  async streamCompletionText(params: {
    workspaceId: string;
    data: CompleteTextData;
  }): Promise<ReadableStream<String>> {
    const url = `/api/ai/${params.workspaceId}/complete/stream`;
    try {
      const response = await this.baseClient.post(url, params.data, {
        responseType: 'stream',
      });
      const reader = response.data.getReader();
      const stream = new ReadableStream<string>({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Convert Uint8Array to string
            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
          }
          controller.close();
        },
      });

      return stream;
    } catch (error) {
      console.error('Error streaming completion text:', error);
      throw error;
    }
  }
}

export class UserSessionImpl implements UserSession {}

export function withSignIn() {
  return function (
    // eslint-disable-next-line
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line
    descriptor.value = async function (args: { redirectTo: string }) {
      try {
        await originalMethod.apply(this, [args]);
      } catch (e) {
        console.error(e);
        return Promise.reject(e);
      }
    };

    return descriptor;
  };
}
