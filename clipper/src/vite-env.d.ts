/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite-plugin-terminal/client" />

interface Window {
  refresh_token: (token: string) => void;
  invalid_token: () => void;
  WebFont?: {
    load: (options: { google: { families: string[] } }) => void;
  };
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (props: any) => void;
    clear: () => void;
    default: (message: string) => void;
    warning: (message: string) => void;
  };

  Prism: {
    tokenize: (text: string, grammar: Prism.Grammar) => Prism.Token[];
    languages: Record<string, Prism.Grammar>;
    plugins: {
      autoloader: {
        languages_path: string;
      };
    };
  };
  hljs: {
    highlightAuto: (code: string) => { language: string };
  };
}
