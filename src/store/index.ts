import { Kielet } from '@shared/stores/kieli';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { OhjeetStore } from './OhjeetStore';

const ohjeetStore = new OhjeetStore();

export const stores = Object.freeze({
  kieliStore: Kielet,
  tutoriaaliStore,
  ohjeetStore,
});
