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
  signInGoogle: () => Promise<void>;
  signInGithub: (params: { redirectTo: string }) => Promise<void>;
  signInDiscord: (params: { redirectTo: string }) => Promise<void>;
  signInApple: (params: { redirectTo: string }) => Promise<void>;
  getCurrentUser: () => Promise<User>;
}

export interface UserSession {
  getRedirectTo: () => string | null;
  setRedirectTo: (redirectTo: string) => void;
  clearRedirectTo: () => void;
}
