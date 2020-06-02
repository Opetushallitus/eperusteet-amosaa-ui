import { Kielet } from '@shared/stores/kieli';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { OhjeetStore } from './OhjeetStore';
import { ToteutussuunnitelmatStore } from './ToteutussuunnitelmatStore';
import { AikatauluStore } from './AikatauluStore';
import { ToteutussuunnitelmaStore } from './ToteutussuunnitelmaStore';
import { SisaltoViiteStore } from './SisaltoViiteStore';
import { MuokkaustietoStore } from './MuokkaustietoStore';
import { ToteutussuunnitelmaTiedotteetStore } from './ToteutussuunnitelmaTiedotteetStore';

const ohjeetStore = new OhjeetStore();
const toteutussuunnitelmatStore = new ToteutussuunnitelmatStore();
const toteutussuunnitelmaStore = new ToteutussuunnitelmaStore();
const aikatauluStore = new AikatauluStore();
const sisaltoViiteStore = new SisaltoViiteStore();
const muokkaustietoStore = new MuokkaustietoStore();
const toteutussuunnitelmaTiedotteetStore = new ToteutussuunnitelmaTiedotteetStore();

export const stores = Object.freeze({
  kieliStore: Kielet,
  tutoriaaliStore,
  ohjeetStore,
  toteutussuunnitelmatStore,
  aikatauluStore,
  toteutussuunnitelmaStore,
  sisaltoViiteStore,
  muokkaustietoStore,
  toteutussuunnitelmaTiedotteetStore,
});
