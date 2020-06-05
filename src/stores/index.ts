import { AikatauluStore } from './AikatauluStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { MuokkaustietoStore } from './MuokkaustietoStore';
import { OhjeetStore } from './OhjeetStore';
import { SisaltoViiteStore } from './SisaltoViiteStore';
import { ToteutussuunnitelmaStore } from './ToteutussuunnitelmaStore';
import { ToteutussuunnitelmaTiedotteetStore } from './ToteutussuunnitelmaTiedotteetStore';
import { ToteutussuunnitelmatStore } from './ToteutussuunnitelmatStore';
import { PerusteetStore } from './PerusteetStore';
import { TiedotteetStore } from './TiedotteetStore';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';

const toteutussuunnitelmaStore = new ToteutussuunnitelmaStore();
const toteutussuunnitelmatStore = new ToteutussuunnitelmatStore();
const toteutussuunnitelmaPohjatStore = new ToteutussuunnitelmatStore();
const tiedotteetStore = new TiedotteetStore();
const perusteetStore = new PerusteetStore();

const aikatauluStore = new AikatauluStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const sisaltoViiteStore = new SisaltoViiteStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const muokkaustietoStore = new MuokkaustietoStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const toteutussuunnitelmaTiedotteetStore = new ToteutussuunnitelmaTiedotteetStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const ohjeetStore = new OhjeetStore();

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
  toteutussuunnitelmaPohjatStore,
  tutoriaaliStore,
  tiedotteetStore,
  perusteetStore,
});
