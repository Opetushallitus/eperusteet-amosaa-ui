import { Kielet } from '@shared/stores/kieli';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { OhjeetStore } from './OhjeetStore';
import { ToteutussuunnitelmatStore } from './ToteutussuunnitelmatStore';

const ohjeetStore = new OhjeetStore();
const toteutussuunnitelmatStore = new ToteutussuunnitelmatStore();

export const stores = Object.freeze({
  kieliStore: Kielet,
  tutoriaaliStore,
  ohjeetStore,
  toteutussuunnitelmatStore,
});
