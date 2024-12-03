interface NavigatorExtended extends Navigator {
  brave?: {
    isBrave: () => Promise<boolean>;
  };
}

export async function detectBrowser(): Promise<
  | 'chrome'
  | 'firefox'
  | 'firefox-mobile'
  | 'brave'
  | 'edge'
  | 'safari'
  | 'mobile-safari'
  | 'other'
> {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('firefox')) {
    return userAgent.includes('mobile') ? 'firefox-mobile' : 'firefox';
  } else if (userAgent.indexOf('edg/') > -1) {
    return 'edge';
  } else if (userAgent.indexOf('chrome') > -1) {
    // Check for Brave
    const nav = navigator as NavigatorExtended;
    if (nav.brave && (await nav.brave.isBrave())) {
      return 'brave';
    }
    return 'chrome';
  } else if (userAgent.includes('safari')) {
    if (userAgent.includes('mobile') || userAgent.includes('iphone')) {
      return 'mobile-safari';
    }
    return 'safari';
  } else {
    return 'other';
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
