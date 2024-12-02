export interface User {
  email: string | null;
  name: string | null;
  uid: string;
  avatar: string | null;
  uuid: string;
  latestWorkspaceId: string;
}

export interface UserHttpService {
  loginAuth: (url: string) => Promise<void>;
  signInMagicLink: (params: {
    email: string;
    redirectTo: string;
  }) => Promise<void>;
  signInGoogle: (params: { redirectTo: string }) => Promise<string>;
  signInGithub: (params: { redirectTo: string }) => Promise<string>;
  signInDiscord: (params: { redirectTo: string }) => Promise<string>;
  signInApple: (params: { redirectTo: string }) => Promise<string>;
  getCurrentUser: () => Promise<User>;
}

export interface UserSession {}
