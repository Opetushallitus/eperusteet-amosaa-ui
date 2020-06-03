<template>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { KayttajaStore } from '@/stores/kayttaja';
import { setItem, getItem } from '@shared/utils/localstorage';

@Component({})
export default class RouteLang extends Vue {
  
  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  mounted() {
    // Ohjataan käyttäjän koulutustoimijan etusivulle
    const koulutustoimijat = this.kayttajaStore?.koulutustoimijat?.value || null;

    const koulutustoimija = getItem('koulutustoimija');
    let koulutustoimijaId;
    if (koulutustoimija && _.includes(_.map(koulutustoimijat, 'id'), koulutustoimija)) {
      koulutustoimijaId = _.toString(koulutustoimija);
    } else {
      const id = koulutustoimijat![0].id;
      koulutustoimijaId = _.toString(id);
      setItem('koulutustoimija', id);
    }

    if(!_.isEmpty(koulutustoimijat)) {
      this.$router.replace({
        name: 'home',
        params: {
          lang: 'fi',
          koulutustoimijaId,
        },
      });
    }
  }

}
</script>

