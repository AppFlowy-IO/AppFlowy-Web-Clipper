interface NavigatorExtended extends Navigator {
  brave?: {
    isBrave: () => Promise<boolean>;
  };
}

function isIPad(): boolean {
  return (
    navigator.userAgent.includes('iPad') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export async function detectBrowser(): Promise<
  | 'chrome'
  | 'firefox'
  | 'firefox-mobile'
  | 'brave'
  | 'edge'
  | 'safari'
  | 'mobile-safari'
  | 'ipad-os'
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
    if (isIPad()) {
      return 'ipad-os';
    } else if (userAgent.includes('mobile') || userAgent.includes('iphone')) {
      return 'mobile-safari';
    }
    return 'safari';
  } else {
    return 'other';
  }
}
