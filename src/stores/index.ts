import { AikatauluStore } from './AikatauluStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { MuokkaustietoStore } from './MuokkaustietoStore';
import { OhjeetStore } from './OhjeetStore';
import { ToteutussuunnitelmaStore } from './ToteutussuunnitelmaStore';
import { ToteutussuunnitelmaTiedotteetStore } from './ToteutussuunnitelmaTiedotteetStore';
import { ToteutussuunnitelmatStore } from './ToteutussuunnitelmatStore';
import { PerusteetStore } from './PerusteetStore';
import { TiedotteetStore } from './TiedotteetStore';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import { PoistetutStore } from '@/stores/PoistetutStore';
import { YhteisetOsuudetStore } from '@/stores/YhteisetOsuudetStore';
import { OphPohjatStore } from '@/stores/OphPohjatStore';
import { KayttoOikeudetStore } from '@/stores/KayttoOikeudetStore';
import { PohjanTutkinnonosatStore } from '@/stores/PohjanTutkinnonosatStore';
import { OpetussuunnitelmaPohjatStore } from '@/stores/OpetussuunnitelmaPohjatStore';
import { OphOpsPohjatStore } from './OphOpsPohjatStore';
import { OpetussuunnitelmatStore } from './OpetussuunnitelmatStore';

const toteutussuunnitelmaStore = new ToteutussuunnitelmaStore();
const toteutussuunnitelmatStore = new ToteutussuunnitelmatStore();
const yhteisetOsuudetStore = new YhteisetOsuudetStore();
const toteutussuunnitelmaPohjatStore = new ToteutussuunnitelmatStore();
const tiedotteetStore = new TiedotteetStore();
const perusteetStore = new PerusteetStore();
const ophPohjatStore = new OphPohjatStore();
const ophOpsPohjatStore = new OphOpsPohjatStore();

const aikatauluStore = new AikatauluStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const muokkaustietoStore = new MuokkaustietoStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const toteutussuunnitelmaTiedotteetStore = new ToteutussuunnitelmaTiedotteetStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const poistetutStore = new PoistetutStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const kayttoOikeudetStore = new KayttoOikeudetStore(toteutussuunnitelmaStore.toteutussuunnitelma);
const ohjeetStore = new OhjeetStore();
const tutkinnonosatTuontiStore = new TutkinnonosatTuontiStore();
const paivitettavatJaSiirrettavatTotsStore = new PaivitettavatJaSiirrettavatTotsStore();
const pohjanTutkinnonosatStore = new PohjanTutkinnonosatStore();
const opetussuunnitelmaPohjatStore = new OpetussuunnitelmaPohjatStore();
const opetussuunnitelmatStore = new OpetussuunnitelmatStore();

export const stores = Object.freeze({
  aikatauluStore,
  kayttajaStore: Kayttajat,
  kieliStore: Kielet,
  muokkaustietoStore,
  ohjeetStore,
  toteutussuunnitelmaStore,
  toteutussuunnitelmaTiedotteetStore,
  toteutussuunnitelmatStore,
  toteutussuunnitelmaPohjatStore,
  tutoriaaliStore,
  tiedotteetStore,
  perusteetStore,
  tutkinnonosatTuontiStore,
  paivitettavatJaSiirrettavatTotsStore,
  poistetutStore,
  yhteisetOsuudetStore,
  ophPohjatStore,
  ophOpsPohjatStore,
  kayttoOikeudetStore,
  pohjanTutkinnonosatStore,
  opetussuunnitelmaPohjatStore,
  opetussuunnitelmatStore,
});
