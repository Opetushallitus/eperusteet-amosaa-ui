import { Computed } from '@shared/utils/interfaces';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Page } from '@shared/tyypit';

export interface IToteutussuunnitelmaProvider {
  opetussuunnitelmat: Computed<Page<OpetussuunnitelmaDto>>;
  updateQuery: (query: any) => Promise<void>;
}
