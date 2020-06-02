import { AikatauluStore } from './AikatauluStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { MuokkaustietoStore } from './MuokkaustietoStore';
import { OhjeetStore } from './OhjeetStore';
import { SisaltoViiteStore } from './SisaltoViiteStore';
import { ToteutussuunnitelmaStore } from './ToteutussuunnitelmaStore';
import { ToteutussuunnitelmaTiedotteetStore } from './ToteutussuunnitelmaTiedotteetStore';
import { ToteutussuunnitelmatStore } from './ToteutussuunnitelmatStore';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';

const aikatauluStore = new AikatauluStore();
const muokkaustietoStore = new MuokkaustietoStore();
const ohjeetStore = new OhjeetStore();
const sisaltoViiteStore = new SisaltoViiteStore();
const toteutussuunnitelmaStore = new ToteutussuunnitelmaStore();
const toteutussuunnitelmaTiedotteetStore = new ToteutussuunnitelmaTiedotteetStore();
const toteutussuunnitelmatStore = new ToteutussuunnitelmatStore();

export const stores = Object.freeze({
  aikatauluStore,
  kayttajaStore: Kayttajat,
  kieliStore: Kielet,
  muokkaustietoStore,
  ohjeetStore,
  sisaltoViiteStore,
  toteutussuunnitelmaStore,
  toteutussuunnitelmaTiedotteetStore,
  toteutussuunnitelmatStore,
  tutoriaaliStore,
});
