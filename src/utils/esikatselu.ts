import { Kielet } from '@shared/stores/kieli';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';

export function buildOpetussuunnitelmaEsikatseluUrl(toteutussuunnitelma, toteutus) {
  return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/toteutussuunnitelma/${toteutussuunnitelma.id}`, `/${esikatselutoteutus(toteutussuunnitelma, toteutus)}`);
}

function esikatselutoteutus(toteutussuunnitelma, toteutus) {
  if (toteutussuunnitelma.jotpatyyppi === 'MUU') {
    return 'muukoulutus';
  }

  return toteutus;
}
