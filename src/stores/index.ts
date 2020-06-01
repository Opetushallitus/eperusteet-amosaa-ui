import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';

export const stores = Object.freeze({
  kayttajaStore: Kayttajat,
  kieliStore: Kielet,
  tutoriaaliStore,
});
