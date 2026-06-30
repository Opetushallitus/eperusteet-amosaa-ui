import { tileColors } from '@shared/utils/bannerIcons';

const FALLBACK_TOTEUTUS = 'ammatillinen';

function normalizeToteutusParam(toteutus: string | string[] | undefined): string {
  const raw = Array.isArray(toteutus) ? toteutus[0] : toteutus;
  return (raw && String(raw)) || FALLBACK_TOTEUTUS;
}

/**
 * PrimeVue primary tokens must be updated at runtime; SCSS $primary-color is build-time only.
 * Apply on the document root so teleported overlays inherit the same theme.
 */
export function applyToteutusPrimePrimaryTheme(toteutus: string | string[] | undefined) {
  const key = normalizeToteutusParam(toteutus);
  const pair = (key in tileColors ? tileColors[key as keyof typeof tileColors] : null)
    ?? tileColors[FALLBACK_TOTEUTUS];
  const [primary, hover] = pair;
  const root = document.documentElement;
  root.style.setProperty('--p-primary-color', primary, 'important');
  root.style.setProperty('--p-primary-hover-color', hover, 'important');
  root.style.setProperty('--p-primary-active-color', hover, 'important');
}
