export const LS_STORE_SLUG = "superhost-reply-suite";
export const LS_PRODUCT_ID = "1130240";
export const LS_CHECKOUT_URL = `https://${LS_STORE_SLUG}.lemonsqueezy.com/buy/${LS_PRODUCT_ID}`;

export const TRIAL_DAYS = 3;
export const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;
export const STORAGE_KEY = "srs_trial_start";

export function getTrialStart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseInt(raw, 10);
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    return now;
  } catch { return Date.now(); }
}

export function getTrialDaysRemaining() {
  const start = getTrialStart();
  const elapsed = Date.now() - start;
  const remaining = Math.ceil((TRIAL_MS - elapsed) / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

export function isPaywalled() {
  return getTrialDaysRemaining() === 0;
}
