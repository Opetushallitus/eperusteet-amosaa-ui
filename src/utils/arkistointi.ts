import { Opetussuunnitelmat } from '@shared/api/amosaa';

export async function arkistoiOpetussuunnitelma(el, meta) {
  const arkistoi = await el.$bvModal.msgBoxConfirm(el.$t(meta.confirm) as any, {
    title: el.$t(meta.title),
    okVariant: 'primary',
    okTitle: el.$t('kylla') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (arkistoi) {
    try {
      await Opetussuunnitelmat.updateOpetussuunnitelmaTila(el.$route.params.toteutussuunnitelmaId as number, 'POISTETTU', el.$route.params.koulutustoimijaId);
      el.$router.push({
        name: meta.reroute,
      });
      el.$success(el.$t('arkistoi-suunnitelma-onnistui'));
    }
    catch (e) {
      el.$fail(el.$t('arkistointi-epaonnistui'));
    }
  }
}
