import { storage } from 'webextension-polyfill';

console.log('[content] loaded ');
console.log('[content] tokens ', localStorage.tokens);

async function main() {
  let storage_data: any = await storage.local.get({
    auth_flow_active: true,
  });
  console.log('storage_data', storage_data);
}
main();

export {};
