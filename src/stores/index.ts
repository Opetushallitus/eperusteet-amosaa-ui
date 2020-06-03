import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { OhjeetStore } from './OhjeetStore';
import { ToteutussuunnitelmatStore } from './ToteutussuunnitelmatStore';

const ohjeetStore = new OhjeetStore();
const toteutussuunnitelmatStore = new ToteutussuunnitelmatStore();

export const stores = Object.freeze({
  kayttajaStore: Kayttajat,
  kieliStore: Kielet,
  tutoriaaliStore,
  ohjeetStore,
  toteutussuunnitelmatStore,
});
