import { Computed } from '@shared/utils/interfaces';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Page } from '@shared/tyypit';
import { Toteutus } from '@shared/utils/perusteet';

export interface IToteutussuunnitelmaProvider {
  opetussuunnitelmat: Computed<Page<OpetussuunnitelmaDto>>;
  updateQuery: (koulutustoimijaId: number, toteutus: Toteutus, query: any) => void;
}
