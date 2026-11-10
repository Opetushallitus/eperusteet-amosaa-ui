import _ from 'lodash';
import { Validointi } from '@shared/api/amosaa';

const KATEGORIAT_ETULIITTEELLA = ['opetussuunnitelma', 'toteutussuunnitelma'];

export function validointiKuvausAvain(kategoria?: string, kuvaus?: string) {
  const avain = _.toLower(kategoria);
  if (kuvaus && _.includes(KATEGORIAT_ETULIITTEELLA, avain)) {
    return `${avain}-${kuvaus}`;
  }

  return kuvaus;
}

export function mapValidointiKohdat<T extends { kuvaus?: string }>(kategoria: string | undefined, kohdat: T[] | null | undefined) {
  return _.map(kohdat, kohta => ({
    ...kohta,
    kuvaus: validointiKuvausAvain(kategoria, kohta.kuvaus),
  }));
}

export function flatValidointiKuvaukset(validoinnit: Validointi[] | null | undefined, kentta: 'virheet' | 'huomautukset' | 'huomiot') {
  return _.flatMap(validoinnit, validointi => _.map(validointi[kentta], virhe => validointiKuvausAvain(validointi.kategoria, virhe.kuvaus)));
}
