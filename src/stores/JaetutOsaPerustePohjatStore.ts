import { PerusteDto, Perusteet } from '@shared/api/amosaa';
import { computed } from 'vue';
import { reactive } from 'vue';

export class JaetutOsaPerustePohjatStore {
  private state = reactive({
    jaetutOsatPohjat: null as PerusteDto[] | null,
  });

  public readonly jaetutOsatPohjat = computed(() => this.state.jaetutOsatPohjat);

  public async fetch() {
    this.state.jaetutOsatPohjat = (await Perusteet.getJaettujenOsienPohjat()).data;
  }
}
