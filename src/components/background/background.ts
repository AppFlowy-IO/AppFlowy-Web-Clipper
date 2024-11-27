import { runtime } from 'webextension-polyfill';

runtime.onInstalled.addListener(() => {
  console.log('[background] loaded ');
});

export {};
